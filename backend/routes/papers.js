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
const upload = multer({ storage });
const router = express.Router();
const indexPath = resolve("./faiss_data");

//upload form -> send pdf to cloudinary, store metadata in papers and users collection
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) throw new Error('No file uploaded');
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
            path: cldRes.secure_url,
            tags: (metadata.keywords || '').split(','),
            cloudinaryPublicId : cldRes.public_id,
        });
        console.log('new paper created!');
        await users.updateOne({ googleId: req.user.sub }, { $push: { papers_shared: newPaper._id } });
        res.status(200).send('Paper Uploaded Successfully!')
    }
    catch (err) {
        res.status(400).send(err.message);
    }
})

//get all documents
router.get('/', async (req, res) => {
    try {
        const paperDocs = await papers.find({});
        res.status(200).send(paperDocs);
    } catch (err) {
        res.status(400).send(err.message);
    }
})

//get a single document
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const paperDoc = await papers.findById(id);
        res.status(200).send(paperDoc);
    } catch (err) {
        res.status(400).send(err.message);
    }
})

//delete a single document -> also deletes faiss vector store entry and cloudinary link
router.delete('/:id', async (req,res) => {
    try{
        const id = req.params.id;
        const paperDoc = await papers.findOneAndDelete({_id : id});
        if (!paperDoc) throw new Error('Paper not found');
        const cldPublicId = paperDoc.cloudinaryPublicId;
        await handleDelete(cldPublicId);

        await users.updateOne({ googleId: req.user.sub }, { $pull: { papers_shared: paperDoc._id } });
        const curPaperFaiss = join(indexPath,id);
        await fs.rm(curPaperFaiss, { recursive: true, force: true });
        res.status(200).send("delete successfull");
    }
    catch(err){
        res.status(400).send(err.message);
    }
})

export default router;