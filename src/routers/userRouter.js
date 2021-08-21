import express from "express";
import {logout,remove} from "../controllers/userController.js";


const userRouter = express.Router();
// router 생성하기 완료 ! 

// userRouter.get("/edit",getEdit);
userRouter.get("/remove", remove);
// userRouter.get("/:id(\\d+)", watch);
userRouter.get("/logout",logout);


export default userRouter;