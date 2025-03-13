import conexion from "./db";

export async function obtenerDatos() {
    const [rows] = await conexion.query("SELECT * FROM datos");
    return rows;
}

export async function insertarDato(dato: { nombre: string }) {
    await conexion.query("INSERT INTO datos (nombre) VALUES (?)", [dato.nombre]);
}

console.log(obtenerDatos());