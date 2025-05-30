const express = require('express');
const multer = require('multer');
const papers = require('../models/paperModel');
const mongoose = require('mongoose');
const handleUpload = require('../helpers/cloudinary_helper');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer(storage);
const router = express.Router();
const gemini_api_key = process.env.API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const Model = googleAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

router.get('/:id',async(req,res)=>{
    try{
        const id = req.params.id;
        const paper = await papers.findById(id);
        const cloudinaryUrl = paper.path;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid MongoDB ObjectId format' });
        }
        if (!cloudinaryUrl || !cloudinaryUrl.startsWith('http')) {
            return res.status(400).json({ error: 'Invalid or missing Cloudinary URL' });
        }
        const pdfResponse = await axios.get(cloudinaryUrl, { responseType: 'stream' });
        //console.log(pdfResponse);

        const tempPath = path.join(__dirname, 'temp.pdf');
        console.log(tempPath);
        const writer = fs.createWriteStream(tempPath);
            await new Promise((resolve, reject) => {
              pdfResponse.data.pipe(writer);
              writer.on('finish', resolve);
              writer.on('error', reject);
            });

        const pdfBuffer = await fsPromises.readFile(tempPath);
        const { text: fullText } = await pdfParse(pdfBuffer);

        const prompt=`I want you to summarize this text in a well structured manner dont make the summary too small.Generate comprehensive yet 
        concise summary and Identify and highlight key findings, methodologies, and conclusions and present the paper's core contributions clearly.
        Also can you directly make the headings bold from your side. 1:Introduction, 2:Summary divided into paragraphs, 3:highlight key findings,
        methodologies,4:conclusions and present the paper's core contributions clearly, do not violate the order or format.
        After writing the summary, Score papers based on multiple factors (writing quality, methodology, adherence to academic standards)
        Provide detailed feedback on areas of improvement
        Suggest specific changes to enhance the paper's quality
        Identify potential issues with citations, statistical methods, or experimental design.
        leave a line after every paragraph and new heading.
        Use <br>  wherever you need to leave a line.
        DO NOT FORGET THE <br>.
        : ${fullText}`;
        const result=await Model.generateContent(prompt);
        summary=result.response.text();
        console.log(summary)
        res.json({ summary });
        
    }catch(err){
        console.log(err.message);
    }
})

module.exports = router;