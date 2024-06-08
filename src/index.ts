import express,{Request,Response} from 'express'
import cors from 'cors'
import "dotenv/config"
import mongoose from "mongoose"

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

app.get('/api/test',async(req:Request,res:Response)=>{
    res.json({message:'Hello from /api/test'})
})

app.listen(PORT,()=>{
    console.log(`Server running on port:${PORT}`);
    
})
