// Node.js
require('dotenv').config();
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
  database: 'admin_new' ,
  timezone: 'Asia/Taipei'
}); 
connection.connect();

app.get('/login', function(req, res){
  res.sendFile(__dirname + '/login.html');
});

app.get('/test_room_list_page/:student_id', function(req, res){
  res.redirect('/test_room_list_page/?id=' + req.params.student_id);
});

app.get('/test_room_list_page', function(req, res){
  res.sendFile(__dirname + '/test_room_list_page.html');
});

app.get('/student_screen/:test_room_id', function(req, res){
  res.redirect('/student_screen/?test_room_id=' + req.params.test_room_id);
});

app.get('/student_screen', function(req, res){
  res.sendFile(__dirname + '/student_screen.html');
});

app.get('/teacher_page', function(req, res){
  res.sendFile(__dirname + '/teacher_page.html');
});

app.get('/teacher_screen/:test_room_id', function(req, res){
  res.redirect('/teacher_screen/?id=' + req.params.test_room_id);
});

app.get('/teacher_screen', function(req, res){
  res.sendFile(__dirname + '/teacher_screen.html');
});

app.get('/student_list_window', function(req, res){
  res.sendFile(__dirname + '/student_list_window.html');
});

app.post('/add_student_data', function(req, res){
  student_id = req.body.student_data.id;
  student_name = req.body.student_data.name;
  var sql = 'INSERT INTO student (id, name) VALUES ("' + student_id + '", "'+ student_name +'");';
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
  var sql = 'SELECT * FROM student;';
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
  var sql = 'DELETE FROM student WHERE id = ' + req.params.student_id + ';';
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
  var sql = 'SELECT * FROM student WHERE id = "'+ student_id + '" AND name = "' + student_name +'";';
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

app.post('/add_test_room', function(req, res){
  name = req.body.test_room_data.name;
  teacher = req.body.test_room_data.teacher;
  subject = req.body.test_room_data.subject;
  start_time = req.body.test_room_data.test_start_time;
  end_time = req.body.test_room_data.test_end_time;
  student_list = req.body.test_room_data.student_list;
  var sql = `INSERT INTO test_room (name, teacher, subject, start_time, end_time, student_list) VALUES ('${name}','${teacher}','${subject}', '${start_time}', '${end_time}', '${student_list}');`;
  console.log(sql);
  connection.query(sql,function (err, result) {
      if(err){
        console.log('[INSERT TEST ROOM DATA ERROR] - ',err.message);
        res.json({message: '[INSERT TEST ROOM DATA ERROR] - '+err.message});
      }
      console.log(result);
      res.json({result: result.affectedRows, id: result.insertId});
  });
});

app.get('/get_test_room_list', function(req, res){
  var sql = 'SELECT * FROM test_room;';
  console.log(sql);
  connection.query(sql,function (err, result) {
      if(err){
        console.log('[SELECT FROM TEST ROOM DATA ERROR] - ',err.message);
        res.json({message: '[SELECT FROM TEST ROOM DATA ERROR] - '+err.message});
      }
      console.log(result);
      res.json({test_room_list: result});

  });
});

app.delete('/delete_test_room/:test_room_id', function(req, res){
  var sql = 'DELETE FROM test_room WHERE id = ' + req.params.test_room_id + ';';
  console.log(sql);
  connection.query(sql,function (err, result) {
      if(err){
        console.log('[DELETE FROM TEST ROOM DATA ERROR] - ',err.message);
        res.json({message: '[DELETE FROM TEST ROOM DATA ERROR] - '+err.message});
      }
      console.log(result);
      res.json({result: result.affectedRows});
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
    console.log('room: ' + room);
    client.join(room);
    io.to(room).emit('roomBroadcast', '已有新人加入聊天室！');
  });

  client.on('student_to_teacher_share_screen_request', video_message => {
    const nowRoom = findNowRoom(client);
    client.to(nowRoom).emit('student_to_teacher_share_screen_request', video_message)
  });

  client.on('student_to_teacher_video_call_request', video_message => {
    const nowRoom = findNowRoom(client);
    client.to(nowRoom).emit('student_to_teacher_video_call_request', video_message)
  });

  client.on('teacher_to_student_share_screen_request', video_message => {
    const nowRoom = findNowRoom(client);
    client.to(nowRoom).emit('teacher_to_student_share_screen_request', video_message)
  });

  client.on('teacher_to_student_video_call_request', video_message => {
    const nowRoom = findNowRoom(client);
    client.to(nowRoom).emit('teacher_to_student_video_call_request', video_message)
  });

  // client.on('student_to_teacher_stop_video_stream', client_information => {
  //   const nowRoom = findNowRoom(client);
  //   client.to(nowRoom).emit('student_to_teacher_stop_video_stream', client_information)
  // });

  client.on('disconnect', () => {
    console.log(`socket 用戶離開 ${client.id}`);
  });
});

