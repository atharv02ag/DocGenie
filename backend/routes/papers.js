const express = require('express');
const multer = require('multer');
const papers = require('../models/paperModel');
const mongoose = require('mongoose');
const handleUpload = require('../helpers/cloudinary_helper');
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer(storage);
const router = express.Router();

//upload form
router.post('/',upload.single('file'), async(req,res,next)=>{
    try{
        const encodedDatab64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + encodedDatab64;
        const cldRes = await handleUpload(dataURI);
        console.log('upload successful!');
        const metadata = JSON.parse(req.body.metadata);
        console.log(metadata);
        const newPaper = await papers.create({title : metadata.title, 
                                              publish_date : metadata.publicationDate, 
                                              authors : metadata.authors.split(',') ,
                                              path : cldRes.url,
                                              tags : metadata.keywords.split(','),
                                             });
        console.log('new paper created!');
        res.status(200).send('Paper Uploaded Successfully!')
    }
    catch(err){
        console.log(err);
    }
})

//get all documents
router.get('/',async(req,res)=>{
    try{
        const paperDocs = await papers.find({});
        res.status(200).send(paperDocs);
    }catch(err){
        console.log(err.message);
    }
})

module.exports = router;