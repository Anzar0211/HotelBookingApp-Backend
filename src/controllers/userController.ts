import {Request,Response} from 'express'
import User from "../models/user"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { validationResult } from 'express-validator'

export const register=async(req:Request,res:Response)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message:errors.array()})
    }
    try {
        let user=await User.findOne({
            email:req.body.email
        })
        if(user){
            return res.status(400).json({message:'User already exists'})
        }
        const password=await bcrypt.hash(req.body.password,8)
        user=new User({...req.body,password:password})
        await user.save() 
        
        const token=jwt.sign({userId:user.id},
            process.env.JWT_SECRET_KEY as string,
            {expiresIn:'1d'}
        )
        res.cookie("auth_token",token,{
            httpOnly:true,
            secure:true,
            sameSite:"none",
            maxAge:86400000
        })
        res.status(200).send({message:"User Registered Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).send({message:"Something went wrong"}) 
    }
}

export const getCurrentUserById=async(req:Request,res:Response)=>{
    const userId=req.userId;
    try {
        const user=await User.findById(userId).select("-password")
        if(!user){
            return res.status(400).json({message:"User not found"})
        }
        res.json(user)
    } catch (error) {
        console.log(error);
        res.status(500).send({message:"Something went wrong"})
    }
}