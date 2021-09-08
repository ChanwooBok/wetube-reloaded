import User from "../models/User.js";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import Video from "../models/Video.js";
import Comment from "../models/Comment.js";

export const remove = (req,res) => res.send("Remove");

export const getJoin = (req,res) => res.render("join", {pageTitle: "Join"});
export const postJoin = async(req,res) => {
    const {name,email,username,password,password2,location} = req.body;
    const pageTitle =  "Join";
    if( password !==password2){
        return res.status(400).render("join",{
        pageTitle,
        errorMessage:"Password does not match ."
        });
        }
    // const usernameExists = await User.exists({username});
    // if(usernameExists){
    //     return res.render("join",{
    //         pageTitle,
    //         errorMessage:"This email is already Taken."
    //     });
    // }

    // const emailExists = await User.exists({email});
    // if(emailExists){
    //     return res.render("join",{
    //         pageTitle,
    //         errorMessage:"This email is already Taken."
    //     });
    // }
        // < 위와 같이 쓰는건 너무 귀찮다. username과 email두개를 체크>
        // $or 기능을 써서 한번에 체크하자. : [] 안의 조건들중 하나라도 true면 값을 true반환함.(boolean값)
        const exists = await User.exists({ $or: [{ username }, { email }] });
        // User 모델 database에서 form에서 새로 가입하려는 user로부터 입력받은 username,email 과 같은 내용이 존재하는지 찾아주는것.
        if (exists) {
            return res.status(400).render("join", {
          pageTitle,
          errorMessage: "This username/email is already taken.",
        });
        }
        // 구글 크롬이 계정생성에 오류가 있어서 제대로 생성되지 않아도 아이디와 패스워드를 저장할거냐고 물어봄. 그건 구글크롬이 아디,비번으로 요청을 보냈다가 우리가 200으로 status code를보내줬기 때문에 계정이 제대로 생성되었다고 착각하는것임.
        // 따라서,에러가 났을경우 status code 400 으로 구글 크롬에게 신호를 줘야 함.
    try{
        await User.create({
        name,
        email,
        username,
        password,
        location,
        })
    return res.redirect("/login")
    }catch(error){
        return res.status(400).render("join", { 
            pageTitle:"Join" ,
            errorMessage:error._message,
        });
    }
};

