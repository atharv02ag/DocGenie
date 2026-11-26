import express from 'express';
import mongoose from 'mongoose';
import papers from '../models/paperModel.js';
import {GoogleGenAI} from '@google/genai';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import dotenv from 'dotenv';
import {join, resolve} from 'path';
import fs from 'fs';
import { storeTextInVectorDB, retrieveDocs, loadVectorStoreIfExists } from '../helpers/vector_store.js';
dotenv.config({ path: './.env' });

const router = express.Router();
const gemini_api_key = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: gemini_api_key });

const indexPath = resolve("./faiss_data");

// gemini-1.5-flash was retired; override with GEMINI_MODEL in .env if needed
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-flash-lite-latest";

// Gemini regularly returns 503 "high demand" / 429 errors; retry once on another model
// and give the user something readable if that fails too.
async function generate(contents) {
    for (const model of [GEMINI_MODEL, FALLBACK_MODEL]) {
        try {
            const result = await ai.models.generateContent({ model, contents });
            return result.text;
        } catch (err) {
            if (!/status: (503|429)/.test(err.message)) throw err;
            console.log(`${model} unavailable, ${model === FALLBACK_MODEL ? 'giving up' : 'trying fallback'}`);
        }
    }
    throw new Error('The AI model is overloaded right now. Please try again in a minute.');
}

// loads the paper's vector store from disk, or builds it from the PDF on cloudinary
async function getVectorStore(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid MongoDB ObjectId format');
    }

    const existing = await loadVectorStoreIfExists(id);
    if (existing) return existing;

    const paper = await papers.findById(id);
    if (!paper) {
        throw new Error('Paper not found');
    }
    const cloudinaryUrl = paper.path;
    if (!cloudinaryUrl || !cloudinaryUrl.startsWith('http')) {
        throw new Error('Invalid or missing Cloudinary URL');
    }

    const response = await fetch(cloudinaryUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch PDF (${response.status})`);
    }
    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    console.log("pdf fetched..");

    const pdfParsed = await pdf(pdfBuffer);

    console.log("pdf parsed..");

    const vectorStore = await storeTextInVectorDB(pdfParsed.text,id);

    console.log("pdf stored in vector store..");
    return vectorStore;
}

router.get('/:id',async(req,res)=>{
    try{
        const id = req.params.id;
        
        await getVectorStore(id);

        const prompt= `I want you to summarize this text in a well structured manner dont make the summary too small.Generate comprehensive yet 
        concise summary and Identify and highlight key findings, methodologies, and conclusions and present the paper's core contributions clearly.
        Also can you directly make the headings bold from your side. 1:Introduction, 2:Summary divided into paragraphs, 3:highlight key findings,
        methodologies,4:conclusions and present the paper's core contributions clearly, do not violate the order or format.
        After writing the summary, Score papers based on multiple factors (writing quality, methodology, adherence to academic standards) each on a score out of 10
        Provide detailed feedback on areas of improvement
        Suggest specific changes to enhance the paper's quality
        Identify potential issues with citations, statistical methods, or experimental design.
        leave a line after every paragraph and new heading.
        Use <br>  wherever you need to leave a line.
        DO NOT FORGET THE <br>.`;

        const curPaperPath = join(indexPath,id,'docstore.json');
        const data = JSON.parse(fs.readFileSync(curPaperPath, 'utf-8'));
        let context = '';
        data[0].forEach((item)=>{
            context = context + item[1].pageContent;
        });
        context = context.replace(/\n/g, ' ');

        const contents = `Use the following context to answer:\n${context} Question: ${prompt}`;

        const summary = await generate(contents);
        res.json({ summary });
        
    }catch(err){
        console.log(err);
        res.status(400).send(err.message);
    }
})

router.post('/:id',express.text(), async (req,res)=>{
    const id = req.params.id;
    const question = req.body;
    try{
        const vectorStore = await getVectorStore(id);

        const contextObj = await retrieveDocs(vectorStore, question);

        console.log("received relevent embeddings..");

        let context = '';
        contextObj.forEach((item)=>{
            context = context + item.pageContent + ' [...] ';
        })
        context = context.replace(/\n/g, ' ');

        const prompt = `Use the following context to answer the question. 
        You may use knowledge of your own to answer in detail, but stick to the context provided.
        Dont exceed 6 sentences:\n\n${context}\nQuestion: ${question}`;
        
        const answer = await generate(prompt);
        res.json({ answer });

    }
    catch(err){
        console.log(err);
        res.status(400).send(err.message);
    }
})

export default router;