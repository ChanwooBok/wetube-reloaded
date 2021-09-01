const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// // style-loader이라는 loader를 사용하면, javascript코드가 css파일을 읽는데,
// 우리는 css파일 따로, js파일 따로 웹팩으로 번들화 시키고싶다. 한번에 할 경우 js 로딩을 기다려야하기 때문이다.
// 그래서 MiniCssExcractPlugin.loader를 사용한다.
const path = require("path");
// import path from "path";
console.log(path.resolve(__dirname, "assets", "js"));
//C:\Users\Chanwoo\Desktop\wetube\assets\js 와 같이 현재경로(dir)와 이후 이어지는 경로를 이어준다. /를 쓸 필요가 없음.

module.exports = {
    entry: "./src/client/js/main.js",
    plugins: [
        new MiniCssExtractPlugin(
        {filename:"css/styles.css",}
    )],
    watch: true,
    mode: "development",
    // 표시하지 않을시 기본값으로 production모드로 해서 코드들이 알쏭달쏭하게 압축되버린다. 개발중임을 알려줘서 아직은 압축시키지 않도록 한다.
    output: {
        filename: "js/main.js",
        path: path.resolve(__dirname, "assets"),
        clean:true,
    },
    // entry에 있는 파일을 가지고 작업을 해서 output으로 filename을 지정해주고, 저장시킬 경로도 지정해준다.
    module: {
        rules: [
            {
                test: /\.js$/,
                // "js 를 모두 가져다가 ~"
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                          ['@babel/preset-env', { targets: "defaults" }]
                        ]
                      }
                }
                // javascript 코드를 babel-loader라는 loader로 가공하는것
                // loader들에 따라 달라지는 값, 이것 이외에는 모든 webpack이 동일한 구성이다.
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader,"css-loader","sass-loader"],
                // 역순으로 입력하는 이유: webpack은 역순으로 읽고 실행하기 떄문이다.
                //  sass-loader: scss를 css로 변형시켜줌
                //  css-loader: 
                // styles-loader: css를 브라우저에 적용시키는 역할을 함.
            }
        ]
    }
};
// webpack 이 읽을 configuration 파일을 내보낸다.

