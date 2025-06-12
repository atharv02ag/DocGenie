// const cloudinary = require("cloudinary").v2;
// require('dotenv').config();
import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure : true,
});

async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return res;
}

async function handleDelete(publicId) {
  await cloudinary.uploader.destroy(publicId, {invalidate : true} , (error, result)=>{
    console.log(result, error);
  });
}

export {handleUpload, handleDelete};
