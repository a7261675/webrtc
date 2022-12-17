// Node.js
const port = process.env.PORT || 3000;
var app = require('express')();
const server = require('http').Server(app).listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

app.get('/s', function(req, res){
  res.sendFile(__dirname + '/student_screen.html');
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
    io.to(room).emit('roomBroadcast', '已有新人加入聊天室！');
  });

  client.on('studentSendToTeacherSignaling', message => {
    const nowRoom = findNowRoom(client);
    client.to(nowRoom).emit('studentSendToTeacherSignaling', message)
  });

  client.on('teacherSendToStudentSignaling', message => {
    const nowRoom = findNowRoom(client);
    client.to(nowRoom).emit('teacherSendToStudentSignaling', message)
  });

  client.on('disconnect', () => {
    console.log(`socket 用戶離開 ${client.id}`);
  });
});

