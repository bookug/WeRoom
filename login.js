var neo4j = require("neo4j-driver").v1;
//var Chat = require("chat");
//chat = new Chat();
var fs = require("fs");
var ejs = require("ejs");

var htmld = __dirname + "/public/html/";

function Login() {  
	this.userLogin = function(req, res) { 
		name = req.body.username;
		password = req.body.password;
		console.log(name);
		console.log(password);
		if(name == "" || password == "") {
			console.log("the information is invalid");
			res.sendFile( htmld + "login.html" );
		return;
		}
		/*
		response = {
		username:req.body.username,
		password:req.body.password
		};
		console.log(response);
		*/
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		success = 0; email = ""; mobile = ""; hobby = ""; image = "";
		session
			.run("MATCH (olduser:Person {name: {nameParam} }) RETURN olduser.password, olduser.mailbox, olduser.phone, olduser.hobby, olduser.image", {nameParam:name})
			.then(function(result){
				result.records.forEach(function(record) {
					console.log("to check");
					check = record.get('olduser.password');
					console.log(check);
					if(check == password) {
						success = 1;
						email = record.get("olduser.mailbox");
						mobile = record.get("olduser.phone");
						hobby = record.get("olduser.hobby");
						image = record.get("olduser.image");
					}
					console.log(record);
				});
				
				if(success == 1) {
					console.log("login successfully");
					//res.sendFile(htmld + "index.html");
					//res.sendFile( htmld + "info.html" );
					// 设置响应头部信息及编码
					//res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
					friends = []
					console.log("to query: "+name);
					session
						.run("MATCH (user1:Person {name:{nameParam}})-[:FRIEND]->(user2:Person) RETURN user2.name", {nameParam:name})
						.then(function(result) {
							console.log("to get frineds");
							result.records.forEach(function(record) {
								console.log("record: " + record);
								friends.push(record.get("user2.name"));
							});
						console.log("frineds: " + friends.toString());
						res.cookie("name", name)  //{maxAge:1000, httpOnly:true} signed:true
						options = {name:name, password:password, image:image, email:email, mobile:mobile, hobby:hobby, friends:friends};
						res.render("info.ejs", options);
						//res.write(infoHTML);
						session.close();
						driver.close();
						//console.log("session and driver closed");
						})
						.catch(function(error) {
							console.log(error);
							console.log("error when trying to get friends: " + name);
							session.close();
							driver.close();
						});
				}
				else {
					console.log("login failed");
					res.sendFile( htmld + "login.html" );
				}
			})
			.catch(function(error) {
				console.log(error);
				console.log("login failed");
				res.sendFile( htmld + "login.html" );
				session.close();
				driver.close();
			});
		//return JSON.stringify("no response now");
	}; 
}; 

module.exports = Login;
