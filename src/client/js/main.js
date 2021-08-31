const hello = async() => {
    alert("HI it's working");
    const x= await fetch("");
}
hello();

// 브라우저가 이거를 실행하게 하려면 webpack에 이걸 전달해서 ugly한 브라우저가 알아듣는 코드로 바꿔줘야 함.