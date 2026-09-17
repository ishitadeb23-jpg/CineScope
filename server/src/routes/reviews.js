import express from 'express'
import Review from '../models/Review.js'
import {auth} from '../middleware/auth.js'
const router=express.Router()
router.get('/:movieId',async(req,res)=>{const reviews=await Review.find({movieId:Number(req.params.movieId)}).populate('user','name').sort({createdAt:-1});res.json({reviews})})
router.post('/',auth,async(req,res)=>{try{const {movieId,rating,comment}=req.body;const review=await Review.findOneAndUpdate({movieId:Number(movieId),user:req.user._id},{rating:Number(rating),comment},{new:true,upsert:true,runValidators:true,setDefaultsOnInsert:true}).populate('user','name');res.status(201).json({review})}catch{res.status(400).json({message:'Could not save review'})}})
export default router
