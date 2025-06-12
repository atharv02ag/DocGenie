// const app = require('express')();
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const authenticate = require('./helpers/auth_middleware.js');

// //routes
// const paperRoutes = require('./routes/papers.js');
// const insightRoutes = require('./routes/insights.js');
// const authRoutes = require('./routes/auth.js');
// const userRoutes = require('./routes/users.js');

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import authenticate from './helpers/auth_middleware.js';
import paperRoutes from './routes/papers.js';
import insightRoutes from './routes/insights.js';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';


const PORT = 8000;
const app = express();
// const chatRoute = require("./routes/chat");
// app.use("/api/chat", chatRoute);


app.use(cors());
app.use('/api', authenticate);
app.use('/api/papers', paperRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/user', userRoutes);
app.use('/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log('listening to port', PORT);
        });
    })
    .catch((err) => {
        console.log(err.message);
    });
