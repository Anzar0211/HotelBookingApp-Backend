import express,{Request,Response} from 'express'
import cors from 'cors'
import "dotenv/config"
import mongoose from "mongoose"
import cookieParser from 'cookie-parser'
import userRoutes from './routes/users'
import authRoutes from './routes/auth'
import myHotelRoutes from './routes/my-hotels'
import hotelRoutes from './routes/hotels'
import myBookingsRoutes from './routes/my-bookings'
import path from "path"
import {v2 as cloudinary} from "cloudinary"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

mongoose.connect(process.env.DB_URI as string).then(()=>{
    console.log('SUCCESSFULLY CONNECTED TO MONGODB');
}).catch(()=>{
    console.log('MONGODB CONNECTION ERROR');
})

const PORT=process.env.PORT
const app=express()
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))

app.use(express.static(path.join(__dirname,"../../frontend/dist")))

app.use('/api/users',userRoutes)
app.use('/api/auth',authRoutes)
app.use("/api/my-hotels",myHotelRoutes)
app.use("/api/hotels",hotelRoutes)
app.use("/api/my-bookings",myBookingsRoutes)

app.listen(PORT,()=>{
    console.log(`Server running on port: ${PORT}`);
})
