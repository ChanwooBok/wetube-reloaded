import User from "../models/User.js";
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
    const videos = await Video.find({}).sort({createdAt:"desc"}).populate("owner");
    return res.render("home", {pageTitle : "Home" , videos});
    // return은 여기서 없어도 그만. 단지, function이 render작업후 바로 종료시켜 그 밑에 로그는 실행되지 않게한다.
    //promise를 사용하는경우 , await가 database 서칭을 마칠때까지 기다려주기때문에,
    // 코드의 가독성도 높아지고, 순서대로 출력 되도록한다.
    // await는 반드시 async함수와 쓰여야한다 , error는 try~catch문에서 try에서 error발생이
    // catch구문으로넘어가서 error정보를 준다.

    // video.find 부분은 database를 search하고 나서야 render시켜야 하기 때문에 가장 마지막에
    // 실행된다.  비록 위에 써있더라도 아래에 있는 콘솔로그가 먼저 실행되고 database 서칭이 끝나야 실행된다.
    //mongoose는 database에서 이 부분을 불러올 것이다. database가 respond하면
    //mongoose는 callback function을 수행할것이다.
};
    // home이라는 pug를 렌더링한다.
    //Failed to lookup view "home" in views directory "C:\Users\chanwoo\Documents\wetube\views"
    //error 가 발생한다. 그 이유는 pug를담은  views라는 폴더는 cwd에 위치한게 아니라 src에 있기때문이다.
export const watch = async(req,res) => {
    const { id } = req.params;
    // const id = req.params.id 와 동일 표현.위에껀 ES6스타일 
    const potato = await Video.findById(id).populate("owner").populate("comments");
    console.log(potato);
    // mongoose가 video를 찾고 , owner 가 ObjectId이며, id가 User에서 온 것도 알고 있으며, owner의 전체 객체  User object를 가져와준다.-> 우리는 user의 구체적인 정보까지 한줄의 코드로 알 수 있다.
    // populate를 하기전에는 owner은 단지, String타입의 objectId 일 뿐이다.
    // const owner = await User.findById(potato.owner); ->너무 번거로운 코드반복을 줄일  수 있는것이다.

    
    if(potato === null ){
        return res.render("404",{pageTitle: "Video not Found!"});
    }
    return res.render("watch", { pageTitle : potato.title , video: potato });
    // db에서 video를 찾아서 pug template에는 video의 모든 object가 들어있는것임.
    
};
export const getEdit = async(req,res) => {
    const {id} = req.params;
    // req.params는 videoRouter.get("/:id(\\d+)/edit",getEdit);에서
    // id값이 주어지기 때문에 express가 알아서 req.params의 값을 id로 주는것.
    const potato = await Video.findById(id);
    const {
        session : {
            user: {_id},
        },
    } = req;
    if(!potato){
        return res.status(404).render("404",{pageTitle: "Video Not Found"});
        // 브라우저는 너가 방문한 url을 히스토리로 기록하는데, status code 200을 응답받으면 정상방문한줄알고 기록남긴다.
        // 에러가 났을경우, 히스토리에 url을 남기지말아야한다고 브라우저에게 알려주어야 하는데, status code (404) 로 브라우저에게 알려주는건 중요하다.
    }
    // console.log(String(potato.owner), String(_id));
    if( String(potato.owner) !== String(_id)){
        // 두개는 object와 string으로 타입이 다르다. !==는 데이터타입까지 비교하므로 형변환해주기.
        req.flash("error","NOT authorized");
        return res.status(403).redirect("/");
    }
    return res.render("edit",{pageTitle: `Edit ${potato.title}` , potato });
};
//  화면에 form을 보여주는 역할
export const postEdit = async(req,res) => {
    const {
        session: {
            user: {_id},
        },
    }= req;
    const {id} = req.params;
    const {title,description,hashtags} = req.body;
    const potato = await Video.exists({_id: id});
    //video를 검색하고 , 이 때, exists는 boolean값을 반환한다. 단,filter값을 필요로 한다.여기서필터는 _id
    if(!potato){
        return res.status(404).render("404",{pageTitle: "Video Not Found"});
    } //error가 있는지 체크하고,
    if( String(potato.owner) !== String(_id)){
        // 두개는 object와 string으로 타입이 다르다. !==는 데이터타입까지 비교하므로 형변환해주기.
        req.flash("error", "You are not the the owner of the video.");
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags:Video.formatHashtags(hashtags),
    })

    // 아래와 같이 일일이 바꾸는걸 명시할 필요없이 mongoose의 기능중 하나인 findByIdAndUpdate를 쓰면 찾고 업데이트&저장까지 해준다.
    // potato.title = title;
    // potato.description = description;
    // potato.hashtags=formatHashtags(hashtags);
    // await potato.save();
    // {}안의 내용은 input의 placeholder에 우리가 새로 적어준값이다! 
    // 즉, form에 입력한 값(title,description,hashtags는 req.body로 받아올 수 있다.
    
    // console.log(potato); -> output: First video
    req.flash("success","Changes saved");
    return res.redirect(`/videos/${id}`);
    // redirect는 요청한 곳으로 이동시켜줌.
};
// 변경사항을 저장해주는 역할


