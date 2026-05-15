import "dotenv/config"
import app from "./src/App.js"
import connectDB from "./src/common/config/db.js"
import { Server } from "socket.io";
import http from "http";

import { startPollExpiryJob } from "./src/common/jobs/pollExpiry.job.js";

const PORT = process.env.PORT || 5000;


const server = http.createServer(app);

// socket init
const io = new Server(server, {
  cors: {
    origin: "https://smart-poll-mern-app.vercel.app",
     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
     credentials: true,
  }
});

// store io globally (simple approach)
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // join poll room
  socket.on("join-poll", (pollId) => {
    socket.join(pollId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const start = async () => {
    // connect to database
    await connectDB()

    // start background job
    startPollExpiryJob();
    
    // start server
    server.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT} in ${process.env.NODE_ENV } mode`)
    })
}

start().catch((err) => {
    console.error("Failed to start server", err)
    process.exit(1)
})

