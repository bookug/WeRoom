var neo4j = require("neo4j-driver").v1;
var fs = require("fs");
var ejs = require("ejs");

var htmld = __dirname + "/public/html/";

function Room() {  
	this.addFriendByName = function(req, res) { 
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		//TODO
		cookie = req.cookies;
		session.close();
		driver.close();
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

module.exports = Room;
