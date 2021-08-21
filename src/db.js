import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/wetube" ,
 { useNewUrlParser: true , useUnifiedTopology: true,
 });

 
const db = mongoose.connection;
// mongoose가 우리의 데이터베이스가 mongodb에 연결된 connection에 대한 액세스를 줬다.

const handleOpen = () => console.log("Connected Well !");
const handleError = (error) => console.log("DB error", error);
db.on("error",  handleError);
db.once("open", handleOpen);
// on은 click 처럼 무한히 발생할 수 있는 event 이고 , once는 단 한번 일어나는것

