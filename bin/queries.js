/*

NOTE -- This file is full of queries that are useful enough for frequent use/reuse
on the database. Feel free to add any queries that you use while developing.

*/

// Global Module Handling -----------------------------------------------
//-----------------------------------------------------------------------
// Local Module Handling ------------------------------------------------
var database = require('../bin/database.js');
var client = database.client;
var pool = database.pool;
//-----------------------------------------------------------------------

/*------------------Useful queries------------------*/

//Drop data from users and userstocks

//Drop table users
// client.query("DROP TABLE users;", (err,res) => {
//   console.log("users dropped.");
// });


//Drop table userstocks

// client.query("DROP TABLE userstocks;", (err,res) => {
//   console.log("userstocks dropped.");
// });


//Make table users
// client.query("CREATE TABLE users (id bigserial, fname varchar, lname varchar, email varchar UNIQUE, password varchar, AVkey varchar);", (err,res) => {
//   console.log("users created");
// });



//Make table userstocks
// client.query("CREATE TABLE userstocks (id int, email varchar, stockticker varchar, numstocks int, algorithm varchar, params varchar, enabled bit, PRIMARY KEY(id), FOREIGN KEY(email) REFERENCES users(email));", (err,res) => {
//   console.log("userstocks created");
// });


//Insert into users
// client.query("INSERT INTO users (fname, lname, email, password, AVkey) VALUES ('Adam','Bagsby','bob@gmail.com','apple123', 'CJWPUA7R3VDJNLV0')", (err,res) => {
//   console.log("user added to database.");
// });



//Insert into userstocks
// client.query("INSERT INTO userstocks (id, email, stockticker, numstocks, algorithm, params, enabled) VALUES ('2','jwbhvb@mst.edu','AMD','40','Beta','highrisk','1')", (err,res) => {
//   console.log("userstocks added to database.");
// });

// Alter users table to have id column
// client.query("ALTER TABLE users DROP PRIMARY KEY", (err, res) => {
//   console.log("drop pk");
// });
//
// client.query("ALTER TABLE users ADD id bigserial", (err, res) => {
//   console.log("added id");
// });
//
// client.query("ALTER TABLE users ADD PRIMARY KEY(id, email)", (err, res) => {
//   console.log("added pk");
// });

// Print # of users and all rows in users
// client.query("SELECT * FROM users", (err,res) => {
//   console.log("Number of users: "+res.rowCount);
//   console.log(res.rows);
// });

//Print # of userstocks and all rows in userstocks
/*
client.query("SELECT * FROM userstocks", (err,res) => {
  console.log("Number of userstocks: "+res.rowCount);
  console.log(res.rows);
});
*/

/*------------------End of queries------------------*/

async function getCurrentUserInfo(id, email, callback) {

  var userInfo = await client.query("SELECT * FROM users WHERE id = $1 and email = $2", [id, email])

  callback(userInfo);
}

async function getCurrentStockInfo(email, callback)
{
  var stockInfo = await client.query("SELECT * FROM userstocks WHERE email = $1", [email])

  callback(stockInfo);
}

// function getCurrentUserInfo(id, email) {

//   var userInfo = client.query("SELECT * FROM users WHERE id = $1 and email = $2", [id, email], (err,res) => {
//     if (err) {
//       console.log("Error running query 'getCurrentUserInfo'.");
//     } else {
//       console.log(res.rows[0]);
//     }
//   });

//   return userInfo;
// }

module.exports.getCurrentStockInfo = getCurrentStockInfo;
module.exports.getCurrentUserInfo = getCurrentUserInfo;
