import express from 'express'
const router=express.Router()
import { check } from 'express-validator'
import { login } from '../controllers/authController'


router.post('/login',[
    check("email","Email is required").isEmail(),
    check("password","Incorrect Password").isLength({
        min:6
    })
],login)

export default router;