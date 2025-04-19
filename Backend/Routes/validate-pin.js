import express from "express";
import { validatePin } from "../Controllers/validatePin.js";
import { routelogic } from "../Controllers/Routelogic.js";
import { sortpost } from "../Controllers/sort.js";





const router = express.Router();
 
router.post('/:id',validatePin);
router.post('/route/:id',routelogic);
router.get('/sort',sortpost);

export default router;