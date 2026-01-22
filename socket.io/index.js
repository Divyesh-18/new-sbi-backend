const socket = require("socket.io");
const Users = require("../models/user");
const chatApp = require("../models/chatApp");

const socketHelper = (server) => {
  const io = socket(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Add ping timeout and interval to detect disconnected clients
    pingTimeout: 60000,
    pingInterval: 25000,
    // Limit max connections per socket
    maxHttpBufferSize: 1e6, // 1MB
    // Enable compression
    perMessageDeflate: {
      threshold: 1024
    }
  });

  // Track active connections for monitoring
  let activeConnections = 0;

  io.on("connection", function (socket) {
    activeConnections++;
    console.log(`User connected: ${socket.id}, Total connections: ${activeConnections}`);

    // Betting events
    socket.on("bate", function (value) {
      io.emit("bate", value);
    });

    socket.on("oneMniBate", function (value) {
      io.emit("oneMniBate", value);
    });

    socket.on("fastWinBate", function (value) {
      io.emit("fastWinBate", value);
    });

    // Chat events
    socket.on("typing", (userId, userLogin) => {
      socket.broadcast.emit("typing", userId, userLogin);
    });

    socket.on("messageupdate", (userId, userLogin) => {
      socket.broadcast.emit("messageupdate", userId, userLogin);
    });

    socket.on("SideMenuuserList", (userId, userLogin) => {
      socket.broadcast.emit("SideMenuuserList", userId, userLogin);
    });

    socket.on("send-msg", (data) => {
      try {
        const { senderUserid, receiverUserid, message } = data;
        const received = message.senderid;
        const senderid = message.sender;
        
        message.image = message.image
          ? `${process.env.IMAGE_URL}/images/${message.image}`
          : "";

        if (
          (receiverUserid === senderid && senderUserid === received) ||
          (receiverUserid === received && senderUserid === senderid)
        ) {
          if (message.image) {
            io.emit("image-received", message);
          } else {
            io.emit("msg-received", message);
          }
          io.emit("msg-last", message);
        }
      } catch (error) {
        console.error("Error handling send-msg:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      activeConnections--;
      console.log(`Client disconnected: ${socket.id}, Reason: ${reason}, Total connections: ${activeConnections}`);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Global error handler
  io.on("error", (error) => {
    console.error("Socket.IO server error:", error);
  });

  return io;
};

module.exports = socketHelper;
