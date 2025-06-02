const express = require('express');
const users = require('../models/userModel.js');

const router = express.Router();

router.get('/',async(req,res)=>{
    const id = req.user.sub;
    try{
        const user = await users.findOne({googleId : id});
        res.status(200).json(user);
    }
    catch(err){
        res.status(400).send(err);
    }
})

module.exports = router;