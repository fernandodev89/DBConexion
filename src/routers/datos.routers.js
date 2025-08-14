import { Router } from "express";
import {
  validarDate,
  createDate,
  startDB,
  commitTransaction,
  rollbackTransaction,
  setIsolationLevel,
  getIsolationLevel,
  getDatos,
} from "../controller/datos.controller.js";

const router = Router();

// UI mínima
router.get("/addDates", createDate);

// Transacciones
router.post("/start", startDB);
router.post("/commit", commitTransaction);
router.post("/rollback", rollbackTransaction);

// Aislamiento
router.post("/isolation", setIsolationLevel);
router.get("/isolation", getIsolationLevel);

// Operaciones de datos
router.post("/validar", validarDate);
router.get("/getData", getDatos);

export default router;
