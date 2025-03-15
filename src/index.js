import express from 'express';
import {PORT} from "./config.js"
import { pool } from './models/db.js';
import router from './routers/datos.routers.js';
import morgan from 'morgan';

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api',router); 

app.get('/api', (req, res) =>{
   res.send("Hola")
})

app.listen(PORT, ()=> {
   console.log("Server is running on port ",PORT)
})