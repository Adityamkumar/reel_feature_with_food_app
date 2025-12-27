import express from 'express'
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js'
import foodRoutes from './routes/food.routes.js'

const app = express();
app.use(cookieParser())
app.use(express.json())


app.get('/', (req, res)=>{
     res.send("Hello This is Server")
})

app.use('/api/auth', authRoutes)
app.use('/api/food', foodRoutes)


export default app