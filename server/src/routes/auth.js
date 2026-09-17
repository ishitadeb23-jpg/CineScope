import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import {auth} from '../middleware/auth.js'
const router=express.Router();const sign=id=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'7d'})
router.post('/register',async(req,res)=>{try{const {name,email,password}=req.body;if(!name||!email||!password)return res.status(400).json({message:'All fields are required'});if(password.length<6)return res.status(400).json({message:'Password must be at least 6 characters'});if(await User.findOne({email}))return res.status(409).json({message:'Email already registered'});const hashed=await bcrypt.hash(password,12);const user=await User.create({name,email,password:hashed});res.status(201).json({token:sign(user._id),user:{id:user._id,name:user.name,email:user.email}})}catch{res.status(500).json({message:'Could not register user'})}})
router.post('/login',async(req,res)=>{const {email,password}=req.body;const user=await User.findOne({email});if(!user||!(await bcrypt.compare(password,user.password)))return res.status(401).json({message:'Invalid email or password'});res.json({token:sign(user._id),user:{id:user._id,name:user.name,email:user.email}})})
router.get('/me',auth,(req,res)=>res.json({user:{id:req.user._id,name:req.user.name,email:req.user.email}}))
export default router
