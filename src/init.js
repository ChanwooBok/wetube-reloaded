import "dotenv/config";
// init.js에 dotenv를 import함으로써, server.js , db.js에서 모두 env를 읽어올 수 있다.
import "./db.js";
import "./models/Video.js"
import "./models/User.js"
import "./models/Comment.js"
import app from "./server.js"



const PORT = 4000;

const handleListening = () => console.log(`server listening on port http://localhost:${PORT}`);


app.listen(PORT, handleListening);