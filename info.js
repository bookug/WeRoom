var neo4j = require("neo4j-driver").v1;
var fs = require("fs");
var ejs = require("ejs");

var htmld = __dirname + "/public/html/";
info = new Info();

function Info() {  
//TODO: set the image size to xx px not xx% to fix the space
	this.show = function(req, res, name) {
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		friends = []; password=""; image="";email="";mobile=""; hobby="";
		console.log("to query: "+name);
		session
		.run("MATCH (user:Person {name:{nameParam}}) RETURN user.password, user.image, user.mailbox, user.phone, user.hobby", {nameParam:name})
		.then(function(result) {
			console.log("to get informations: " + name);
			result.records.forEach(function(record) {
				password = record.get("user.password");
				image = record.get("user.image");
				email = record.get("user.mailbox");
				mobile = record.get("user.phone");
				hobby = record.get("user.hobby");
			});
			session
			.run("MATCH (user1:Person {name:{nameParam}})-[:FRIEND]->(user2:Person) RETURN DISTINCT user2.name", {nameParam:name})
			.then(function(result) {
				console.log("to get friends");
				result.records.forEach(function(record) {
					//console.log("record: " + record);
					friends.push(record.get("user2.name"));
				});
				console.log("friends: " + friends.toString());
				options = {name:name, password:password, image:image, email:email, mobile:mobile, hobby:hobby, friends:friends};
				console.log(options);
				res.render("info.ejs", options);
				//res.write(infoHTML);
				session.close();
				driver.close();
				//console.log("session and driver closed");
			})
			.catch(function(error) {
				console.log(error);
				console.log("error when trying to get friends: " + name);
				//NOTICE:this session is different from the caller's
				res.sendFile(htmld + "login.html");
				session.close();
				driver.close();
			});	
		})
		.catch(function(error) {
			console.log(error);
			res.sendFile(htmld + "login.html");
			session.close();
			driver.close();
		});	
	}
//TODO: if you want to add a friend, then he can not be your friend originally, because neo4j allows parallel edges!

	this.addFriendByName = function(req, res) { 
		cookie = req.cookies;
		console.log(cookie);
		name = cookie.name;
		//console.log("request: "+req);
		name2 = req.body.name;
		if(name == "") {
			console.log("the user cookie is invalid");
			res.sendFile( htmld + "login.html" );
			return;
		}
		else if(name2 == "" || name2 == name) {
			console.log("the friend's name is invalid");
			this.show(req, res, name);
			return;
		}
		
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		console.log("friend name: "+name2);
		session
			//.run("MATCH (user1:Person {name:{nameParam1}}),(user2:Person {name:{nameParam2}}) CREATE user1-[:FRIEND]->user2", {nameParam1:name, nameParam2:name2})
			.run("MATCH (user1:Person),(user2:Person) WHERE user1.name = {arg1} AND user2.name = {arg2} CREATE (user1)-[:FRIEND]->(user2)", {arg1:name, arg2:name2})
			.then(function(result) {
				result.records.forEach(function(record) {
					//console.log("record: " + record);
				});
				info.show(req, res, name);
				session.close();
				driver.close();
			})
			.catch(function(error) {
				console.log(error);
				this.show(req, res, name);
				session.close();
				driver.close();
			});
	}
	
	this.addFriendByEmail = function(req, res) {
		cookie = req.cookies;
		console.log(cookie);
		name = cookie.name;
		email = req.body.email;
		if(name == "") {
			console.log("the user cookie is invalid");
			res.sendFile( htmld + "login.html" );
			return;
		}
		else if(email == "") {
			console.log("the friend's email can not be empty");
			info.show(req, res, name);
			return;
		}
		
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		session
			.run("MATCH (user1:Person {name:{nameParam1}}),(user2:Person {mailbox:{emailParam2}}) WHERE user1.name <> user2.name CREATE (user1)-[:FRIEND]->(user2)", {nameParam1:name, emailParam2:email})
			.then(function(result) {
				result.records.forEach(function(record) {
					//console.log("record: " + record);
				});
				info.show(req, res, name);
				session.close();
				driver.close();
			})
			.catch(function(error) {
				console.log(error);
				info.show(req, res, name);
				session.close();
				driver.close();
			});
	}
	
	this.addFriendByPhone = function(req, res) {
		cookie = req.cookies;
		console.log(cookie);
		name = cookie.name;
		phone = req.body.mobile;
		if(name == "") {
			console.log("the user cookie is invalid");
			res.sendFile( htmld + "login.html" );
			return;
		}
		else if(phone == "") {
			console.log("the friend's phone can not be empty");
			info.show(req, res, name);
			return;
		}
		
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		session
			.run("MATCH (user1:Person {name:{nameParam1}}),(user2:Person {phone:{phoneParam2}}) WHERE user1.name <> user2.name CREATE (user1)-[:FRIEND]->(user2)", {nameParam1:name, phoneParam2:phone})
			.then(function(result) {
				result.records.forEach(function(record) {
					//console.log("record: " + record);
				});
				info.show(req, res, name);
				session.close();
				driver.close();
			})
			.catch(function(error) {
				console.log(error);
				info.show(req, res, name);
				session.close();
				driver.close();
			});
	}
	
	this.addFriendByHobby = function(req, res) {
		cookie = req.cookies;
		console.log(cookie);
		name = cookie.name;
		hobby = req.body.hobby;
		if(name == "") {
			console.log("the user cookie is invalid");
			res.sendFile( htmld + "login.html" );
			return;
		}
		else if(hobby == "") {
			console.log("the friend's hobby can not be empty");
			info.show(req, res, name);
			return;
		}
		
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		session
			.run("MATCH (user1:Person {name:{nameParam1}}),(user2:Person {hobby:{hobbyParam2}}) WHERE user1.name <> user2.name CREATE (user1)-[:FRIEND]->(user2)", {nameParam1:name, hobbyParam2:hobby})
			.then(function(result) {
				result.records.forEach(function(record) {
					//console.log("record: " + record);
				});
				info.show(req, res, name);
				session.close();
				driver.close();
			})
			.catch(function(error) {
				console.log(error);
				info.show(req, res, name);
				session.close();
				driver.close();
			});
	}
	
	this.addFriendByHobby2 = function(req, res) {
		cookie = req.cookies;
		console.log(cookie);
		name = cookie.name;
		hobby = req.body.hobby;
		if(name == "") {
			console.log("the user cookie is invalid");
			res.sendFile( htmld + "login.html" );
			return;
		}
		else if(hobby == "") {
			console.log("the friend's friend's hobby can not be empty");
			info.show(req, res, name);
			return;
		}
		
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		//friend edge is with directions, add friend only single-direction, no need to check
		//NOTICE:maybe user3 is already user1's friend, but that is also ok to insert again
		session
			.run("MATCH (user1:Person)-[:FRIEND]->()-[:FRIEND]->(user2:Person) WHERE user1.name={arg1} AND user2.hobby={arg2} AND user2.name <> user1.name CREATE (user1)-[:FRIEND]->(user2)", {arg1:name, arg2:hobby})
			.then(function(result) {
				result.records.forEach(function(record) {
					//console.log("record: " + record);
				});
				info.show(req, res, name);
				session.close();
				driver.close();
			})
			.catch(function(error) {
				console.log(error);
				info.show(req, res, name);
				session.close();
				driver.close();
			});
	}
	
	this.subFriendByName = function(req, res) {
		cookie = req.cookies;
		console.log(cookie);
		name = cookie.name;
		name2 = req.body.name;
		if(name == "") {
			console.log("the user cookie is invalid");
			res.sendFile( htmld + "login.html" );
			return;
		}
		else if(name2 == "" || name2 == name) {
			console.log("the friend's name is invalid");
			info.show(req, res, name);
			return;
		}
		
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		console.log("now to remove this edge: "+name+" "+name2);
		session
			.run("MATCH (user1:Person)-[r]->(user2:Person) WHERE user1.name={arg1} AND user2.name={arg2} DELETE r", {arg1:name, arg2:name2})
			.then(function(result) {
				result.records.forEach(function(record) {
					//console.log("record: " + record);
				});
				console.log("all parallel edges removed");
				info.show(req, res, name);
				session.close();
				driver.close();
			})
			.catch(function(error) {
				console.log(error);
				info.show(req, res, name);
				session.close();
				driver.close();
			});
	}
}; 

module.exports = Info;
