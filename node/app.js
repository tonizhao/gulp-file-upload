var app             = require('express')();
var http            = require('http');
var server          = require('http').createServer(app);
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var multer = require('multer'); // v1.0.5
// var upload = multer(); // for parsing multipart/form-data
var appHander       = require('./routes/appHander').appHander;


// var _http   = http.Server(app);
var io      = require('socket.io')(server);
// io.on('connection', function(){ console.log('123123') });

app.use(cookieParser());
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var fileMulter = multer({ dest: './tmp/'});

// user.initSocketio(io);

app.get('/', function(req, res) {
    res.send("dont visite this");
})

server.listen('8084', function() {
    console.log('it is running');
});


//给gulp用的上传文件
app.post('/upload_proj_file', fileMulter.single('upfile'), appHander.uploadProjFile);
app.post('/upload_proj_file_diff', fileMulter.single('upfile'), appHander.uploadProjFileDiff);