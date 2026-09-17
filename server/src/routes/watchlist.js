import express from 'express'
import User from '../models/User.js'
import {auth} from '../middleware/auth.js'
const router=express.Router()
router.get('/',auth,async(req,res)=>{const user=await User.findById(req.user._id);res.json({items:user.watchlist})})
router.post('/',auth,async(req,res)=>{const {
  movieId,
  title,
  posterPath,
  releaseDate,
  voteAverage
} = req.body;const user=await User.findById(req.user._id);if(!user.watchlist.some(i=>i.movieId===Number(movieId))){user.watchlist.push({
  movieId,
  title,
  posterPath,
  releaseDate,
  voteAverage
});await user.save()}res.status(201).json({items:user.watchlist})})
router.delete('/:movieId',auth,async(req,res)=>{const user=await User.findById(req.user._id);user.watchlist=user.watchlist.filter(i=>i.movieId!==Number(req.params.movieId));await user.save();res.json({items:user.watchlist})})
export default router
