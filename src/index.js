import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { PORT } from "./config.js";
import router from "./routers/datos.routers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Static
app.use(express.static(path.join(__dirname, "..", "public")));

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Logger
app.use(morgan("dev"));

// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

// Routes
app.use("/", router);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
