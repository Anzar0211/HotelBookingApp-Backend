import express, { Request,Response } from 'express'
const router=express.Router()
import { check } from 'express-validator'
import { login, logout } from '../controllers/authController'
import verifyToken from '../middleware/auth'


router.post('/login',[
    check("email","Email is required").isEmail(),
    check("password","Incorrect Password").isLength({
        min:6
    })
],login)

router.post("/logout",logout)

router.get('/validate-token',verifyToken,(req:Request,res:Response)=>{
    res.status(200).send({userId:req.userId})
})

export default router;