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

router.get('/:id',async(req,res)=>{
    try{
        const id = req.params.id;
        
        const success = await loadVectorStoreIfExists(id);

        if(!success){

            const paper = await papers.findById(id);
            const cloudinaryUrl = paper.path;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid MongoDB ObjectId format');
            }
            if (!cloudinaryUrl || !cloudinaryUrl.startsWith('http')) {
                throw new Error('Invalid or missing Cloudinary URL');
            }
    
            const pdfResponse = await fetch(cloudinaryUrl)
            .then((response) => response.arrayBuffer());

            console.log("pdf fetched..");

            const pdfParsed = await pdf(pdfResponse);

            console.log("pdf parsed..");

            await storeTextInVectorDB(pdfParsed.text,id);

            console.log("pdf stored in vector store..");
        }

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

        const result = await ai.models.generateContent({
            model : "gemini-1.5-flash",
            contents : contents,
        });

        const summary = result.text;
        res.json({ summary });
        
    }catch(err){
        console.log(err);
        res.status(400).send(err);
    }
})

router.post('/:id',express.text(), async (req,res)=>{
    const id = req.params.id;
    const question = req.body;
    try{
        const success = await loadVectorStoreIfExists(id);
        if(!success){
            const paper = await papers.findById(id);
            const cloudinaryUrl = paper.path;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid MongoDB ObjectId format');
            }
            if (!cloudinaryUrl || !cloudinaryUrl.startsWith('http')) {
                throw new Error('Invalid or missing Cloudinary URL');
            }
    
            const pdfResponse = await fetch(cloudinaryUrl)
            .then((response) => response.arrayBuffer());

            console.log("pdf fetched...")

            const pdfParsed = await pdf(pdfResponse);

            console.log("pdf parsed...");

            await storeTextInVectorDB(pdfParsed.text,id);

            console.log("pdf stored in vector store..");
        }

        await loadVectorStoreIfExists(id);

        const contextObj = await retrieveDocs(question);

        console.log("received relevent embeddings..");

        let context = '';
        contextObj.forEach((item)=>{
            context = context + item.pageContent;
        })
        context = context.replace(/\n/g, ' ');

        const prompt = `Use the following context to answer the question. 
        You may use knowledge of your own to answer in detail, but stick to the context provided.
        Dont exceed 6 sentences:\n\n${context}\nQuestion: ${question}`;
        
        const result = await ai.models.generateContent({
            model : "gemini-1.5-flash",
            contents : prompt,
        });

        const answer = result.text;
        res.json({ answer });

    }
    catch(err){
        console.log(err);
        res.status(400).send(err);
    }
})

export default router;