export const getLogin = (req,res) => res.render("login", {pageTitle: "Login"});
export const postLogin =async(req,res) => {
    //check if account exists.
    //check if password correct.
    const {username,password} = req.body;
    const user = await User.findOne({username, socialOnly:false});
    // socialOnly:true인 사람은 password 가 존재하지 않다 . ->이런 사람은 continue with github로 로그인 해야한다.
    if(!user){
        return res.render("login",{
            pageTitle:"Login",
            errorMessage: "An account with this username does not exist",
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", { 
            pageTitle:"Login" ,
            errorMessage: "Wrong password",
        });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    // 각 브라우저마다 다른 session id를 가지고 있다. 우리는 session object에 loggedIn과 user라는 정보를 추가해주는것이다.
    // session은 로그인 할 떄 한번만 작성되고 있다.로그인 후에는 session을 건들지 않기 때문에 user가 그대로 남아있음.
    return res.redirect("/");
};

export const startGithubLogin = (req,res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id : process.env.GH_CLIENT,
        allow_signup : false,
        scope:"read:user user:email",
        // 모든건 scope 에서 시작한다.
        // scope는 space(공백)으로 조건을 이어야한다.
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}

export const finishGithubLogin = async(req,res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id:process.env.GH_CLIENT,
        client_secret:process.env.GH_SECRET,
        // 환경변수로 지정한 이유: secret은 나만봐야하고, id는 여러번 일일이 쓰기 번거로워서.
        code : req.query.code
        // github가 주는 code (시간이 지나면 만료됨)
        // config object의 parameter 는 반드시 ,https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps 
        // 사이트의 나와있는 parameter값을 가져야 한다.
    }
    const params = new URLSearchParams(config).toString();
    // config에 나온 내용을 toString 즉, 한줄로 모두 엮어준다.
    // console.log(params); -> client_id=bbdce9f9f2c8a42f18bf&client_secret=9ab9f466940f69aeb2749b89f0595b3e2f1f968a&code=a4055283f9d472b77865
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    })).json();
    if( "access_token" in tokenRequest){
        const {access_token} = tokenRequest;
        // const access_token = tokenRequest.access_token 의 es6버전
        const apiUrl = "https://api.github.com"
        // github의 api 로 이동하는 url
        const userData = await (await fetch(`${apiUrl}/user`, {
            // code를 access_token로 바꾸고 그걸로 github API에 간다.-> user 의 public데이터를 볼 수 있다.
            // user의 public data를 볼  수 있는 이유는? startGithubLogin에서 scope: read:user로 설정했고 github가 코드를 준다.(code: req.query.code)
            //  그 code에는 우리가 요청한 read:user의 정보가 있다. 이걸 access_token으로 바꾸고 우리가 볼 수 있는것
            // 단, 이렇게만 하면 email 이 private이라 null로 보인다.
            headers:{
                Authorization: `token ${access_token}`,
            },
        })).json();
        // fetch를요청하고 fetch를 받으면 json을 돌려받음.
        // console.log(userData);
        // 여기서 userData는 내 로그인된 github 계정의 Data를 가져온다. 
        // 단, userData값중 email 이 null로서 표시가 안되므로 따로 가져오는 작업을 한다.
        const emailData = await(
            await fetch(`${apiUrl}/user/emails`, {
                headers : {
                    Authorization: `token ${access_token}`,
                },
            })).json();
        // console.log(emailData);
        // github에 로그인된 email 리스트를 보여준다. 단, primary,verified 필터는 거치지 않았다.
            const emailObj = emailData.find(
            (email) => email.primary === true && email.verified ===true 
            // github이 주는 email list에서 primary 이며 verified된 email 을 찾는다.  내가 github에 현재 로그인'한' email주소를 말한다.
        );
        // console.log(emailObj);
        // output : {
        //     email: 'titoddd@naver.com',
        //     primary: true,
        //     verified: true,
        //     visibility: 'private'
        //   } 즉, 내가 현재 github에 로그인한 메일 정보이다.
        if(!emailObj){
            return res.redirect("/login");
            // 로그인 안되어있으면 login페이지로 보내고,
        }
        let user = await User.findOne({ email: emailObj.email});
        // 현재 로그인된 github와 동일한 email(emailObj)을 가진 User가 있는지 mongoDB에서 찾는다. 있다면 그 유저는 login 시켜준다.
        if(!user){
            user = await User.create({
                name:userData.name,
                avatarUrl: userData.avatar_url,
                username:userData.login,
                email:emailObj.email,
                password:"",
                // 소셜로그인이므로 패스워드가 따로 없다.
                socialOnly:true,
                // 소셜로그인하는 것이므로 표시해준다.
                location:userData.location,
                // 여기서 userData는 github api를 이용해서 github에서 가져온 정보이다.
            });
        }
            req.session.loggedIn = true;
            req.session.user = user;
            return res.redirect("/");
            // login시켜주고 home(/)으로 보내준다.
            // 일치하는 email이 나의 site의 mongoDB에 없을경우, github에 로그인된 정보로 새로 계정을 생성해준다.
            
            req.session.loggedIn = true;
            req.session.user = user;
            return res.redirect("/");
            // 새로 만든 계정으로 로그인 완료하고 home으로 보내기.
                
    }else{
        return res.redirect("/login");
        // token은 두번씩 사용하지 못한다. 새로고침하면 자동으로 redirect될것
    }
    // res.send(JSON.stringify(json));
    // access token을 얻었다.-> token으로 Gituhb api를 이용해서 user의 정보를 얻을 수 있음
}

