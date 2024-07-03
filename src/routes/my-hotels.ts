import express, { Request, Response } from 'express'
const router=express.Router()
import multer from "multer";
import { createHotel,getHotels,getHotelById,editHotel } from '../controllers/myHotelsController';
import verifyToken from '../middleware/auth';
import {body} from "express-validator"

const storage=multer.memoryStorage()
const upload=multer({
    storage:storage,
    limits:{
        fileSize:1024*1024*5
    }
})


// api/add-hotel

router.post("/",verifyToken,[
    body("name").notEmpty().withMessage("Name is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type").notEmpty().withMessage("Hotel Type is required"),
    body("pricePerNight").notEmpty().isNumeric().withMessage("Price per night required and must be a number"),
    body("facilities").notEmpty().isArray().withMessage("Facilities are required")

],upload.array("imageFiles",6),createHotel)

router.get("/",verifyToken,getHotels)

router.get("/:id",verifyToken,getHotelById)

router.put("/:hotelId",verifyToken,upload.array("imageFiles"),editHotel)

export default router;