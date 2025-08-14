import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: +(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "fernando8923",
  database: process.env.DB_NAME || "conexion_remota",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool
  .query("SELECT 1")
  .then(() => console.log("[DB] Conectado a la base de datos"))
  .catch((err) => console.error("[DB] Error de conexión:", err));

pool.on("error", (err) => console.error("[DB] Pool error:", err));
