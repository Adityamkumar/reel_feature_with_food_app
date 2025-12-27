import express from "express";
import {createFood} from '../controllers/food.controller.js'
import { authFoodPartnerMiddleware } from '../middlewares/auth.middleware.js'
import multer from  'multer'

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
})


router.post('/', authFoodPartnerMiddleware, upload.single('video') ,createFood)

export default router