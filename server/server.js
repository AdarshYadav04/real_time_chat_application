const express=require("express")
const cors=require("cors")
const mongoose=require("mongoose")

const {Server} =require("socket.io")
const { createServer } = require('http');

const connectDB=require("./config/dbconfig")
const authRouter= require("./routes/auth.router")
const chatRouter=require("./routes/chat.router");
const path = require("path");
const messageRouter=(require("./routes/message.router"))


const app=express()
const server=createServer(app)

const io =new Server(server, {
    pingTimeout: 60000,
    cors:{
        origin:"http://localhost:3000",
        
    }
  });

app.use(cors())
app.use(express.json())
connectDB()





app.use("/api/auth",authRouter)
app.use("/api/chats",chatRouter)
app.use("/api/messages",messageRouter)

  
  io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });
  
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  
    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;
  
      if (!chat.users) return console.log("chat.users not defined");
  
      chat.users.forEach((user) => {
        if (user._id == newMessageRecieved.sender._id) return;
  
        socket.in(user._id).emit("message recieved", newMessageRecieved);
      });
    });
  
    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  });


mongoose.connection.once("open",()=>{
    console.log("connected to database")
    server.listen(process.env.PORT ,()=>{
        console.log(`Server is Running on PORT ${process.env.PORT}`)
    })
})