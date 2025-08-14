import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { PORT } from "./config.js";
import router from "./routers/datos.routers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, "..", "public")));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(morgan("dev"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
