import express from "express";
import {watch,getEdit,postEdit, getUpload, postUpload} from "../controllers/videoController.js";


const videoRouter = express.Router();

// videoRouter.get("/upload",upload);
// :id를 안 쓰는 upload를 가장 위에 쓴 이유?
// express는 코드를 위에서부터 읽는데, 만약,  upload를 
// 아래에다가 쓰면, 브라우저는 /upload 를 일종의 id:upload로 인식할 우려있음
// 원칙적으로 upload란 문자도 id가 될 수 있기때문이다.
// <해결법> -> 그렇다면 원칙적으로 id에는 숫자만 오도록 정규식을 쓰면 upload를 
// 나중에 써도 무방해진다.
videoRouter.get("/:id(\\d+)",watch);
// :의 의미는 variable 이다.
// (\\d+) 정규식 : d는 숫자, +는 얼마든지 무한히 와도 됨.


videoRouter.get("/:id(\\d+)/edit",getEdit);
videoRouter.post("/:id(\\d+)/edit",postEdit);
// videoRouter.get("/upload",getUpload);
// videoRouter.post("/upload",postUpload);
videoRouter.route("/upload").get(getUpload).post(postUpload);



export default videoRouter;