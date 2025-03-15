import { Router } from "express";
import { validarDate,createDate/*,getDatos, getDato,postDato,patchDato,deleteDato*/} from "../controller/datos.controller.js";
const router =  Router();

router.post('/validar',validarDate)
router.get('/addDates',createDate);
/*
router.get('/home',getDatos)
router.get('/home/:id',getDato);
router.post('/home',postDato);
router.patch('/home/:id',patchDato);
router.delete('/home/:id',deleteDato);
*/

export default router