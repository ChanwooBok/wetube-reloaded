const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

// < fake comment 만들기 > 
const addComment = async(text,id) => {
    // html로 된 댓글을 js로 만들기. pug가 아닌 js로 만드는것.-> html element를 통째로 pug처럼 만들기
    // 왜냐면 pug는 새로고침없이는 rendering되지 않기때문에 비효율적이다.
    // 즉, fake 로 frontend에 실시간처럼 댓글달기.
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    // backend에서 return값으로 보내준 response에서 newCommentId 값을 json추출하여 새로 작성된 댓글의 dataset에 id를 붙여준다.
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    const span2 = document.createElement("span");
    span2.innerText = "🍘"
    
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.innerText = ` ${text}`
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);
    // prepend는 appendchild 와 반대로 앞에다가 달아준다.
    
    
    // 이때는 x를 보여줘도 된다. 내가 댓글을 달았을때만 발생하는 함수기 떄문에 내가 지울 수 있다
}

const handleSubmit = async(event) => {
    const textarea = form.querySelector("textarea");
    // login이 안되있을땐, form이 없기때문에 null이 될경우 에러가 난다. 따라서, 이 코드를 함수안에다 선언한다. 
    event.preventDefault();
    // submit의 기본 방식인 자동 submit후 새로고침을 취소한다.
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    // view 조회 하기 기능에서 설정했던 dataset의 id를 이용한다.
    if(!text){
        return;
    }
    const response = await fetch(`/users/videos/${videoId}/comment`, {
        // fetch로 전달하는 정보는 JSON data 타입이다.(json정보는 backend가 return하는값이다.)
        //req.body에 text를 추가해준다.
        // <문제점> : fetch는 backend로 가야하고 db랑 뭔가를 하고나서 status code를 반환해야해서 시간이 좀 오래걸리기 때문에 awaite써줬다.
        // JS로 댓글을 만들어보자.-> 빠르고 페이지를 새로고침 할 필요 없음,
        //fetch는 URL의 이동없이 현재 URL에서 backend로 request 를 보내준다.
        // fetch는 promise<Response>로서, promise 즉, 시간이 걸린다. 대신 시간지나면 response를 준다.
        // console.log(response); 해보면 status code를 준다. 이 status를 받아오자.
        // response.status
        method: "POST",
        // body:{text},
            // const obj = { text: "lalala"} 와 같은 object를 string으로 바꿔서 
            // obj.toString() 하면 "[object object]" 와 같은 결과가 나온다. 즉 우리가 원하는 text내용그대로를 얻지 못한다. 
        // body: text,
        // 따라서, obj를 받아오지 말고, 그냥 text 자체를 받아오자.
        headers: {
            //header는 request에 대한 정보를 담고 있다.
            // 그래 이건 req.body는 string처럼 보이지만, 반드시 express.Json()에 의해서 처리해야해 ! 라고 알려줘야함.
            "Content-Type": "application/json",
        },
        body: JSON.stringify({text}),
        // 하지만, 만약, body: text에서 text댓글만이 아니라 2개 이상의 정보(예를들면, 댓글,rating)를 받아와야 할 경우 object를 쓸 수 밖에 없다.(항목이 여러개라서)
        //  object를 string으로 바꿔주는 json.stringify를 써주자.
        // 우리가 backend에게 json string을 보내주면 middleware덕분에 json object로 바꿔준다. 
        // ->object라서 usercontroller의 createComment함수에서 const { body : { text }} = req; 와 같이 가져다 쓸 수 있는것이다. 
        // body: JSON.stringify({text , rating})
    });
    
    // window.location.reload();
    // reload는 다시 새로고침하는거라 db를 다녀와야 해서 비효율적이다. JS로 fake 댓글달기 해보자.
    if(response.status ===201){
        textarea.value = ""; 
        // const json = await response.json();
        // backend에서 return 값으로 json object를 보내주면 우리는 response안에서 json을 추출한다.
        const { newCommentId } = await response.json();
        // json 오브젝트를 추출해서 comment._id를 value로 가지는 newCommentId 를 얻었다. 이걸로 댓글을 작성한 자의 id를 얻을 수 있다.
        addComment(text,newCommentId);
    }
};

if(form){
    // 로그인 되어있지 않은 유저는 form이 나타나지 않으므로 함수도 form이 나타난 경우에만 수행되도록 한다.
form.addEventListener("submit",handleSubmit);
}

//  < comment 삭제 > 



// const deleteComment = () => {
//     console.log("delete!");
//     videoComments.removeChild(videoComment);
// }

// deleteBtn.addEventListener("click",deleteComment);

