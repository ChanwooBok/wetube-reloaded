import Video from "../models/Video.js";


    /* 
    < callback함수를 사용하는 javascript방식 >
    console.log("start")
    Video.find({}, (error, videos) => {
        if(error){
            return res.render("server-error")
        }
        return res.render("home", { pageTitle : "home", videos});
    });
    console.log("finished");

    output 
    : start
      finished
      videos:[]
      error:null
    */
    

//  <promise를 사용하는 방식>

export const home = async(req,res) => {
    try{
    console.log("start ! ");
    const videos = await Video.find({});
    return res.render("home", {pageTitle : "Home" , videos});
    // return은 여기서 없어도 그만. 단지, function이 render작업후 바로 종료시켜 그 밑에 로그는 실행되지 않게한다.
    } catch(error){
        return res.render("server-error",error);
    }
    //promise를 사용하는경우 , await가 database 서칭을 마칠때까지 기다려주기때문에,
    // 코드의 가독성도 높아지고, 순서대로 출력 되도록한다.
    // await는 반드시 async함수와 쓰여야한다 , error는 try~catch문에서 try에서 error발생이
    // catch구문으로넘어가서 error정보를 준다.

    // video.find 부분은 database를 search하고 나서야 render시켜야 하기 때문에 가장 마지막에
    // 실행된다.  비록 위에 써있더라도 아래에 있는 콘솔로그가 먼저 실행되고 database 서칭이 끝나야 실행된다.
    console.log("BUt I am the second!~~");
    //mongoose는 database에서 이 부분을 불러올 것이다. database가 respond하면
    //mongoose는 callback function을 수행할것이다.
    
};
    // home이라는 pug를 렌더링한다.
    //Failed to lookup view "home" in views directory "C:\Users\chanwoo\Documents\wetube\views"
    //error 가 발생한다. 그 이유는 pug를담은  views라는 폴더는 cwd에 위치한게 아니라 src에 있기때문이다.
export const watch = (req,res) => {
    const { id } = req.params;
    // const id = req.params.id 와 동일 표현.위에껀 ES6스타일 
    return res.render("watch", { pageTitle : `Watching `});
}
export const getEdit = (req,res) => {
    const {id} = req.params;
    // req.params는 videoRouter.get("/:id(\\d+)/edit",getEdit);에서
    // id값이 주어지기 때문에 express가 알아서 req.params의 값을 id로 주는것.
    return res.render("edit",{pageTitle: `Editing `});
}
//  화면에 form을 보여주는 역할
export const postEdit = (req,res) => {
    const {id} = req.params;
    // console.log(req.body);
    const {potato} = req.body;
    // const potato = req.body.potato; 와 같은표현 
    // -> 즉, potato는 input의 placeholder에 우리가 새로 적어준값이다! 
    // 즉, form에 입력한 값은 req.body로 받아올 수 있단 의미!
    
    // console.log(potato); -> output: First video
 

    return res.redirect(`/videos/${id}`);
    // redirect는 요청한 곳으로 이동시켜줌.
};
// 변경사항을 저장해주는 역할

export const getUpload = (req,res) => {
    res.render("upload"); 
    // upload.pug 를 render 시켜놓고 upload.pug를 만들어놓지 않으면,
    //  Failed to lookup view "upload" in views directory 에러가 나온다.
}
export const postUpload = (req,res) => {
    // here we will add a video to the videos array.
    const {title} = req.body;
    res.redirect("/");
} 
export const login = (req,res) => res.send("login!");
export const deleteVideo = (req,res) => res.send("delete video");
// export default trending; 
// default 로 export하는것은 오직 한가지만 내보낼 수 있다.
// 여러개 내보내야 할땐 각각을 export한다.