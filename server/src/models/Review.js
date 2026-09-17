import mongoose from 'mongoose'
const reviewSchema=new mongoose.Schema({movieId:{type:Number,required:true,index:true},user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},rating:{type:Number,min:1,max:10,required:true},comment:{type:String,required:true,trim:true,maxlength:1200}},{timestamps:true})
reviewSchema.index({movieId:1,user:1},{unique:true})
export default mongoose.model('Review',reviewSchema)
