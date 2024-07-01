import express,{Request,Response} from 'express'
import verifyToken from '../middleware/auth'
import { getMyBookings } from '../controllers/myBookingsController';
const router=express.Router()

router.get("/",verifyToken,getMyBookings);

export default router;


