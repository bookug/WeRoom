var neo4j = require("neo4j-driver").v1;
var fs = require("fs");

var htmld = __dirname + "/public/html/";
var imgd = "../images/";

function Register() {  
	this.userRegister = function(req, res) { 
	var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
	var session = driver.session();
	name = req.body.username;
	password = req.body.password;
	repassword = req.body.repassword;
	mailbox = req.body.mailbox;
	phone = req.body.phone;
	hobby = req.body.hobby;
	console.log(name);
	console.log(password);
	console.log(req.files);
	if(name == "" || password == "" || repassword == "" || password != repassword || mailbox == "" || phone == "" || hobby == "" || req.files.length != 1) {
		console.log("the information is invalid");
		res.sendFile( htmld + "register.html" );
		session.close();
		driver.close();
		return;
	}
	/*
	response = {
		username: req.body.username,
		password: req.body.password,
		repassword: req.body.repassword,
		mailbox: req.body.mailbox,
		phone: req.body.phone
		};
	console.log(response);
	*/
	console.log("image file: " + req.files[0]);
	imageFile = imgd + req.files[0].originalname;
	console.log("image path: " + imageFile);
	
	session
		.run("MATCH (olduser:Person {name: {nameParam} }) RETURN olduser.password", {nameParam:name})
		.then(function(result){
			console.log("goto here");
			fail = 0;
			result.records.forEach(function(record) {
				console.log("record:" + record);
				if(record.get('olduser.password') != "") {
					console.log("the username alreday exists");
					fail = 1;
				}
			});	
//			console.log("the username already exists");
			if(fail == 1) {
				res.sendFile( htmld + "register.html" );
				session.close();
				driver.close();
			}
			else {
	//WARN:if need to use sync here?
	fs.readFile( req.files[0].path, function (err, data) {
        fs.writeFile(imageFile, data, function (err) {
         if( err ){
              console.log( err );
         }
		});
   });
			console.log(name);
			session
				.run("CREATE (newuser:Person {name:{nameParam}, password:{passwordParam}, mailbox:{mailboxParam}, phone:{phoneParam}, hobby:{hobbyParam}, image:{imageParam}})", {nameParam:name, passwordParam:password, mailboxParam:mailbox, phoneParam:phone, hobbyParam:hobby, imageParam:imageFile})
				.then(function(result) {
					result.records.forEach(function(record) {
					});
					console.log("the new user has been inserted into neo4j");
					res.sendFile( htmld + "login.html" );
					session.close();
					driver.close();
				})
				.catch(function(error) {
					console.log(error);
					console.log("the new user can not been inserted into neo4j");
					res.sendFile( htmld + "register.html" );
					session.close();
					driver.close();
				});
			}
			//console.log("session and driver closed");
			})
		.catch(function(error) {
			console.log(error);
			console.log(name);
	//WARN:if need to use sync here?
	fs.readFile( req.files[0].path, function (err, data) {
        fs.writeFile(imageFile, data, function (err) {
         if( err ){
              console.log( err );
         }
		});
   });
			session
				.run("CREATE (newuser:Person {name:{nameParam}, password:{passwordParam}, mailbox:{mailboxParam}, phone:{phoneParam}, hobby:{hobbyParam}, image:{imageParam}})", {nameParam:name, passwordParam:password, mailboxParam:mailbox, phoneParam:phone, hobbyParam:hobby, imageParam:imageFile})
				.then(function(result) {
					result.records.forEach(function(record) {
					});
					console.log("the new user has been inserted into neo4j");
					res.sendFile( htmld + "login.html" );
					session.close();
					driver.close();
				})
				.catch(function(error) {
					console.log(error);
					console.log("the new user can not been inserted into neo4j");
					res.sendFile( htmld + "register.html" );
					session.close();
					driver.close();
				});
		});
	//return JSON.stringify(response);
	}; 
}; 

module.exports = Register;


