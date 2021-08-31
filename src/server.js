// server.js는 server관련한 것만 다루도록 관련없는거는 init.js로옮긴다.

// import dotenv from "dotenv";
// dotenv.config();

// console.log(process.env.COOKIE_SECRET , process.env.DB_URL);

import express from "express";
import morgan from 'morgan';
import session from "express-session";
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
import { localsMiddleware } from "./middlewares.js";
import MongoStore from "connect-mongo";

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

app.use(
    session({
        secret:process.env.COOKIE_SECRET,
        // 우리가 쿠키에 sign할때 사용하는 string , 쿠키에 sign하는 이유는 우리 backend가 쿠키를 줬다는걸 보여주기위함.
        // domain : 이 쿠키를 만든 backend가 누구인지 알려준다. 예)localhost4000 -> localhost가 쿠키를준것.
        //Expires: session을 정하지않으면 session으로 표시됨.
        resave:false,
        saveUninitialized:false,
        // resave,saveUninitialized를 false로 하면 익명의 유저들이 아닌, 우리 에게 가입된 유저들이 로그인했을때만, 브라우저에게 쿠키를 준다.
        // 즉, session의 정보가 업데이트되었을때만( 여기서는, postLogin시 loggenIn,user값이 업데이트 됨), 쿠키를 주는거다.
        
        // cookie : {
        //     maxAge: 20000,
        // },   쿠키의 expire시간을 milliseconds단위로 정해줄 수 있다.
        
        store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
        // 더 이상 서버의 메모리에 id를 저장하지 않고(이 경우 새로고침하면 리셋되서 로그아웃됨) ,
        //  mongo Storage에 id를 저장하는것이다. 
})
);
//이 middleware가 사이트로 들어오는 모두를 기억하게 될것임. 모두에게 텍스트를 주고,그 텍스트를 가지고 유저가 누구인지 알아낼것임.
// 페이지를 새로고침할때마다 브라우저가 알아서 백엔드로 쿠키를 보냄

// app.use((req,res,next) => {
//     req.sessionStore.all((error,sessions) => {
//         console.log(sessions);
//         next();
//     });
// });

// app.get("/add-one",(req,res,next) => {
//     return res.send(`${req.session.id}`);
// });
// add-one 들어가보면 브라우저마다( 크롬, 엣지..등등) 다른 세션id를 표시한다. 예) kzfUO8KebBQ05RDHjrzBnOielDMHKTXO , HklUBIInZdvIyzto0JWRlKL6fmcvxMST
// 서버가 브라우저한테 세션 id를 부여하고 ,브라우저가 요청을 보낼때마다,쿠키에서 세션id를 가져와 보내주는것. 서버는 세션id를 읽고 우리가 어떤 브라우저인지 알 수 있는것임.
//브라우저한테 우리 백엔드 url을 방문할때마다 보여줘야 하는 id카드를 주는것임.
// <주의!!!>  : 반드시,이 middleware는 router 위에 선언해줘야 한다!!

app.use(localsMiddleware);

app.use("/",rootRouter);
app.use("/videos",videoRouter);
app.use("/users",userRouter);
//누군가 와서 /users로 시작하는 url을 찾는다면, express는 userRouter에 있는 컨트롤러를 찾는다.
// 그리고 userRouter는 오직 한가지 루트 /edit 밖에 없다.
// /users/edit 
// <upload file>
app.use("/uploads",express.static("uploads"));
// browser에서 어느 폴더에나 접근할 수 있게하면 보안에 취약해지기 떄문에, 접근가능한 폴더릉 static() 안에 지정해준다.

const home = (req,res) => {
    console.log("I will respond!");
    return res.send("hello");
};

const login = (req,res) => {
    return res.send("login");
};

export default app;

