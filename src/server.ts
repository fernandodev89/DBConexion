import { createServer } from "http";
import { readFile } from "fs";
import { obtenerDatos, insertarDato } from "./crud";

const server = createServer((req, res) => {
    if (req.method === "GET" && req.url === "/") {
        readFile("./public/index.html", (err, data) => {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });
    } else if (req.method === "GET" && req.url === "/datos") {
        obtenerDatos().then((datos) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(datos));
        });
    } else if (req.method === "POST" && req.url === "/crear") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            const nuevoDato = JSON.parse(body);
            insertarDato(nuevoDato);
            res.writeHead(201);
            res.end("Dato creado");
        });
    } else {
        res.writeHead(404);
        res.end("Página no encontrada");
    }
});

server.listen(3000, () => console.log("Servidor en http://localhost:3000"));