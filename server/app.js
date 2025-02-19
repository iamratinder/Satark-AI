const express = require('express');
const app = express();  
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv');   
dotenv.config();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
const connectToDb = require('./db/db');

const { cookie } = require('express-validator');
connectToDb();

const userRoutes = require('./routes/user.routes');
const legalRoutes = require("./routes/legal.routes");
// const legalQARoutes = require('./routes/legalQA.routes');


app.get('/', (req,res) => {
    res.send('Hello World');
})

app.use('/users',userRoutes);
app.use('/legal',legalRoutes);
// app.use('/legal-qa', legalQARoutes);



module.exports = app;