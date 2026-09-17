import mongoose from 'mongoose'
const watchlistSchema = new mongoose.Schema({
  movieId: { type: Number, required: true },
  title: { type: String, required: true },
  posterPath: String,
  releaseDate: String,
  voteAverage: Number,
  addedAt: { type: Date, default: Date.now }
}, { _id: false })
const userSchema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},password:{type:String,required:true},watchlist:{type:[watchlistSchema],default:[]}},{timestamps:true})
export default mongoose.model('User',userSchema)