export const getEdit = (req,res) => {
    return res.render("edit-profile", {pageTitle: "Edit Profile" })
};
export const postEdit = async(req,res) => {
    // const {user :{id}} = req.session; 
    const {
        // 우리가 session에 login한 user의 정보를 넣어뒀다.
        session : { 
            user : {_id , avatarUrl},
            // form request에서 현재 profile을 edit하려고 하는 user의 id
            // req.session.user라는 object안에는 id 형식이 아니라, _id 가 존재하니까 주의!
        },
        body : { name,email,username,location},
        // name,email,username,location 변수들은 edit-profile 의 form에서 user가 새롭게 적어준 변수에서 오는것이다.
        // user가 이 많은 항목들중 무엇을 edit하려고 하는지 확인하고 싶으면 session.user와 여기 정보를 비교하면된다. 달라진게 user가 바꾸고자 하는 항목임.(유효성 테스트 거치자)
        // 반드시, input에는 name이 주어져야 한다. 그래야만 이렇게 불러올 수 있음.
        file,
    } = req;
    // const id = req.session.user._id 와 같은 의민데 더 섹시하게 줄인것.
    // const {name,email,username,location} = req.body; 이것도 위에 한 문장으로 줄여 넣을 수 있다.
    
    // await User.findByIdAndUpdate(_id, {
        //     name, email,username, location} );
        // name:name, email:email,username:username, location:location 일것을 express는 똑똑하므로 , : 없이 줄여써도된다.
        // 이렇게만 쓰면, db에 정보는 update되지만, session에는 update되지 않았다. 따라서 input창에 loggeInUser.내용은 바뀌지않은채 화면에 나온다.
    
    // 방법<1>session을 manual로 업데이트 해주기.
    // req.session.user = {
    //     ...req.session.user,          -----> ... 의미 : req.session.user내용을 꺼내온것.즉, avatar_url,등 기타 edit하지 않은 정보들은 그대로 두고 나머지만 새롭게 밑에서 업데이트(overlay) 하는거다.
    //     name,
    //     email,
    //     username,
    //     location,
    // };
    
    //   < Edit 할 때 , 이미 존재하는 username 이나 email로 edit 하는것을 막기 위한 알고리즘 - 다른사람 것> 
    // const findExistUsername = await User.findOne({username});
    //  기존의 database에서 form request로 입력받은 username이 존재하는지 ,존재한다면 findExistUsername으로 user object를 받는다.
    // const findExistEmail = await User.findOne({email});
    // if( findExistUsername._id != _id || findExistEmail._id != _id){
    //     return res.render("edit-profile", {
    //         pageTitle : "Edit profile",
    //         errorMessage: "This username or Email is already taken",
    //     })
    // }
    // // 기존에 있던 username을 만든 user의 id와 새로 username을 쓰려고하는 user의 id 가 일치하지 않으면 error를 낸다.

    // <유효성 검사 -다른사람 코드 >
    let errorMessages = {};
    const sessionId = req.session.user._id;
    const loggedInUser = await User.findById(sessionId);
    if( (loggedInUser.email !== email) && await User.exists({email})) {
        errorMessages = " This email is already taken.";
        return res.render("edit-profile", {pageTitle: "Edit profile" , errorMessages})
    }
    if( ( loggedInUser.username !== username) && await User.exists({username}) ){
        errorMessages = " This username is already taken.";
        return res.render("edit-profile", {pageTitle: "Edit profile" , errorMessages})
    }



    // 방법<2> 새롭게 업데이트 한 user를 정의해주기
    const updatedUser = await User.findByIdAndUpdate(_id,
        {
        avatarUrl: file ? file.path : avatarUrl,
        // edit profile시 , 프로필사진은 변경하지 않았을경우 avatarUrl 이 undefined라고 뜨는 오류해결 위한 코드.
        // file이 있을시, file.path 없을 시 avatarUrl 그대로 쓰기.
        // input에 파일을 올렸을경우, req.file이 생겨서, file.path 를 쓸 수 있지만 file없을경우 기존의 프사였던 avatarUrl을 그대로 쓴다.
        name,
        email,
        username,
        location
        },
        {new: true}
    );
        // findByIdAndUpdate는 default로 update이전의 값을 출력한다. 세번째인자로 new : true를넣어줘야 업데이트된 값이 나온다.
        
        req.session.user=  updatedUser; 
    
        // if( req.session.user 정보 == req.body.name,username.email정보) {
        //     user는 아무것도 바꾸려고 하지 않음. 그냥 넘기자.
        // }else{
        //     뭐 하나라도 다르다면,  그 다른 항목에 대해서만
        //     const existInfo = await User.exists({ $or : [ {email},{username}]});
        // }
        // const existInfo = await User.exists({ $or : [ {email},{username}]});
        //그냥 이렇게만 적으면 안되는 이유: 여러가지 항목중 user가 업데이트 하려는 항목이 무엇인지 먼저 체크해야한다.
        // 왜냐하면, 체크를 안하면, user가 이 세가지 모두 edit하지 않은경우에는, input의 value값이 session값과 같기때문에 항상 true값을 반환한다.
        // 그렇다면, session의 정보와 user가 form request한 정보를 비교해서 바뀐 항목을 찾아야 한다. 그게 user가 바꾸고자 하는 항목
        // 그 항목 중에서 이미 존재하는 database와의 값을 비교해야, 이미 존재하는 정보라고 경고를 보낼 수 있는 것이다. ( username과 email은 중복되면 안되는 unique한 항목이므로)
    return res.redirect("/users/edit");
};

export const logout = (req,res) => {
    req.session.destroy();
    req.flash("info", "Bye Bye");
    return res.redirect("/");
};

