// server.js는 server관련한 것만 다루도록 관련없는거는 init.js로옮긴다.
import express from "express";
import morgan from 'morgan';
import globalRouter from "./routers/globalRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";

// console.log(process.cwd());
// 현재 작업중인 curren working directory 를 알 수 있다.
// 현재 작업중이 directory는 node.js를 실행하는 package.json이 있는 곳임.

const app = express();
const logger = morgan("combined");
app.use(logger);


app.set("views",process.cwd()+ "/src/views");
app.set("view engine", "pug");
//express의 view engine을 set으로 바꿔줄 수있다. pug로 설정하자.
//이로써, express가 views라는 디렉토리에 있는 view(home)을 본다는걸 안다.
// 따라서, 따로 import할 필요없다.

app.use(express.urlencoded({extended:true}));
// middle ware는 router를 사용하기전에 만들어줘야 한다.
//그래서 router만들기전에 이 위치에 선언하는것.
// express application 이 form의 value들을 이해하고, 자바스크립트형식으로 바꿔줄것.

app.use("/",globalRouter);
app.use("/videos",videoRouter);
app.use("/users",userRouter);
//누군가 와서 /users로 시작하는 url을 찾는다면, express는 userRouter에 있는 컨트롤러를 찾는다.
// 그리고 userRouter는 오직 한가지 루트 /edit 밖에 없다.
// /users/edit 



const home = (req,res) => {
    console.log("I will respond!");
    return res.send("hello");
};

const login = (req,res) => {
    return res.send("login");
};

export default app;

