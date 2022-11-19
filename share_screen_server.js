// Node.js
const port = process.env.PORT || 3000;
var app = require('express')();
const server = require('http').Server(app).listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/share_screen.html');
});

// Socket.io
const io = require('socket.io')(server);

function findNowRoom(client) {
  return Object.keys(client.rooms).find(item => {
      return item !== client.id
    });
  }


io.on('connection', client => {
  console.log(`socket 用戶連接 ${client.id}`);

  client.on('joinRoom', room => {
    console.log('this is join room');
    console.log(room);
    const nowRoom = findNowRoom(client);
    if (nowRoom) {
      client.leave(nowRoom);
    }
    console.log('this is join room2');
    console.log(client.rooms);
    client.join(room);
    console.log(client.rooms);
    io.to(room).emit('roomBroadcast', '已有新人加入聊天室！');
  });

  client.on('peerconnectSignaling', message => {
    // console.log('接收資料：', message);
  
    const nowRoom = findNowRoom(client);
    console.log(client.rooms);
    console.log(nowRoom);
    client.to('secret room').emit('peerconnectSignaling', message)
  });

  client.on('disconnect', () => {
    console.log(`socket 用戶離開 ${client.id}`);
  });
});

