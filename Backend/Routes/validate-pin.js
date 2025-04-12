import express from "express";
import { validatePin } from "../Controllers/validatePin.js";





const router = express.Router();
 
router.post('/:id',validatePin);

export default router;