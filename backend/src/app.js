import express from 'express'
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js'
import foodRoutes from './routes/food.routes.js'
import foodPartnerRoutes from './routes/food-partner.route.js'
import aiRoute from './routes/ai.route.js'
import cors from 'cors'

const app = express();

// Trust the first proxy (Vercel/Heroku/etc) to get correct user IP for rate limiting
app.set('trust proxy', 1);

app.use(cors({
     origin: process.env.CORS_ORIGIN || "http://localhost:5173",
     credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



app.get('/', (req, res)=>{
     res.send("Hello This is Server")
})

app.use('/api/auth', authRoutes)
app.use('/api/food', foodRoutes)
app.use('/api/food-partner', foodPartnerRoutes)

//Ai Route 
app.use('/api/ai', aiRoute)

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Uncaught Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});


export default app