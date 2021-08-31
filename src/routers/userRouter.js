import express from "express";
import {logout,remove,startGithubLogin,finishGithubLogin,getEdit,postEdit,getChangePassword,postChangePassword, see} from "../controllers/userController.js";
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload} from "../middlewares.js";

const userRouter = express.Router();
// router 생성하기 완료 ! 


userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single("avatar"),postEdit);
// all(protectorMiddleware) get과  post 모두에 미들웨어를 적용시킨다.
// uploadFiles.single("avatar") 부터 실행되고 postEdit 이라는 function이 실행된다.
// uploadFiles라는 미들웨어 역할 : name = avatar 라는 file type의 input에서 유저가 업로드한 파일을 업로드하고 uploads라는 폴더에 저장해준다.
// single : file 1개씩 받아온다. ->>> 결국 이 middelware를 사용함으로써, req.file 이 생긴다!!

// userRouter.get("/edit",protectorMiddleware,getEdit);
// userRouter.post("/edit",up.single('avatar'),postEdit);

userRouter.get("/remove", remove);
// userRouter.get("/:id(\\d+)", watch);
userRouter.get("/logout",protectorMiddleware, logout);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/github/start",publicOnlyMiddleware,startGithubLogin);
userRouter.get("/github/finish",publicOnlyMiddleware,finishGithubLogin);

// < My profile 작업>
userRouter.get("/:id", see);


export default userRouter;