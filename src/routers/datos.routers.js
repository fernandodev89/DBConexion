import { Router } from "express";
import { validarDate,createDate,startDB,commitTransaction,rollbackTransaction} from "../controller/datos.controller.js";
const router =  Router();

router.post('/validar',validarDate);
router.get('/addDates',createDate);
router.post('/start',startDB);
router.post('/commit',commitTransaction);
router.post('/rollback',rollbackTransaction);
/*
*/

export default router