import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    authors : {
        type : [String],
        required : true,
    },
    publish_date : {
        type : Date,
        required : true,
    },
    tags : {
        type : [String]
    },
    path : {
        type : String,
        required : true,
    },
    cloudinaryPublicId : {
        type : String,
        required : true,
    },
},{timestamps : true});

export default mongoose.model('Papers', paperSchema);