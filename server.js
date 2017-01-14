var express = require('express');
var app = express();
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //res.header("Access-Control-Allow-Headers", "X-Requested-With");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
	//res.header("Access-Control-Allow-Headers", "Content-Type");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    //res.header("Content-Type", "application/json;charset=utf-8");
	//res.header("Content-Type", "application/x-www-form-urlencoded");

    next();
});
/*
	"Access-Control-Allow-Header":"Content-Type",
	"Access-Control-Allow-Methods":"*",
	"Access-Control-Allow-Origin":"*"
*/
  

var fs = require("fs");
var multer = require("multer");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var os = require("os");
var path = require("path");

var ejs = require("ejs");
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set('view option',{layout:false});

var Login = require("./login");
login = new Login();
var Register = require("./register");
register = new Register();
var Info = require("./info");
info = new Info();
var Room = require("./room");
room = new Room();

//the directory with the html and css files
var htmld = __dirname + "/public/html/";
var cssd = __dirname + "/public/css/";
var jsd = __dirname + "/public/js/";

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: '/tmp/'}).array('image'));
app.use(cookieParser())

app.get('/', function (req, res) {
   res.sendFile( htmld + "index.html" );
   //res.sendFile( cssd + "index.css");
   //res.sendFile( jsd + "index.js");
	console.log("Cookies: ", req.cookies)
})

app.get('/index.html', function (req, res) {
   res.sendFile( htmld + "index.html" );
   //res.sendFile( cssd + "index.css");
   //res.sendFile( jsd + "index.js");
	console.log("Cookies: ", req.cookies)
})

app.get('/login.html', function (req, res) {
   res.sendFile( htmld + "login.html" );
})

app.get('/register.html', function (req, res) {
   res.sendFile( htmld + "register.html" );
})

app.post('/login', function (req, res) {
	console.log("login post");
	console.log(req.body);
	login.userLogin(req, res);
	//res.end(login.userLogin(req));
})

app.post('/register', function (req, res) {
	console.log("register post");
    register.userRegister(req, res);
	//res.end(register.userRegister(req));
})

app.get('/info.html', function (req, res) {
   //res.sendFile( htmld + "info.html" );
	if(req.cookies.length == 0 || req.cookies.name == "")
	{
		console.log("please login first");
		res.sendFile(htmld + "login.html");
	}
	else{
		info.show(req, res, req.cookies.name);
	}
})

app.post('/addByName', function (req, res) {
	console.log("add friend by name");
	info.addFriendByName(req, res);
})

app.post('/addByPhone', function (req, res) {
	console.log("add frined by phone");
	info.addFriendByPhone(req, res);
})

app.post('/addByEmail', function (req, res) {
	console.log("add frined by email");
	info.addFriendByEmail(req, res);
})

app.post('/addByHobby', function (req, res) {
	console.log("add friend by hobby");
	info.addFriendByHobby(req, res);
})

app.post('/addByHobby2', function (req, res) {
	console.log("add frined's friend by hobby");
	info.addFriendByHobby2(req, res);
})

app.post('/subByName', function (req, res) {
	console.log("remove friend by name");
	info.subFriendByName(req, res);
})

app.get('/room.html', function (req, res) {
   //res.sendFile( htmld + "room.html" );
   //NOTICE:no length for cookies
   console.log("req method: " + req.method);
   console.log("req url: "+req.url);
	if(req.cookies.name == "") {
		console.log("please login first");
		res.sendFile(htmld + "login.html");
	}
	else{
		res.sendFile(htmld + "room.html");
		//room.show(req, res, req.cookies.name);
	}
})

//return the data using in this page to ajax
app.post('/showMessage', function (req, res) {
	console.log("to display the messages related with a user");
	room.showMessage(req, res);
})

app.post('/showReply', function (req, res) {
	console.log("to display the reply of a message");
	room.showReply(req, res);
})

app.post('/showPraise', function (req, res) {
	console.log("to display the praise of a message");
	room.showPraise(req, res);
})

app.post('/addReply', function (req, res) {
	console.log("get a reply");
	room.addReply(req, res);
})

app.post('/addPraise', function (req, res) {
	console.log("get a praise");
	room.addPraise(req, res);
})

app.post('/addMessage', function (req, res) {
	console.log("get a message");
	//console.log(req.body);
	room.addMessage(req, res);
})

//==========================================================================================================================================

app.get('/upload', function (req, res) {
   res.sendFile( __dirname + "/" + "upload.html" );
})

app.get('/process_get', function (req, res) {
   // 输出 JSON 格式
   response = {
       first_name:req.query.first_name,
       last_name:req.query.last_name
   };
   console.log(response);
   res.end(JSON.stringify(response));
})

app.post('/process_post', urlencodedParser, function (req, res) {
   // 输出 JSON 格式
   response = {
       first_name:req.body.first_name,
       last_name:req.body.last_name
   };
   console.log(response);
   res.end(JSON.stringify(response));
})

app.post('/file_upload', function (req, res) {
   console.log(req.files[0]);  // 上传的文件信息
   var des_file = __dirname + "/tmp/" + req.files[0].originalname;
   fs.readFile( req.files[0].path, function (err, data) {
        fs.writeFile(des_file, data, function (err) {
         if( err ){
              console.log( err );
         }else{
               response = {
                   message:'File uploaded successfully', 
                   filename:req.files[0].originalname
              };
          }
          console.log( response );
          res.end( JSON.stringify( response ) );
       });
   });
})

app.get('/listUsers', function (req, res) {
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });
})

var user = {
   "user4" : {
      "name" : "mohit",
      "password" : "password4",
      "profession" : "teacher",
      "id": 4
   }
}
app.get('/addUser', function (req, res) {
   // 读取已存在的数据
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       data = JSON.parse( data );
       data["user4"] = user["user4"];
       console.log( data );
       res.end( JSON.stringify(data));
   });
})

app.get('/:id', function (req, res) {
   // 首先我们读取已存在的用户
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       data = JSON.parse( data );
       var user = data["user" + req.params.id] 
       console.log( user );
       res.end( JSON.stringify(user));
   });
})

var id = 2;
app.get('/deleteUser', function (req, res) {

   // First read existing users.
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       data = JSON.parse( data );
       delete data["user" + id];
       
       console.log( data );
       res.end( JSON.stringify(data));
   });
})

var server = app.listen(8888, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("The address is http://%s:%s", host, port)

})
