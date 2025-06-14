import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    googleId : {
        type : String,
        required : true,
    },
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
    },
    picture : {
        type : String,
        requied : true,
    },
    papers_shared : {
        type : [Schema.ObjectId],
    }
});

export default mongoose.model('Users',userSchema);