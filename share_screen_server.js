// Node.js
const port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var app = require('express')();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
const server = require('http').Server(app).listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
var mysql  = require('mysql');
var connection = mysql.createConnection({     
  host     : 'localhost',
  user     : 'admin',              
  password : '123456',       
  port: '3306',              
  database: 'admin_new' 
}); 
connection.connect();

app.get('/s', function(req, res){
  res.sendFile(__dirname + '/student_screen.html');
});

app.get('/t', function(req, res){
  res.sendFile(__dirname + '/teacher_screen.html');
});

app.get('/student_list_window', function(req, res){
  res.sendFile(__dirname + '/student_list_window.html');
});

app.post('/add_student_data', function(req, res){
  student_id = req.body.student_data.id;
  student_name = req.body.student_data.name;
  var sql = 'INSERT INTO student_data (student_id, student_name) VALUES ("' + student_id + '", "'+ student_name +'");';
  console.log(sql);
  connection.query(sql,function (err, result) {
      if(err){
        console.log('[INSERT STUDENT DATA ERROR] - ',err.message);
        res.json({message: '[INSERT STUDENT DATA ERROR] - '+err.message});
      }
      console.log(result);
      res.json({result: result.affectedRows, id: result.insertId});
  });
});

app.get('/get_student_data', function(req, res){
  var sql = 'SELECT * FROM student_data;';
  console.log(sql);
  connection.query(sql,function (err, result) {
      if(err){
        console.log('[SELECT FROM STUDENT DATA ERROR] - ',err.message);
        res.json({message: '[SELECT FROM STUDENT DATA ERROR] - '+err.message});
      }
      res.json({student_data_list: result});
  });
});

app.delete('/delete_student_data/:student_id', function(req, res){
  var sql = 'DELETE FROM student_data WHERE id = ' + req.params.student_id + ';';
  console.log(sql);
  connection.query(sql,function (err, result) {
      if(err){
        console.log('[DELETE FROM STUDENT DATA ERROR] - ',err.message);
        res.json({message: '[DELETE FROM STUDENT DATA ERROR] - '+err.message});
      }
      console.log(result);
      res.json({result: result.affectedRows});
  });
});

app.post('/authenticate_student_data', function(req, res){
  student_id = req.body.student_data.id;
  student_name = req.body.student_data.name;
  var sql = 'SELECT * FROM student_data WHERE student_id = "'+ student_id + '" AND student_name = "' + student_name +'";';
  console.log(sql);
  connection.query(sql,function (err, result) {
      if(err){
        console.log('[AUTHENTICATE STUDENT DATA ERROR] - ',err.message);
        res.json({message: '[AUTHENTICATE STUDENT DATA ERROR] - '+err.message});
      }
      console.log(result);
      res.json({result: result});
  });
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

  client.on('studentSendToTeacherSignaling2', message => {
    const nowRoom = findNowRoom(client);
    client.to(nowRoom).emit('studentSendToTeacherSignaling2', message)
  });

  client.on('teacherSendToStudentSignaling', message => {
    const nowRoom = findNowRoom(client);
    client.to(nowRoom).emit('teacherSendToStudentSignaling', message)
  });

  client.on('teacherSendToStudentSignaling2', message => {
    const nowRoom = findNowRoom(client);
    client.to(nowRoom).emit('teacherSendToStudentSignaling2', message)
  });

  client.on('disconnect', () => {
    console.log(`socket 用戶離開 ${client.id}`);
  });
});

