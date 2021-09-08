import mongoose from "mongoose";


const videoSchema = new mongoose.Schema( {
    title:{type:String,required:true,trim:true, maxLength:80},
    fileUrl:{type: String, required: true},
    thumbUrl: { type: String, required: true },
    description: {type:String,required:true,trim:true, minLength:20},
    createdAt: {type: Date, required:true ,default:Date.now},
    hashtags: [{type:String, trim:true}],
    meta: { 
        views:{type: Number,required:true,default:0},
        rating:{type: Number,required:true,default:0},
    },
    comments: [ 
        { type: mongoose.Schema.Types.ObjectId, ref: "Comment"}
    ],

    owner: {type: mongoose.Schema.Types.ObjectId, required:true, ref: "User"},
    // type에 objectId는 없다. mongoose가 우리르 도와주게 하려면, 이렇게 써야하고, ref로 User model에서 온것이라고 적어줘야 한다.
    // 영상소유자의 id를 Video에 저장하는게 이렇게나 효과적이다.
    // video는 하나의 owner를 갖지만, owner는 여러개의 video를 가질 수 있다.
});

videoSchema.static('formatHashtags', function(hashtags) {
    return hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));
});

// 우리는 Video 모델의 각종 메소드를 많이 사용하였다. create,findByIdAndUpdate, 등등.. 우리도 이런 function을 직접 만들수 있는데 이걸 static function이라고 한다.
//귀찮게, export const formatHashtags = ~ 하여 ,일일이 import 할 필요없이, 여기다가 static만들면 Video모델을 불러온곳에선 어디든 사용가능하다.


// <middleware 를 활용한 해쉬태그 붙여주는 방법> 
// : 단점 : 새롭게 업로드하는 비디오에만 적용가능하다. 기존 비디오를 edit 했을땐 불가능 
// videoSchema.pre("save", async function(){
//     // hashtags는 우리가 별도의 조작을 하지않는다면,hashtags: [ '#day,#of,#life,eating' ]
//     //  mongoose가 자동으로 하나의 array안에 넣어서 만든다.
//     this.hashtags=this.hashtags[0]
//     .split(",")
//     .map((word)=> word.startsWith("#") ? word : `#${word}`);
// })

// middleware는 model이 생성되기 전에 만들어야 한다.
// middleware는 video를 저장하기 전에 미리 middleware단계를 거치고 저장하는것과 같다. 각종 필터를 거는것과 같다.
// this는 우리가 저장하고자 하는 문서를 가리킨다.


const Video = mongoose.model("Video",videoSchema);
// model을 미리 compile해야 필요할때 언제든지 쓸 수 있다.
export default Video;

