const express = require('express');
const multer = require('multer');
const handleUpload = require('../helpers/cloudinary_helper');
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer(storage);
const router = express.Router();

router.get('/',(req,res)=>{
    console.log(process.env.CLOUDINARY_CLOUD_NAME);
    res.send('hahaha');
})

router.post('/',upload.single('file'), async(req,res,next)=>{
    try{
        const encodedDatab64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + encodedDatab64;
        const cldRes = await handleUpload(dataURI);
        console.log('upload successful!');
        res.json(cldRes);
    }
    catch(err){
        console.log(err);
    }
})

module.exports = router;