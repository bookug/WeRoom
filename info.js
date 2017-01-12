var neo4j = require("neo4j-driver").v1;
var fs = require("fs");
var ejs = require("ejs");

var htmld = __dirname + "/public/html/";

function Info() {  
	this.addFriendByName = function(req, res) { 
		cookie = req.cookies;
		console.log(cookie);
		name = cookie.name;
		name2 = req.name;
		if(name == "") {
			console.log("the user cookie is invalid");
			res.sendFile( htmld + "login.html" );
			return;
		}
		else {
			
		}
		
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		session
			.run("MATCH (user1:Person {name:{nameParam}})-[:FRIEND]->(user2:Person) RETURN user2.name", {nameParam:name})
			.then(function(result) {
				result.records.forEach(function(record) {
					console.log("record: " + record);
					friends.push(record.get("user2.name"));
				});
				console.log("frineds: " + friends.toString());
				options = {name:name, password:password, image:image, email:email, mobile:mobile, hobby:hobby, friends:friends};
				res.render("info.ejs", options);
				session.close();
				driver.close();
			})
			.catch(function(error) {
				friends = [];
				console.log(error);
				//TODO:reload info
				session.close();
				driver.close();
			});
		//res.sendFile( htmld + "index.html");
		//session.close();
		//driver.close();
	}; 
	
	this.addFriendByEmail = function(req, res) {
		//TODO
	}
	
	this.addFriendByPhone = function(req, res) {
		//TODO
	}
	
	this.addFriendByHobby = function(req, res) {
		//TODO
	}
	
	this.addFriendByHobby2 = function(req, res) {
		//TODO
	}
	
	this.subFriendByName = function(req, res) {
		//TODO
	}
}; 

module.exports = Info;
