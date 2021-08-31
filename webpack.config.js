const path = require("path");
console.log(path.resolve(__dirname, "assets", "js"));
//C:\Users\Chanwoo\Desktop\wetube\assets\js 와 같이 현재경로(dir)와 이후 이어지는 경로를 이어준다. /를 쓸 필요가 없음.

module.exports = {
    entry: "./src/client/js/main.js",
    mode: "development",
    // 표시하지 않을시 기본값으로 production모드로 해서 코드들이 알쏭달쏭하게 압축되버린다. 개발중임을 알려줘서 아직은 압축시키지 않도록 한다.
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "assets", "js"),
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
                // loader들에 따라 달라지는 값, 이것 이외에는 모든 webpack이 동일한 구성이다.
            }
        ]
    }
};
// webpack 이 읽을 configuration 파일을 내보낸다.

