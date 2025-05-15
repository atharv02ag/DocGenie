const app = require('express')();
const cors = require('cors');

//routes
const uploadRoutes = require('./routes/upload.js');

const PORT = 8000;

app.use(cors());

app.use('/api/upload',uploadRoutes);

app.listen(PORT,()=>{
    console.log('listening to port',PORT);
});




