import express from 'express';
import {PORT} from "./config.js"
import { pool } from './models/db.js';
import router from './routers/datos.routers.js';
import morgan from 'morgan';

//objetos para llamar los metodos de express
const app = express();

//middleware
app.use(express.static("public"));
//maneja datos que vienen de otra pagina
app.use(express.urlencoded({ extended:false}));

//motor de vistas
app.set("view engine", "ejs")

//cargar archivos json
app.use(express.json());
//mostrar peticiones al servidor
app.use(morgan('dev'));

//pagina principal
app.use('/',router); 

//configurar el puerto usado para el servidor local
app.listen(PORT, ()=> {
   console.log("Server is running on port ",PORT)
})