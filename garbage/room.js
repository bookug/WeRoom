var neo4j = require("neo4j-driver").v1;
var fs = require("fs");
var ejs = require("ejs");

var htmld = __dirname + "/public/html/";
var room = new Room();

function Room() {  
	this.display(res, name) {
		
	}

	this.show = function(req, res, name) {
		users = [name];
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		//DEBUG:if loop unrolled, maybe error!
		session
		.run("MATCH (user1:Person {name:{arg1}})-[:FRIEND]->(user2:Person) WHERE user1.name <> user2.name RETURN DISTINCT user2.name", {arg1:name})
		.then(function(result) {
			result.records.forEach(function(record) {
				//console.log("record: " + record);
				users.push(record.get("user2.name"));
			});
			console.log("users: " + users.toString());
			//not use loop due to async/functional features, use foreach/recursive instead, learn the thinking of FP
			msgs = [];
			users.forEach(function(usr) {
				var driver2 = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
				var session2 = driver.session();
				console.log("current user: " + usr);
				session2
				.run("MATCH (talker:Person)-[:SEND]->(m:Message) WHERE talker.name={arg} RETURN DISTINCT talker.name, m.time, m.text, m.image", {arg:usr})
				.then(function(result) {
					result.records.forEach(function(record) {
						dict['person'] = record.get("talker.name");
						time = record.get("m.time");
						tmsg['time'] = record.get("m.time");
						tmsg['text'] = record.get("m.text");
						tmsg['image'] = record.get("m.image");
						dict['message'] = tmsg;
						dict['reply'] = [];
						var driver3 = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
						var session3 = driver.session();
						//NOTICE:a reply can only belong to one person
						session3
						.run("MATCH (m:Message)-[:HAVE]->(r:Reply)-[:FROM]->(p:Person) WHERE m.time={arg} RETURN r.time, r.text, p.name", {arg:time})
						.then(function(result) {
							result.records.forEach(function(record) {
								reply['time'] = record.get("r.time");
								reply['text'] = record.get("r.text");
								reply['person'] = record.get("p.name");
								console.log("current reply: " + reply);
								dict['reply'].push(reply);
							});
							session3.close();
							driver3.close();
						})
						.catch(function(error) {
							console.log(error);
							session3.close();
							driver3.close();
						});
						session3.close();
						driver3.close();
						console.log("current message: " + dict);
						msgs.push(dict);
					});
					session2.close();
					driver2.close();
				})
				.catch(function(error) {
					console.log(error);
					session2.close();
					driver2.close();
				});
			});
			console.log("all related messages" + msgs);
			res.send(msgs);
			session.close();
			driver.close();
		})
		.catch(function(error) {
			console.log(error);
			console.log("error when trying to get all users: " + name);
			res.sendFile(htmld + "login.html");
			session.close();
			driver.close();
		});			
	}
	
	this.reply = function(req, res, name) { 

	}; 
	this.praise = function(req, res, name) {
		//TODO
	}
	
	this.message = function(req, res, name) {
		
	}
}; 

module.exports = Room;
