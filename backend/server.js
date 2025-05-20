const app = require('express')();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

//routes
const uploadRoutes = require('./routes/upload.js');

const PORT = 8000;

app.use(cors());

app.use('/api/upload',uploadRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT,()=>{
            console.log('listening to port',PORT);
        });
    })
    .catch((err)=>{
        console.log(err.message);
    });
