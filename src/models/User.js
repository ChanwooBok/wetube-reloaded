import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email : {type:String , required:true, unique:true},
    avatarUrl: String,
    socialOnly : {type:Boolean,default:false},
    // github 계정으로 social login한건지 구분하기 위한 항목.
    username : {type: String ,required:true, unique:true },
    password : {type:String},
    // social login했을 시, password가 필요없으므로 required:true를 뺴줬다.
    name: {type:String, required:true},
    location: String,
    comments: [ { type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
    videos:[{type: mongoose.Schema.Types.ObjectId,ref: "Video"}],
    // User에 videos라는 array를 만들어준다. -> video를 여러개 가질 수 있다.-> 배열로 만든 이유
});


userSchema.pre("save", async function() {
    // middleware를 이용하여 사용자가 작성한 패스워드에 hash 작업을 미리 하기.
    //  User.save() 코드를 실행하면 미리 작동하는 것이다.
    // console.log(this.password);
    if( this.isModified("password")){
        // video를 업로드할때, user schema에 videos array항목에 video id를 추가해주고 save작업을 할 때 비밀번호가 쓸데없이 hash되는 버그 해결하기 위한 코드
        // user.password가 modified될때만 작동하도록!
        this.password = await bcrypt.hash(this.password, 5);
    }
    // 2nd argument 는 salt 로서  소금을 친다. 즉, 해쉬를 몇번 반복할건지 정해준다 . 반복할수록 더 암호화 되는거지.
    // console.log("hash password is : ", this.password);
});

const User = mongoose.model("User",userSchema);

export default User;