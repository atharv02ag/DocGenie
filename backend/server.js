const app = require('express')();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authenticate = require('./helpers/auth_middleware.js');

//routes
const paperRoutes = require('./routes/papers.js');
const insightRoutes = require('./routes/insights.js');
const authRoutes = require('./routes/auth.js');
const userRoutes = require('./routes/users.js');

const PORT = 8000;

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
