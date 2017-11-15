
var amqp = require("amqplib/callback_api");
var express = require("express");
var http = require("http");
var app = express();
var server = http.createServer(app);
var config = require("./config.js");
var socketio = require("socket.io");
var io = socketio.listen(3080); // need diff port than express app

var url = "amqp://" + config.username + ":" + config.password + "@elephant.rmq.cloudamqp.com/" + config.username

app.get('/', function (req, res) {
  res.sendFile(__dirname + "/receive.html");
  amqp.connect(url, function (err, conn) {
      conn.createChannel(function (err, ch) {
        var queue_name = "listen_for_goal";
        ch.assertQueue(queue_name, { durable: false });
        ch.consume(queue_name, function (msg) {
          console.log(msg.content.toString());
          io.sockets.emit("new-item", msg.content.toString());
        }, { noAck: true });
      });
  });
})

app.listen(3000, function () {
  console.log("server running on port 3000");
})