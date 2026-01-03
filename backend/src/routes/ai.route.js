import express from 'express'
import { authFoodPartnerMiddleware } from '../middlewares/auth.middleware.js';
import { generateReelMeta } from '../controllers/ai.controller.js';

const route = express.Router();

route.post('/generate-reel-meta', authFoodPartnerMiddleware, generateReelMeta)

export default route