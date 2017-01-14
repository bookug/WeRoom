var neo4j = require("neo4j-driver").v1;
var fs = require("fs");
var ejs = require("ejs");
var querystring = require('querystring');

//REFERENCE:
//http://www.jb51.net/article/55598.htm
//http://cnodejs.org/topic/54acfbb5ce87bace2444cbfb
//http://cnodejs.org/topic/5425fb61326dfbe724dbd64e

var htmld = __dirname + "/public/html/";
var room = new Room();
var store = __dirname + "/public/images/";

function Room() {  
	this.showMessage = function(req, res) {
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		name = req.body.name;
		msgs = [];
		session
		.run("MATCH (user1:Person {name:{arg1}})-[:SEND]->(m1:Message) RETURN m1.name AS mname, m1.text AS mtext, m1.image AS mimage  UNION  MATCH (user1:Person {name:{arg1}})-[:FRIEND]->(user2:Person)-[:SEND]->(m2:Message) RETURN m2.name AS mname, m2.text AS mtext, m2.image AS mimage", {arg1:name})
		.then(function(result) {
			result.records.forEach(function(record) {
				//console.log("record: " + record);
				mname = record.get("mname"); mtext = record.get("mtext"); mimage = record.get("mimage");
				/*
				pname = record.get("pname"); rname = record.get("rname"); rtext = record.get("rtext");
				if(msgs.mname == undefined) {
					msgs.mname = {'text':mtext, 'image':mimage, 'prasise':[], 'reply':[]};
				}*/
				dict = {'name':mname, 'text':mtext, 'image':mimage};
				msgs.push(dict);
			});
			console.log("all related messages: " + msgs);
			succ = {'success':'yes'};
			res.write(JSON.stringify(succ)); res.write(JSON.stringify(msgs)); res.end();
			session.close();
			driver.close();
		})
		.catch(function(error) {
			console.log(error);
			console.log("error when trying to get all msgs: " + name);
			fail = {'success':'no'};
			res.write(JSON.stringify(fail)); res.end();
			session.close();
			driver.close();
		});			
	}
	
	this.showPraise = function(req, res) {
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		name = req.body.message_name;
		//praises = [];
		session
		.run("MATCH (m:Message {name:{arg1}})-[:HAVE]->(p:Praise) RETURN COUNT(*) AS num", {arg1:name})
		.then(function(result) {
			result.records.forEach(function(record) {
				//console.log("record: " + record);
				/*
				pname = record.get("pname");
				dict = {'name':pname};
				praises.push(dict);
				*/
				num = record.get("num");
			});
			console.log("all related praises: " + praises);
			//res.send(praises);
			succ = {'success':'yes'}; ret = {'praise_num':num};
			res.write(JSON.stringify(succ)); res.write(JSON.stringify(ret)); res.end();
			session.close();
			driver.close();
		})
		.catch(function(error) {
			console.log(error);
			console.log("error when trying to get praises: " + name);
			fail = {'success':'no'};
			res.write(JSON.stringify(fail)); res.end();
			session.close();
			driver.close();
		});			
	}
	
	this.showReply = function(req, res) {
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		name = req.body.message_name;
		replies = [];
		session
		.run("MATCH (m:Message {name:{arg1}})-[:HAVE]->(r:Reply) RETURN r.name AS rname, r.text AS rtext", {arg1:name})
		.then(function(result) {
			result.records.forEach(function(record) {
				//console.log("record: " + record);
				rname = record.get("rname"); rtext = record.get("rtext");
				dict = {'name':rname, 'text':rtext};
				replies.push(dict);
			});
			console.log("all related replies: " + replies);
			succ = {'success':'yes'};
			res.write(JSON.stringify(succ)); res.write(JSON.stringify(replies)); res.end();
			session.close();
			driver.close();
		})
		.catch(function(error) {
			console.log(error);
			console.log("error when trying to get replies: " + name);
			fail = {'success':'no'};
			res.write(JSON.stringify(fail)); res.end();
			session.close();
			driver.close();
		});			
	}
	
	this.addReply = function(req, res) { 
		//the unique name of the original message  bookug;001
		name2 = req.body.message_name;
		name = req.body.name;
		time = req.body.time;
		text = req.body.text;
		if(name == undefined || name2 == undefined || time == undefined || text == undefined)
		{
			fail = {'success':'no'};
			res.write(JSON.stringify(fail)); res.end();
			return;
		}
		id = name + ";" + time;
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		session
		.run("MATCH (m:Message) WHERE m.name={arg1} CREATE (r:Reply {name:{arg2}, text:{arg3}}), (m)-[:HAVE]->(r)", {arg1:name2, arg2:id, arg3:text})
		.then(function(result) {
			result.records.forEach(function(record) {
				//console.log("record: " + record);
			});
			succ = {'success':'yes'};
			res.write(JSON.stringify(succ)); res.end();
			session.close();
			driver.close();
		})
		.catch(function(error) {
			console.log(error);
			fail = {'success':'no'};
			res.write(JSON.stringify(fail)); res.end();
			session.close();
			driver.close();
		});		
	}
	
	this.addPraise = function(req, res) {
		//the unique name of the original message  bookug;001
		name = req.body.name;
		time = req.body.time;
		name2 = req.body.message_name;
		if(name == undefined || name2 == undefined || time == undefined)
		{
			fail = {'success':'no'};
			res.write(JSON.stringify(fail)); res.end();
			return;
		}
		id = name + ";" + time;
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		session
		.run("MATCH (m:Message) WHERE m.name={arg1} CREATE (p:Praise {name:{arg2}}), (m)-[:HAVE]->(p)", {arg1:name2, arg2:id})
		.then(function(result) {
			result.records.forEach(function(record) {
				//console.log("record: " + record);
			});
			succ = {'success':'yes'};
			res.write(JSON.stringify(succ)); res.end();
			session.close();
			driver.close();
		})
		.catch(function(error) {
			console.log(error);
			//res.send();
			session.close();
			driver.close();
		});	
	}
	
	this.addMessage = function(req, res) {
		/*
		var contentType = req.headers["content-type"];
		var fullBody = '';
		if(contentType){
			if(contentType.indexOf("application/x-www-form-urlencode") > -1){
				req.on('data',function(chunk){
					fullBody += chunk.toString();
				});
				req.on('end',function(){
					var dBody = querystring.parse(fullBody);
					//console.log(dBody);
					time = dBody["time"];
					text = dBody["text"];
					imageData = dBody["image"];
				});
			}
		}*/
		name = req.body.name;
		time = req.body.time;
		text = req.body.text;
		imageData="not found";
		file_name = ".";
		/*
		imageData = req.body.image;
		//console.log(time+" "+text);
		type = imageData.split(";")[0].split(":")[1].substr(6);
		console.log("type:"+type);
		file_name0 = "message" + time + "." + type; file_name = file_name0.replace(/:/, "-");
		storeFile = store + file_name;
        fs.writeFileSync(storeFile, imageData);
		*/
		image = "../images/" + file_name;
		console.log(time+"   "+text + "   "+image);
		if(name == undefined || time == undefined || text == undefined || image == undefined)
		{
			fail = {'success':'no'};
			res.write(JSON.stringify(fail)); res.end();
			console.log("invalid args");
			return;
		}
		id = name + ";" + time;
		var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));
		var session = driver.session();
		session
		.run("MATCH (n:Person {name:{arg1}}) CREATE (m:Message {name:{arg2}, text:{arg3}, image:{arg4}}), (n)-[:SEND]->(m)", {arg1:name, arg2:id, arg3:text, arg4:image})
		.then(function(result) {
			result.records.forEach(function(record) {
				//console.log("record: " + record);
			});
			succ = {'success':'yes'};
			res.write(JSON.stringify(succ)); res.end();
			session.close();
			driver.close();
		})
		.catch(function(error) {
			console.log(error);
			fail = {'success':'no'};
			res.write(JSON.stringify(fail)); res.end();
			session.close();
			driver.close();
		});	
	}
}; 

module.exports = Room;
