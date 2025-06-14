import express from 'express';
import multer from 'multer';
import papers from '../models/paperModel.js';
import users from '../models/userModel.js';
import { handleUpload, handleDelete } from '../helpers/cloudinary_helper.js';
import fs from 'fs/promises';
import {join, resolve} from 'path';

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const storage = multer.memoryStorage();
const upload = multer(storage);
const router = express.Router();
const indexPath = resolve("./faiss_data");

//upload form -> send pdf to cloudinary, store metadata in papers and users collection
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

//delete a single document -> also deletes faiss vector store entry and cloudinary link
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
        const curPaperFaiss = join(indexPath,id);
        await fs.rm(curPaperFaiss, { recursive: true, force: true });
        res.status(200).send("delete successfull");
    }
    catch(err){
        res.status(400).send(err);
    }
})

export default router;