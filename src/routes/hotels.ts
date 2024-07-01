import express from 'express'
const router=express.Router()
import { searchHotels,viewHotel,fetchAllHotels,handlePayments,bookHotel } from '../controllers/hotelControllers';
import { param } from 'express-validator';
import verifyToken from '../middleware/auth';





router.get("/",fetchAllHotels);
router.get("/search",searchHotels)
router.get("/:id",[
    param("id").notEmpty().withMessage("Hotel ID is required")
],viewHotel)
router.post("/:hotelId/bookings/payment-intent",verifyToken,handlePayments)
router.post("/:hotelId/bookings",verifyToken,bookHotel)


export default router;