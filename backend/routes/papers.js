const express = require('express');
const multer = require('multer');
const papers = require('../models/paperModel');
const users = require('../models/userModel');
const {handleUpload, handleDelete} = require('../helpers/cloudinary_helper');
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer(storage);
const router = express.Router();
const pdfParse = require("pdf-parse");
const fs = require("fs");
const Paper = require("../models/paperModel");

//upload form
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        const encodedDatab64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + encodedDatab64;
        const cldRes = await handleUpload(dataURI);
        console.log(cldRes);
        console.log('upload successful!');
        const metadata = JSON.parse(req.body.metadata);
        console.log(metadata);
        const newPaper = await papers.create({
            title: metadata.title,
            publish_date: metadata.publicationDate,
            authors: metadata.authors.split(','),
            path: cldRes.url,
            tags: metadata.keywords.split(','),
            cloudinaryPublicId : cldRes.public_id,
        });
        const buffer = req.file.buffer;
        const data = await pdfParse(buffer);
        newPaper.content = data.text;
        await newPaper.save();
        console.log('new paper created!');
        const doc = await users.findOne({ googleId: req.user.sub });
        let curUserPapers = [...doc.papers_shared, newPaper._id];
        await users.updateOne({ googleId: req.user.sub }, { papers_shared: curUserPapers });
        res.status(200).send('Paper Uploaded Successfully!')
    }
    catch (err) {
        res.status(400).send(err);
    }
})

//get all documents
router.get('/', async (req, res) => {
    try {
        const paperDocs = await papers.find({});
        res.status(200).send(paperDocs);
    } catch (err) {
        res.status(400).send(err);
    }
})

//get a single document
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const paperDoc = await papers.findById(id);
        res.status(200).send(paperDoc);
    } catch (err) {
        res.status(400).send(err);
    }
})

//delete a single document
router.delete('/:id', async (req,res) => {
    try{
        const id = req.params.id;
        const paperDoc = await papers.findOneAndDelete({_id : id});
        const cldPublicId = paperDoc.cloudinaryPublicId;
        await handleDelete(cldPublicId);

        const doc = await users.findOne({ googleId: req.user.sub });
        let curUserPapers = doc.papers_shared.filter((item) => item != id);
        console.log(curUserPapers);
        await users.updateOne({ googleId: req.user.sub }, { papers_shared: curUserPapers });

        res.status(200).send("delete successfull");
    }
    catch(err){
        res.status(400).send(err);
    }
})

module.exports = router;