"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const fs_1 = require("fs");
const crud_1 = require("./crud");
const server = (0, http_1.createServer)((req, res) => {
    if (req.method === "GET" && req.url === "/") {
        (0, fs_1.readFile)("./public/index.html", (err, data) => {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });
    }
    else if (req.method === "GET" && req.url === "/datos") {
        (0, crud_1.obtenerDatos)().then((datos) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(datos));
        });
    }
    else if (req.method === "POST" && req.url === "/crear") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            const nuevoDato = JSON.parse(body);
            (0, crud_1.insertarDato)(nuevoDato);
            res.writeHead(201);
            res.end("Dato creado");
        });
    }
    else {
        res.writeHead(404);
        res.end("Página no encontrada");
    }
});
server.listen(3000, () => console.log("Servidor en http://localhost:3000"));
