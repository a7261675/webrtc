// Node.js
const port = process.env.PORT || 3000;
var app = require('express')();
const server = require('http').Server(app).listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

app.get('/s', function(req, res){
  res.sendFile(__dirname + '/share_screen.html');
});

app.get('/t', function(req, res){
  res.sendFile(__dirname + '/teacher_screen.html');
});

room_list = new Array();

// Socket.io
const io = require('socket.io')(server);

function findNowRoom(client) {
  return Array.from(client.rooms).find(item => {
      return item.includes('room');
    });
  }


io.on('connection', client => {
  console.log(`socket 用戶連接 ${client.id}`);

  client.on('joinRoom', room => {
    const nowRoom = findNowRoom(client);
    if (nowRoom) {
      client.leave(nowRoom);
    }
    client.join(room);

    // console.log('client_id');
    // console.log(client.id);
    // console.log(room);
    // room_list[room] = client.id;

    io.to(room).emit('roomBroadcast', '已有新人加入聊天室！');
  });

  client.on('peerconnectSignaling', message => {
    // console.log('接收資料：', message);
    const nowRoom = findNowRoom(client);
    // console.log('now room: ');
    // console.log(room_list['teacher_room']);
    client.to(nowRoom).emit('peerconnectSignaling', message)
  });

  client.on('backVideoSignaling', message => {
    // console.log('接收資料：', message);
    const nowRoom = findNowRoom(client);
    // console.log('now room: ');
    // console.log(room_list['teacher_room']);
    client.to(nowRoom).emit('backVideoSignaling', message)
  });

  client.on('disconnect', () => {
    console.log(`socket 用戶離開 ${client.id}`);
  });
});

