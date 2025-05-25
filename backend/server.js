const app = require('express')();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

//routes
const paperRoutes = require('./routes/papers.js');
const insightRoutes = require('./routes/insights.js');

const PORT = 8000;

app.use(cors());

app.use('/api/papers',paperRoutes);
app.use('/api/insights',insightRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT,()=>{
            console.log('listening to port',PORT);
        });
    })
    .catch((err)=>{
        console.log(err.message);
    });
