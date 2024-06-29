import express from 'express'
const router=express.Router()
import { searchHotels,viewHotel } from '../controllers/hotelControllers';
import { param } from 'express-validator';

router.get("/search",searchHotels)
router.get("/:id",[
    param("id").notEmpty().withMessage("Hotel ID is required")
],viewHotel)

export default router;