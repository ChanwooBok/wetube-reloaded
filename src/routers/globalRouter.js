import express from "express";
import {login, join, logout} from '../controllers/userController.js';
import {trending} from "../controllers/videoController.js";

//  export default ~ 로 내보낼땐, import 시, 어떤 이름으로도 가져올 수 있었다.
// 파일은 오직 하나의 default 값을 가져올 수 있으므로,  node js 가 default export를 가지고 이름을 알아서 바꿔주기 때문이다.

// 그러나, export const ~ 로 내보낸다면, import시 , 이름을 그대로 가져와야 한다.


const globalRouter = express.Router();

globalRouter.get("/",trending);
globalRouter.get("/join",join);
//get(a,b) : a라는 요청을 받을 시에 , b라는 콜백함수 실행
globalRouter.get("/login",login);
globalRouter.get("/logout",logout);
export default globalRouter;