// < Change password > 
export const getChangePassword = (req,res) => {
    if(req.session.user.socialOnly === true){
        req.flash("error","Can't change password.");
    }
    return res.render("users/change-password", {pageTitle : "Change-password" });
    // change-password 를 users라는 folder안에 넣어주었으므로, 경로를 설정해주었다.
}
export const postChangePassword = async(req,res) => {
    // const { _id , password } = req.session;
    // const { oldPassword,newPassword,newPasswordConfirmation } = req.body;
    const {
        session : {
            user : {_id , password } 
        },
        body : {oldPassword,newPassword,newPasswordConfirmation },
    } = req;
    
    const ok = await bcrypt.compare(oldPassword , password);
    // session에 있는 hash 된 비밀번호가 기존 비밀번호와 일치하는지 체크
    if( !ok ){
        return res.status(400).render("users/change-password", {
            pageTitle: "Change-password",
            errorMessage : " The current Password is incorrect" 
        });
    }
    if( newPassword !== newPasswordConfirmation){
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password " , 
            errorMessage : "New Password does not match"})
        }
    const user = await User.findById(_id);
    // user를 찾아주어야 save()를 작동시킬 수 있다. save()를 작동시키는 이유는 save()를 작동시켜야 pre save middelware가 작동해서 새 비밀번호에 hash처리를 해줄 수 있기 때문이다.
    user.password = newPassword;
    await user.save(); 
    // save()는 promise타입이다. 왜냐면 Db에 정보를 저장하는데는 시간이 걸리기때문이다. -> await를 써주자.
    req.session.user.password = user.password; 
    // session에 있는 password 도 업데이트 해줘야 한다.  ---> 이게 좀 이해가 안 가기는 함.
    req.flash("info", "password Updated");
    return res.redirect("logout");
}

// < My profile>
export const see = async(req,res) => {
    const { id } = req.params;
    //const id = req.params.id;  --> id는 url에서 따왔다.-> 현재 접속한 브라우저의 고유의 id
    // session에서 id 를 가져오지 않은 이유 : my profile페이지는 누구나 접근 가능한 public페이지로 만들거기 때문.
    // 마치 인스타에서 누구나 남에 프로필을 방문할 수 있는것처럼..
    const user = await User.findById(id).populate({
        path:"videos",
        populate: {
            path:"owner",
            model:"User",
        },
    });
    // User모델에는 videos라는 array항목이 있으므로,  mongoose가 알아서 videos object를 쭉 가져와 보여줄것이다.
    // 근데, videos만 populate하면 owner에 대한 정보가 없어서 누가 업로드한건지 표시할 수 없다.
    // 따라서, double populate 한다 . 첫번째 path는 처음 populate하고 싶은거, 두번째 원하는건 다음 populate에 쓴다.
    // 더불어, model도 무엇인지 표시해준다.
    if ( !user){
        return res.status(404).render("404",{pageTitle: "User Not found."});
    }
    // const videos = await Video.find({owner: user._id });
    // 시작은 watch.pug에서 영상 등록한 사람 이름을 클릭하였을때, 그 사람이 올린 영상을 모두 보여주는것
    // 그 사람 이름을 클릭하면 /users/${video.owner._id} 로 이동한다, 그리고 rootRotuer에서 /users/:id 면 see 함수 실행하게 되어있다.
    // 현재 접속한 url 에 있는 id로 user를 찾고 그 user의 id로 등록된 video를 찾는다.
    return res.render("users/profile",{
        pageTitle: user.name,
        user : user,   //user로 줄여 쓸 수도 있음.
        // videos,
    });
}

// < comment 달기 : api Router이 안되서 여기다가함>

export const createComment = async(req,res) => {
    // console.log(req.session.user);
    // fetch request로 현재 머물고 있는 URL과 동일한 URl( localhost4000 -> localhost4000) 에 정보를 보내고 있으므로, 브라우저는 우리가 같은 frontend에서 backend로 보내는것을 알기 때문에 
    // 쿠키의 원칙에 따라 우리는 쿠키를 자동적으로 받을 수 있다.우리 backend는 쿠키를 이해할 수 있기때문에 우리는 쿠키에서 사용자정보를 받아올 수 있다.

    // const { id } = req.params;
    // const { text } =req.body;
    // const { session: {user},} = req;
    const { 
        params: { id },
        // 현재 페이지의 비디오의 id 를 따온다.
        body: { text },
        session: { user },
    } = req;
    const video = await Video.findById(id);
    // 우선, 현재 켜진 비디오를 database에서 찾는다.
    if(!video){
        return res.sendStatus(404);
        // sendStatus 와 Status 의 차이점 : sendStatus는 코드 보내고 종료시켜버린다.
    }
    const comment = await Comment.create({
        text,
        owner: user._id,
        video: id,
    });
    // comment라는 모델 이용해 생성
    video.comments.push(comment._id);
    video.save();
    return res.status(201).json({newCommentId: comment._id})
    // 201(생성완료) 코드를 보낼뿐아니라, comment의 id까지 보내줄것이다. 왜냐면 댓글을 delete request하려면 사용자의 id가 필요하기때문이다.
};


// C:\Program Files\MongoDB\Server\5.0\bin