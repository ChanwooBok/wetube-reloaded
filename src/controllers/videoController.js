let videos = [
    {title: "First Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 1,
    id: 1,
    },
    {title: "Second Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 2,
    },
    {title: "Third Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 3,
    }
    ];
export const trending = (req,res) => {
    return res.render("home", { pageTitle : "home" , videos });
} 
    // home이라는 pug를 렌더링한다.
    //Failed to lookup view "home" in views directory "C:\Users\chanwoo\Documents\wetube\views"
    //error 가 발생한다. 그 이유는 pug를담은  views라는 폴더는 cwd에 위치한게 아니라 src에 있기때문이다.
export const watch = (req,res) => {
    const { id } = req.params;
    // const id = req.params.id 와 동일 표현.위에껀 ES6스타일
    const video = videos[id -1] 
    return res.render("watch", { pageTitle : `Watching ${video.title}`, video});
}
export const getEdit = (req,res) => {
    const {id} = req.params;
    // req.params는 videoRouter.get("/:id(\\d+)/edit",getEdit);에서
    // id값이 주어지기 때문에 express가 알아서 req.params의 값을 id로 주는것.

    const video = videos[id -1] 
    return res.render("edit",{pageTitle: `Editing : ${video.title}` ,video});
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
    videos[id-1].title = potato;
    //videos의 video들의 title을 우리가 input값에 적어준 값(potato)으로
    // 업데이트 해줄 수 있다. 

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
    const newVideo = {
        // title:req.body.title,
        title,
        rating:0,
        comments:0,
        createdAt:"just now",
        views:1,
        id:videos.length+1,
    };
    videos.push(newVideo);
    res.redirect("/");
} 
export const login = (req,res) => res.send("login!");
export const deleteVideo = (req,res) => res.send("delete video");
// export default trending; 
// default 로 export하는것은 오직 한가지만 내보낼 수 있다.
// 여러개 내보내야 할땐 각각을 export한다.