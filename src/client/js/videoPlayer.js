const video = document.querySelector("video")
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");

// <global 변수 만들어주기>
let volumeValue = 0.5;
video.volume = volumeValue;

//  < play, mute button 세팅 >

const handlePlayClick  = (e) => {
    if(video.paused){
        video.play();
    }else{
        video.pause();
    }
    playBtn.innerText = video.paused ? "Play" : "Pause"    
};

// const handlePause = () => { playBtn.innerText = "Play"};
// const handlePlay = () => {playBtn.innerText = "Pause"};


//  < mute 버튼 세팅 > 
const handleVolumeChange = (event) => {
    // console.log(event.target.value);
    const { target : {value}} = event;
    if(video.muted){
        video.muted= false;
        muteBtn.innerText = "Mute";
    }
    volumeValue = value;
    video.volume = volume;
}
volumeRange.addEventListener("input",handleVolumeChange);
// input : 내가 매번 클릭하고 이동할 떄 마다 일어나는 event임


const handleMute = (e) => {
    if(video.muted){
        video.muted = false;
    }else{
        video.muted = true;
    }
    muteBtn.innerText = video.muted ? "Unmute" : "Mute";
    volumeRange.value = video.muted ? 0 : volumeValue;
    // volumeValue값을 따로 지정해준 이유 : mute했다가 다시 unmute했을 때 , 원래 유저가 세팅한 볼륨값을 돌려주고 싶어서.
}


playBtn.addEventListener("click",handlePlayClick);
muteBtn.addEventListener("click",handleMute);
// video.addEventListener("play",handlePlay);
// video.addEventListener("pause",handlePause);

// < video 플레이어 의 진행시간 표시하기 > 

const formatTime = (seconds) => 
    new Date(seconds * 1000).toISOString().substr(11, 8);
    // 왜 여기서 => 다음을 {}로 감싸면 작동이 안되는 걸까?


const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    // metadata로 video의 duration등의 속성을 알 수 있음.
    timeline.max = Math.floor(video.duration);
    // timeline range의 max를 watch.pug에서 미리 정하지 않았음 ( 이유 : 우리가 업로드할 비디오의 길이를 아직 모르기 때문) 
    // 비디오의 길이를 metadata로 알고 있으니 지정해준다.
};
const handleTimeUpdate = () => {
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
    // player를 조절함으로써, timeline을 컨트롤 할 수 있게 됨.
}

video.addEventListener("loadedmetadata",handleLoadedMetadata);
// loadedmetadata : metadata란 video에서 영상을 제외한 나머지 모든것들을 의미함. 예) 비디오 길이, 비디오 시간, 비디오 볼륨..등등모든것들
// (html에서 기본적으로 제공하는 video의 attribute중 하나임)
video.addEventListener("timeupdate",handleTimeUpdate);
// timeupdate : video시간이 변경되는걸 감지하는 event (html에서 기본적으로 제공하는 video의 attribute중 하나임)

// < input = "range"를 활용한 timeline 만들기 > 
const timeline = document.getElementById("timeline");
const handleTimelineChange = (event) =>{
    const{
        target: {value},
    } = event;
    // event.target.value 를 Es6 스타일로 짧게 쓴 것.
    video.currentTime = value;
    // timeline을 조절함으로써 player의 비디오 시간을 컨트롤 하게 만듦.
}

timeline.addEventListener("input",handleTimelineChange);


// < API를 이용한 Full screen 버튼 세팅 > 

const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
// videoContainer로 통쨰로 묶어준 이유 : video.requestFullscreen하면 video만 커지고 각종 버튼들은 안 커지는 오류 발생해서.


const handleFullscreen = () => {
    const fullscreen  = document.fullscreenElement;
    if(fullscreen){
        document.exitFullscreen();
        // document차원에서 불러야 한다.
        fullScreenBtn.innerText = "Enter Full Screen"
    }else{
        videoContainer.requestFullscreen();
        // element차원에서 불러야 한다.
        fullScreenBtn.innerText = "Exit Full Screen"
    }
};

fullScreenBtn.addEventListener("click",handleFullscreen);

// < 마우스를 창에 둘때,떠날때 비디오 컨트롤이 생기고 사라지게 만들기 > 

let controlsTimeout = null;
// 마우스가 창에서 나갔다가 다시 들어왔을 경우 showing클래스가 사라지지 않게하기(timeout없애기)  위한 global variable

let controlsMovementTimeout = null;

const videoControls = document.getElementById("videoControls");

const hideControls = () =>  videoControls.classList.remove("showing");

const handleMouseMove = () => {
    if(controlsTimeout){
        clearTimeout(controlsTimeout);
        controlsTimeout= null;
    }
    // 만약,마우스가 나갔다가 다시 들어왔는데 ,timeout이 설정되어있을경우 이를 없애고 null값으로 초기화 해줌.
    if(controlsMovementTimeout){
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null;
    }
    // #비디오 창에서 마우스를 끊임없이 움직일 경우 :
    //  handleMouseMove가 끊임없이 실행됨-> hidecontrol하는 timeout이 만들어짐 -> 그러나, 위의 controlsMovementTimeout 조건문에 의해서 해당 timeout은 바로 취소됨
    // -> 즉, 마우스를 계속 움직인다면, timeout은 실행되지 않고  control창은 hide되지 않음.
    //  #비디오 창에서 마우스를 움직이다 멈췄을 경우 : 
    //  hidecontrol하는 timeout이 만들어짐-> 더 이상 handleMouseMove가 실행되지 않으므로,  controlsMovementTimeout 조건문이 old한 timeout을 취소시키지 못함.
    // -> 즉, 마우스를 멈추게 되면, timeout이 실행되서 control창은 hide 됨.
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls,3000);
    // 마우스를 움직일 떄 마다 timeout 을 만든다. setTimout의 id를 받아야 취소해줄수도 있으므로 controlsMovementTimeout라는 전역변수를 만들었다.
}

const handleMouseLeave = () => {
    controlsTimeout = setTimeout( hideControls, 3000);
    // controlsTimeout이라고 아예 정해주었음. 그래야 clear 할 수 있으니까.
}

video.addEventListener("mousemove",handleMouseMove);
video.addEventListener("mouseleave",handleMouseLeave)
// 다양한 mouse action이 있음.