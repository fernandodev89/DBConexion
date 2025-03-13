import conexion from "./db";

async function probarConexion() {
    try {
        const [rows] = await conexion.query("SELECT 1+1 AS resultado");
        console.log("✅ Conexión exitosa:", rows);
    } catch (error) {
        console.error("❌ Error de conexión:", error);
    }
}

probarConexion();