import multer from "multer";

export const localsMiddleware = (req,res,next) => {
    res.locals.siteName = "Wetube";
    res.locals.loggedIn = Boolean(req.session.loggedIn); 
    res.locals.loggedInUser = req.session.user || {}; //  현재 로그인된 user가 누군지 알려주는 역할

    //session에 있는 값을 locals로 가져오는것. 왜? pug에서 쓰기 위해서! ( template에 쓰기 위해서!)
    // 헷갈렸던 점 정리 : local은 res(response) object 의 empty array이다. res.locals.siteName = "Wetube" 이라고 하면 빈 배열에 siteName이라는 값을 넣어주고 "Wetube"값을 정해준것.
    // 이것은 pug template에서 언제든지 가져다 쓸 수 있다. -> 전역변수라서 모든 template에서 가져다 쓸 수 있다.
    // local로 가져오지 않으면 pug에서 접근할 수가 없다.
    //  ||(or) {}; 를 넣어준 이유: login이 안된 상태의 사람들은 loggedInUser의 값이 undefined일텐데 이런 사람들도 /users/edit에 들어올수 있다는걸 확인하기 위해서. 
    // console.log(req.session.user);  req.session.user라는 object에는 id라는건 없다. _id만 존재할 뿐..
    next();
}



export const protectorMiddleware = (req,res,next) => {
    if(req.session.loggedIn){
        next();
        // 로그인 안한 사람이 edit페이지로 가는걸 막기위함( /users/edit)
        //user가 로그인 되어있다면 요청을 계속하도록 하고
    }else{
        return res.redirect("/login");
        //user가 로그인 되어있지 않다면 login페이지로 보낸다.
    }
};

export const publicOnlyMiddleware = (req,res,next) => {
    if(!req.session.loggedIn){
        return next();
        // 이미 로그인 한 유저가 login페이지로 가는걸 막기위함.->logout한 유저만 실행하도록 허락하는 미들웨어
    }else{
        return res.redirect("/");
    }
};

// < File Upload > 

export const avatarUpload = multer({ dest : "uploads/avatars/",
    limits: {
        fileSize: 3000000000,
    },
});
// filesize를 제한할 수 있음.

export const videoUpload = multer( { dest : "uploads/videos/",
    limits: {
        fileSize: 10000000,
    },
});