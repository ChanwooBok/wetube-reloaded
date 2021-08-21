import mongoose from "mongoose";

const videoSchema = new mongoose.Schema( {
    title:String,
    description: String,
    createdAt: Date,
    hashtags: [{type:String}],
    meta: { 
        views:Number,
        rating:Number,
    }
});

const Video = mongoose.model("Video",videoSchema);
// model을 미리 compile해야 필요할때 쓸 수 있다.
export default Video;