export const getUpload = (req,res) => {
    res.render("upload"); 
    // upload.pug 를 render 시켜놓고 upload.pug를 만들어놓지 않으면,
    //  Failed to lookup view "upload" in views directory 에러가 나온다.
}
export const postUpload = async(req,res) => {
    // here we will add a video to the videos array.
    console.log(req.session.user);
    const { user: {_id},} = req.session;                                
    const {title , description,hashtags} = req.body;
    // const video = new Video 이렇게 object형식으로 만들수도 있고,또는 아래와같이 만들수도 있다.
    const { video,thumb} = req.files;
    // fields로 파일2개(영상업로드,썸네일업로드)를 받으므로, req.file이 아니라 req.files이다. single이었으면 req.file이었을것.
    // video -> MyRecording을 첫번쨰 원소로 가지는 배열, thumb -> MyThumbnail을 첫번째원소로 가지는 배열 -> 즉, 각각은 배열이다.
    // const {path : fileUrl} = req.file; -> single이라서 file단수다.(video만 업로드 할 땐 multer-> single로 썼다.)
    // form에 올려서 post한 파일이 req.file에 담겨있다.

    try{
    const newVideo = await Video.create( {
        title,
        fileUrl: video[0].path,
        thumbUrl: thumb[0].path,
        // 위에서 선언한 req.files의 객체인 video랑 thumb array의 첫번째원소의 element 인 path이다.(URL)
        description,
        hashtags:Video.formatHashtags(hashtags),
        meta: {
            views:0,
            rating:0,
        },
        owner: _id,
        //Video에 현재 로그인된 유저(즉,업로드하는 유저)의 id를 넣어주었다.->나중에 비디오를 켰을때 누가 업로드 했는지 띄우려고.
    });
    // document에는 id가 필요하므로 mongoose가 id 를  알아서 부여해준다.
    const user = await User.findById(_id)
    // 현재 영상을 올리려고 로그인한 유저의 id 
    user.videos.push(newVideo._id);
    // videos array에 새로 업로드하는 video의 id를 추가한다.
    user.save();
    res.redirect("/");
    req.flash("info","Upload Completed");
}catch(error){
    return res.status(400).render("upload", { 
        pageTitle:"Uspload Video" ,
        errorMessage:error._message,
    });
}
} 
export const login = (req,res) => res.send("login!");
export const deleteVideo = async(req,res) => {
    const { id } = req.params;
    // 현재 접속한 video의 url 
    const { 
        session: {
            user: {_id},
        },
    }= req;
    const potato = await Video.findById(id);
    if(!potato){
        return res.status(404).render("404",{pageTitle: "Video Not Found"});
    }
    if( String(potato.owner) !== String(_id)){
        // 두개는 object와 string으로 타입이 다르다. !==는 데이터타입까지 비교하므로 형변환해주기.
        return res.status(403).redirect("/");
        // 403: forbidden code
    }
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
}
// export default trending; 
// default 로 export하는것은 오직 한가지만 내보낼 수 있다.
// 여러개 내보내야 할땐 각각을 export한다.

export const search = async(req,res) => {
    const { keyword } = req.query;
    // req.query를 통해 input에 입력한 값을 나타낸다. < input의 name: 입력한 값>형태로 출력.
    let videos = []; 
    // empty array 로 videos 선언해놓기. if문에서 변경해나갈것.
    if(keyword){
        // const videos = Video.find({}); if버블안에다 videos를 선언하면 if밖에서 render할때 videos는 undefined 에러가 뜬다.
        videos = await Video.find({
            title: {
                $regex : new RegExp(`${keyword}$`, "i"),
                // i : 대소문자 상관없이 검색해줌.
                // RegExp : contain방식의 regular expression 만들어줌. 즉, keyword를 포함한 비디오를 찾아줌.
                // `^${keyword}` : keyword 로 시작하는 비디오를 찾아줌.
                //`${keyword}$` : keyword로 끝나는 비디오를 찾아줌.
            }
        }).populate("owner");
    }
    return res.render("search", {pageTitle : "Search" , videos});
};


