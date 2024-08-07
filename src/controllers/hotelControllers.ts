import { Request, Response } from "express";
import Hotel from "../models/hotel";
import { BookingType, HotelSearchResponse } from "../shared/types";
import { validationResult } from "express-validator";
import Stripe from 'stripe';
const stripe=new Stripe(process.env.STRIPE_API_KEY as string);




export const fetchAllHotels=async(req:Request,res:Response)=>{
    try {
    const hotels = await Hotel.find().sort("-lastUpdated").limit(20);
    res.json(hotels);
    } catch (error) {
    console.log("error", error);
        res.status(500).json({ message: "Error fetching hotels" });
    }
}


export const searchHotels=async(req:Request,res:Response)=>{
    try {
        const query=constructSearchQuery(req.query);
        let sortOptions={};
        switch(req.query.sortOption){
            case "starRating":
                sortOptions={starRating:-1}
                break;
            case "pricePerNightAsc":
                sortOptions={pricePerNight:1}
                break;
            case "pricePerNightDesc":
                sortOptions={pricePerNight:-1}
                break;
        }
        const pageSize=5;
        const pageNumber=parseInt(
            req.query.page ? req.query.page.toString() : "1"
        )
        const skip=(pageNumber-1)*pageSize;
        const hotels=await Hotel.find(query).sort(sortOptions).skip(skip).limit(pageSize)
        const total=await Hotel.countDocuments(query)
        const response:HotelSearchResponse={
            data:hotels,
            pagination:{
                total,
                page:pageNumber,
                pages:Math.ceil(total/pageSize)
            }
        }
        res.json(response)
    } catch (error) {
        console.log("error",error);
        res.status(500).json({message:"Something went wrong"})
    }
}


export const viewHotel=async(req:Request,res:Response)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const id=req.params.id.toString()
    try {
        const hotel=await Hotel.findById(id);
        res.json(hotel)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something went wrong"})
    }
}



export const bookHotel=async(req:Request,res:Response)=>{
    try {
        const paymentIntentId=req.body.paymentIntentId;
        const paymentIntent=await stripe.paymentIntents.retrieve(
            paymentIntentId as string
        )
        if(!paymentIntent){
            return res.status(400).json({message:"Payment intent not found"})
        }
        if(paymentIntent.metadata.hotelId !== req.params.hotelId || paymentIntent.metadata.userId !== req.userId){
            return res.status(400).json({message:"Invalid payment intent"})
        }
        if(paymentIntent.status !== "succeeded"){
            return res.status(400).json({message:`Payment intent not succeeded. Status: ${paymentIntent.status}`})
        }

        const newBooking:BookingType={
            ...req.body,
            userId:req.userId,
        }
        const hotel=await Hotel.findOneAndUpdate(
            {_id:req.params.hotelId},
            {
                $push:{
                    bookings:newBooking
                }
            },
            {new:true}
        )

        if(!hotel){
            return res.status(400).json({message:"Hotel not found"})
        }

        await hotel.save();
        res.status(200).send()

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something went wrong"})
    }
}

export const handlePayments=async(req:Request,res:Response)=>{
    try {
        const{numberOfNights}=req.body;
        const{hotelId}=req.params;
        const hotel=await Hotel.findById(hotelId);
        if(!hotel){
            return res.status(400).json({message:"Hotel not found"})
        }
        const totalCost=hotel.pricePerNight * numberOfNights;
        const paymentIntent=await stripe.paymentIntents.create({
            amount:totalCost*100,
            currency:"inr",
            description:"Hotel booking for " + hotel.name,
            metadata:{
                hotelId,
                userId:req.userId
            },
            shipping:{
                name:"Anzar",
                address:{
                    line1:"1234 Main Street",
                    city:"Bangalore",
                    state:"Karnataka",
                    country:"India",
                    postal_code:"560001"
                }
            }
        })
        if(!paymentIntent.client_secret){
            return res.status(500).json({message:"Error creating payment intent"})
        
        }
        const response={
            paymentIntentId:paymentIntent.id,
            clientSecret:paymentIntent.client_secret.toString(),
            totalCost,
        }
        res.send(response)
    } catch (error) {
        console.log(error);  
        res.status(500).json({message:"Something went wrong"})
    }
    
}






const constructSearchQuery=(queryParams:any)=>{
    let constructedQuery:any={}
    if(queryParams.destination){
        const cleanedDestination = queryParams.destination.trim().replace(/\s+/g, ' ');
        constructedQuery.$or=[
            {city:new RegExp(cleanedDestination,"i")},
            {country:new RegExp(cleanedDestination,"i")}
        ];
    }
    if(queryParams.adultCount){
        constructedQuery.adultCount={$gte:parseInt(queryParams.adultCount)}
    }
    if(queryParams.childCount){
        constructedQuery.childCount={$gte:parseInt(queryParams.childCount)}
    }
    if(queryParams.facilities){
        constructedQuery.facilities={
            $all:Array.isArray(queryParams.facilities)
            ?queryParams.facilities
            :[queryParams.facilities]
        }
    }

    if(queryParams.types){
        constructedQuery.type={
            $in:Array.isArray(queryParams.types)
            ?queryParams.types
            :[queryParams.types]
        }
    }

    if(queryParams.stars){
        const starRatings=Array.isArray(queryParams.stars)
        ?queryParams.stars.map((star:string)=>parseInt(star))
        :parseInt(queryParams.stars)

        constructedQuery.starRating={$in:starRatings}
        
    }
    if(queryParams.maxPrice){
        constructedQuery.pricePerNight={$lte:parseInt(queryParams.maxPrice)}
    }


    return constructedQuery;
}