
var amqp = require("amqplib/callback_api");
var express = require("express");
var app = express();

app.get('/', function (req, res) {
    amqp.connect("amqp://yuvzailr:H59aEL4rstxeP6nJm5Tzt71yeymhPOhM@elephant.rmq.cloudamqp.com/yuvzailr", function (err, conn) {
        conn.createChannel(function (err, ch) {
          var queue_name = "listen_for_goal";
          ch.assertQueue(queue_name, { durable: false });
          ch.consume(queue_name, function (msg) {
            console.log(msg.content.toString());
          }, { noAck: true });
        });
    });
    
})

app.listen(3000, function () {
  console.log("server running on port 3000");
})