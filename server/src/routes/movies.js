import express from 'express'
import axios from 'axios'
const router=express.Router();const tmdb=axios.create({baseURL:'https://api.themoviedb.org/3',headers:{Authorization:`Bearer ${process.env.TMDB_BEARER_TOKEN}`,accept:'application/json'}})
const forward=async(res,p)=>{try{const {data}=await p;res.json(data)}catch(err){res.status(err.response?.status||500).json({message:'TMDB request failed',details:err.response?.data||null})}}
router.get('/trending',(_,res)=>forward(res,tmdb.get('/trending/movie/week')))
router.get('/popular',(_,res)=>forward(res,tmdb.get('/movie/popular')))
router.get('/top-rated',(_,res)=>forward(res,tmdb.get('/movie/top_rated')))
router.get('/search',(req,res)=>forward(res,tmdb.get('/search/movie',{params:{query:req.query.q||'',include_adult:false}})))
router.get('/mood/:mood',(req,res)=>{const map={funny:{g:'35',v:6.5},thoughtful:{g:'18,9648',v:7},'feel-good':{g:'35,10749',v:6.5},intense:{g:'28,53',v:6.5},emotional:{g:'18',v:7},comfort:{g:'16,35,10751',v:6.5}};const f=map[req.params.mood];if(!f)return res.status(400).json({message:'Unknown mood'});forward(res,tmdb.get('/discover/movie',{params:{sort_by:'popularity.desc',include_adult:false,'vote_count.gte':200,'vote_average.gte':f.v,with_genres:f.g}}))})
router.get('/:id',(req,res)=>forward(res,tmdb.get(`/movie/${req.params.id}`,{params:{append_to_response:'credits,videos,recommendations'}})))
export default router
