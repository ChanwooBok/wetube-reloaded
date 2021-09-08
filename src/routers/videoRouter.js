import express from "express";
import {watch,getEdit,postEdit, getUpload, postUpload , deleteVideo} from "../controllers/videoController.js";
import { protectorMiddleware, videoUpload } from "../middlewares.js";


const videoRouter = express.Router();

// videoRouter.get("/upload",upload);
// :id를 안 쓰는 upload를 가장 위에 쓴 이유?
// express는 코드를 위에서부터 읽는데, 만약,  upload를 
// 아래에다가 쓰면, 브라우저는 /upload 를 일종의 id:upload로 인식할 우려있음
// 원칙적으로 upload란 문자도 id가 될 수 있기때문이다.
// <해결법> -> 그렇다면 원칙적으로 id에는 숫자만 오도록 정규식을 쓰면 upload를 
// 나중에 써도 무방해진다.

videoRouter.get("/:id([0-9a-f]{24})",watch);
// :의 의미는 variable 이다.
// 0부터 9까지 , a부터 f까지의 string 24개를 찾는것.
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
// (\\d+) 정규식 : d는 숫자, +는 얼마든지 무한히 와도 됨.
videoRouter.get("/:id([0-9a-f]{24})/delete",protectorMiddleware,deleteVideo);


videoRouter.route("/upload").all(protectorMiddleware).get(getUpload)
.post(videoUpload.fields([{name: "video"} ,{name: "thumb"}]),postUpload);
// .post(videoUpload.single("video"), postUpload);
// upload할때 multer를 쓰고 있었는데,  원래는 video영상 하나만 올릴거라 single을 썼지만, 이젠 영상,썸네일 이미지도 올려야 하니까 fields를 써준다.
// fields 안에는 파일을 받는 input의 name을 써준다.
// route로 위 한줄로 짧게 가능
// videoRouter.get("/upload",getUpload);
// videoRouter.post("/upload",postUpload);



export default videoRouter;