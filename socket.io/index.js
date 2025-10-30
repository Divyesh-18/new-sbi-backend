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
  });

  io.on("connection", function (socket) {
    console.log("User connected", socket.id);

    // socket.on("value", function (value) {
    //   console.log("New User", value, socket.id);
    //   // socket ID will be used to send message to individual person
    //   // notify all connected clients
    //   io.emit("batenow", value);
    //   io.emit("amounts", value);
    // });
    socket.on("bate", function (value) {
      io.emit("bate", value);
    });
    socket.on("oneMniBate", function (value) {
      io.emit("oneMniBate", value);
    });
    // socket.on("amount", function (number) {
    //   console.log("New User", number, socket.id);
    //   // socket ID will be used to send message to individual person
    //   // notify all connected clients
    //   io.emit("batenow", number);
    //   io.emit("values", number);
    // });
    // socket.on("userID", function (userid) {
    //   console.log("New User", userid, socket.id);
    //   // socket ID will be used to send message to individual person
    //   // notify all connected clients
    //   io.emit("batenow", userid);
    //   io.emit("user", userid);
    // });

    // 21-04-2020
    socket.on("disconnect", function () {
      console.log(`Client connected: ${socket.id}`);
    });
  });
  io.on("disconnect", function (socket) {
    console.log(`Client connected: ${socket.id}`);
  });

  //------------------------------------------chatMessage----------------------------------------------
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("typing", (userId, userLogin) => {
      io.emit("typing", userId, userLogin);
    });
    socket.on("messageupdate", (userId, userLogin) => {
      io.emit("messageupdate", userId, userLogin);
    });
    socket.on("SideMenuuserList", (userId, userLogin) => {
      io.emit("SideMenuuserList", userId, userLogin);
    });
    socket.on("send-msg", (data) => {
      const { senderUserid, receiverUserid, message } = data;
      const received = message.senderid;
      const senderid = message.sender;
      message.image = message.image
        ? `${process.env.IMAGE_URL}/images/${message.image}`
        : "";
      if (
        receiverUserid === senderid &&
        senderUserid === received
      ) {
        if (message.image) {
          io.emit("image-received", message);
        } else {
          io.emit("msg-received", message);
        }
        io.emit("msg-last", message);
      }
      if (
        receiverUserid === received &&
        senderUserid === senderid
      ) {
        if (message.image) {

          io.emit("image-received", message);
        } else {
          io.emit("msg-received", message);
        }
        io.emit("msg-last", message);
      }

    });
  });
};

module.exports = socketHelper;
