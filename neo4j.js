//NODEJS是异步的，异常处理可能非常麻烦
//neo4j的js driver可能也是异步的，必要时需要通过事务保证一致性

var neo4j = require("neo4j-driver").v1;

// Create a driver instance, for the user neo4j with password neo4j.
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "8438153naruto"));

// Create a session to run Cypher statements in.
// Note: Always make sure to close sessions when you are done using them!
var session = driver.session();

/*
session.run("CREATE (n {age: {myIntParam}})", {myIntParam: neo4j.int(22)});
session.run("CREATE (n {age: {myIntParam}})", {myIntParam: neo4j.int("9223372036854775807")});
var aSmallInteger = neo4j.int(123);
var aNumber = aSmallInteger.toNumber();
var aLargerInteger = neo4j.int("9223372036854775807");
var integerAsString = aLargerInteger.toString();
*/

session.run("MATCH (alice {name: {nameParam} }) DELETE alice", {nameParam:'Alice'});
console.log("delete alice");
session.run("CREATE (alice:Person {name:{nameParam}, age:{ageParam}})", {nameParam:'Alice', ageParam:'20'});
console.log('insert Alice');

/*
// Run a Cypher statement, reading the result in a streaming manner as records arrive:
session
  .run("MATCH (alice {name : {nameParam} }) RETURN alice.age", { nameParam:'Alice' })
  .subscribe({
    onNext: function(record) {
	console.log("the record is catched");
	console.log(record.get('alice.age'));
	},
    onCompleted: function() {
      // Completed!
      session.close();
    },
    onError: function(error) {
      console.log(error);
    }
  });
*/ 

// or the Promise way, where the complete result is collected before we act on it:
session
  .run("MATCH (alice {name : {nameParam} }) RETURN alice.age", { nameParam:'Alice' })
  .then(function(result){
    result.records.forEach(function(record) {
	console.log("the record is catched");
	console.log(record.get('alice.age'));
    console.log(record);
	});

    // Completed!
	session.close();
	driver.close();
  })
  .catch(function(error) {
    console.log(error);
  });
 console.log("to close the session");
//TODO:timeout or block
//session.close();

  /*
  //run statement in a transaction
  var tx = session.beginTransaction();
  tx.run("CREATE (alice:Person {name : {nameParam} })", { nameParam:'Alice' });
  console.log("run one job")
  var success = tx.run("MATCH (alice {name : {nameParam} }) RETURN alice.age", { nameParam:'Alice' });
  console.log("run another job");
  //decide if the transaction should be committed or rolled back
  if (success) {
    tx.commit()
      .subscribe({
        onCompleted: function() {
          // Completed!
          session.close();
         },
         onError: function(error) {
           console.log(error);
          }
        });
   } else {
     //transaction is rolled black nothing is created in the database
     tx.rollback();
   }
   */
   
   
   