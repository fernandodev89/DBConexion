import * as mysql from "mysql2/promise";

const conexion = mysql.createPool({
    host: "localhost",  
    user: "root",       
    password: "fernando8923", 
    database: "conexion_remota", 
    port: 3306,        
    waitForConnections: true, 
    connectionLimit: 10, 
    queueLimit: 0
});

export default conexion;