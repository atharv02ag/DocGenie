import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

//routes
import authenticate from './helpers/auth_middleware.js';
import paperRoutes from './routes/papers.js';
import insightRoutes from './routes/insights.js';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';


const PORT = 8000;
const app = express();

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
