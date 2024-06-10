import express,{Request,Response} from 'express'
import cors from 'cors'
import "dotenv/config"
import mongoose from "mongoose"
import userRoutes from './routes/users'
import authRoutes from './routes/auth'

mongoose.connect(process.env.DB_URI as string).then(()=>{
    console.log('SUCCESSFULLY CONNECTED TO MONGODB');
}).catch(()=>{
    console.log('MONGODB CONNECTION ERROR');
})

const PORT=process.env.PORT
const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())

app.use('/api/users',userRoutes)
app.use('/api/auth',authRoutes)

app.listen(PORT,()=>{
    console.log(`Server running on port: ${PORT}`);
    
})
