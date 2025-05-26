const express = require('express');
const papers = require('../models/paperModel');
const mongoose = require('mongoose');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

require('dotenv').config();

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

        const prompt=`summarize this text : ${fullText}`;
        const result=await Model.generateContent(prompt);
        summary=result.response.text();
        console.log(summary)
        res.json({ summary });
        
    }catch(err){
        console.log(err.message);
    }
})

module.exports = router;