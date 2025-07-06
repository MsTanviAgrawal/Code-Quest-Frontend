// src/socket.js
// import { io } from "socket.io-client";
// const socket = io("http://localhost:5000"); // your server's URL
// export default socket;


// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://code-quest-2081.onrender.com", {
  transports: ["websocket"]
});

export default socket;
