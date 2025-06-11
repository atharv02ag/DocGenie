const express = require('express');
const papers = require('../models/paperModel');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');

require('dotenv').config();

const router = express.Router();
const gemini_api_key = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: gemini_api_key });

router.get('/:id',async(req,res)=>{
    try{
        const id = req.params.id;
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

        const pdfBuffer = Buffer.from(pdfResponse);
        const pdfBase64 = pdfBuffer.toString('base64');

        const prompt= `I want you to summarize this text in a well structured manner dont make the summary too small.Generate comprehensive yet 
        concise summary and Identify and highlight key findings, methodologies, and conclusions and present the paper's core contributions clearly.
        Also can you directly make the headings bold from your side. 1:Introduction, 2:Summary divided into paragraphs, 3:highlight key findings,
        methodologies,4:conclusions and present the paper's core contributions clearly, do not violate the order or format.
        After writing the summary, Score papers based on multiple factors (writing quality, methodology, adherence to academic standards)
        Provide detailed feedback on areas of improvement
        Suggest specific changes to enhance the paper's quality
        Identify potential issues with citations, statistical methods, or experimental design.
        leave a line after every paragraph and new heading.
        Use <br>  wherever you need to leave a line.
        DO NOT FORGET THE <br>.`;

        const contents = [{
            text : prompt
        },
        {
            inlineData: {
                mimeType: 'application/pdf',
                data: pdfBase64,
            }
        }];

        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash", 
            contents : contents
        });

        const summary = result.text;
        res.json({ summary });
        
    }catch(err){
        console.log(err);
        res.status(400).send(err);
    }
})

module.exports = router;