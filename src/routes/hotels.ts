import express from 'express'
const router=express.Router()
import { searchHotels } from '../controllers/hotelControllers';

router.get("/search",searchHotels)

export default router;