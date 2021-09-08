
// import {createFFmpeg, fetchFile,createFFmpegCore } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");
let stream;
let recorder;
let videoFile;

const files = {
    input: "recording.webm",
    output: "output.mp4",
    thumb: "thumbnail.jpg",
};



const handleDownload = async () => {
    actionBtn.removeEventListener("click",handleDownload);
    // download버튼을 누르면 더 이상 누르지 못하도록 하기위함.
    actionBtn.innerText = "Transcoding...";
    actionBtn.disabled = true;

    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
  
    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
    //FS:file System. videoFile은 브라우저에 저장한 URL이다.
    await ffmpeg.run("-i", files.input, "-r", "60", files.output);
    //  recording.webm파일을 input해서 초당 60프레임으로 output.mp4파일로 인코딩한다.
    
    await ffmpeg.run("-i",files.input,"-ss","00:00:01","-frames:v", "1",files.thumb)
    // input한 파일의 해당시간으로 이동해서 1장의 스크린샷을 찍어준다. (일종의 ffmpeg명령어 이니 크게 신경쓰지말것. 문서에 나와있음)
    const mp4File = ffmpeg.FS("readFile", files.output);
    // readfile은 ffmpeg명령어이다.
    const thumbFile = ffmpeg.FS("readFile",files.thumb);

    const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
    // 버퍼를 꼭 해줘야 한다. -> 강의 다시 보기
    const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

    const mp4Url = URL.createObjectURL(mp4Blob);
    // blob을 만들었으니 blob을 위한 URL을 만들어야 한다.
    const thumbUrl = URL.createObjectURL(thumbBlob);

    const downloadFile = (fileUrl,fileName) =>{
        const a = document.createElement("a");
        a.href = fileUrl;
        // 이 function에서도 videoFile에 접근할 수 있도록 let으로 선언해놓았음.
        a.download = fileName;
        // a 태그에 download attribute가 존재하는데, 곧바로 download받을 수 있도록 도와준다.
        document.body.appendChild(a);
        a.click();
        // a태그를 우리가 굳이 클릭하지 않아도 클릭 한것과 같은 효과를 보여줌.즉, 바로 다운로드 창이 뜨게 함.
    }
    downloadFile(mp4Url,"MyRecording.mp4");
    downloadFile(thumbUrl,"MyThumbnail.jpg");

    actionBtn.disabled = false;
    actionBtn.innerText = "Record Again";
    actionBtn.addEventListener("click",handleStart)
};

const handleStop = () => {
    actionBtn.innerText = "Donwload Recording";
    actionBtn.removeEventListener("click",handleStop);
    actionBtn.addEventListener("click",handleDownload);
    recorder.stop();
    // stop버튼을 누르면 녹화를 멈추게 됨.
};

const handleStart = () => {
    actionBtn.innerText = "Recording";
    actionBtn.disabled= true;
    actionBtn.removeEventListener("click",handleStart);
    recorder = new MediaRecorder(stream , {mimeType : "video/webm"});
    recorder.ondataavailable = (event) => {
        videoFile = URL.createObjectURL(event.data)
        // 접근할 수 있는 파일을 생성. 즉, 파일은 브라우저의 메모리상에 있음.
        // 브라우저에 저장한 URL로 preview에서 보여준다. 
        // 이 URL은 브라우저가 파일을 보여주는 방법일뿐
        // 파일을 미리보거나 보고싶을 땐 이 URL이 필요함. 
        video.srcObject = null;
        // null로 선언하는 이유는?..
        video.src = videoFile;
        video.loop = true;
        // preview영상을 반복적으로 틀어줌.
        video.play();
        actionBtn.innerText = "Download";
        actionBtn.disabled = false;
        actionBtn.addEventListener("click",handleDownload);
        };
    recorder.start();
    setTimeout( () => {
        recorder.stop();
    }, 5000);
};

const init = async() => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true,
    });
    video.srcObject =stream;
    video.play();
    // 카메라켜고 녹화창을 띄우게 함.
};

init();



actionBtn.addEventListener("click",handleStart);
