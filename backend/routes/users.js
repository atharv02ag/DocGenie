import express from 'express';
import users from '../models/userModel.js';

const router = express.Router();

//get currently logged in user (passed on to the request)
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

export default router;