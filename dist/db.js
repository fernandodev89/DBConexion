"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql2/promise");
const conexion = mysql.createPool({
    host: "localhost", // Dirección del servidor de MariaDB
    user: "root", // Usuario de la base de datos
    password: "fernando8923", // Contraseña del usuario
    database: "conexion_remota", // Nombre de la base de datos
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
exports.default = conexion;
