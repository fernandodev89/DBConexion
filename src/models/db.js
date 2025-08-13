import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Escav10",
  database: "conexion_remota",
});

pool
    .query("SELECT 1")
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.error("Error connecting to the database:", err));

pool.on("error", (err) => console.error("Error",err))

