/*

NOTE -- This file is full of queries that are useful enough for frequent use/reuse
on the database. Feel free to add any queries that you use while developing.

*/

// Global Module Handling -----------------------------------------------
//-----------------------------------------------------------------------
// Local Module Handling ------------------------------------------------
var database = require('../bin/database.js');
var request = require('request');
var client = database.client;
var pool = database.pool;
var twilio = require('twilio')('AC31621b0d9e4714be87ce41aa88d2cbad','a3b8be0954cd4e84950c98dbdde099f8');

//-----------------------------------------------------------------------

/*------------------Useful queries------------------*/

//Drop table users
// client.query("DROP TABLE users;", (err,res) => {
//   console.log("users dropped.");
// });


//Drop table userstocks
//client.query("DROP TABLE userstocks;", (err,res) => {
//  console.log("userstocks dropped.");
//});


//Drop table usernotifications
//client.query("DROP TABLE usernotifications;", (err,res) => {
//  console.log("usernotifications dropped.");
//});


//Make table users
// client.query("CREATE TABLE users (id bigserial, fname varchar, lname varchar, email varchar UNIQUE, password varchar, AVkey varchar);", (err,res) => {
//   console.log("users created");
// });


//Make table usernotifications
//client.query("CREATE TABLE usernotifications (id bigserial, notification varchar UNIQUE, email varchar, date varchar, PRIMARY KEY(id), FOREIGN KEY(email) REFERENCES users(email));", (err,res) => {
//  console.log("usernotification created");
//});


//Make table userstocks
//client.query("CREATE TABLE userstocks (id bigserial, email varchar, stockticker varchar, numstocks int, algorithm varchar, params varchar, enabled bit DEFAULT '1', twiliobit bit DEFAULT '0', PRIMARY KEY(id), FOREIGN KEY(email) REFERENCES users(email));", (err,res) => {
//  console.log("userstocks created");
//});

//Make portfolioworth table;
// client.query("CREATE TABLE portfolioworth (id INT NOT NULL AUTO_INCREMENT, email VARCHAR, worth DOUBLE, date DATE, PRIMARY KEY(id), FOREIGN KEY(email) REFERENCES users(email));", (err, res) => {
//   console.log(err);
// });

//DROP
// client.query("DROP TABLE portfolioworth", (err, res) => {
//   console.log(err);
// });


//Insert into users
// client.query("INSERT INTO users (fname, lname, email, password, AVkey) VALUES ('Adam','Bagsby','bob@gmail.com','apple123', 'CJWPUA7R3VDJNLV0')", (err,res) => {
//   console.log("user added to database.");
// });


//Insert into userstocks
//client.query("INSERT INTO userstocks (email, stockticker, numstocks, algorithm, params, enabled, twiliobit) VALUES ('jwbhvb@mst.edu','BAC','100000','Moving Averages','19','1','1')", (err,res) => {
//  console.log("userstocks added to database.");
//});


//Insert into usernotifications
//client.query("INSERT INTO usernotifications (email, notification) VALUES ('jwbhvb@mst.edu','Blah blah blah')", (err,res) => {
//  console.log("notification added to database.");
//});

//Alter users table to have id column
//client.query("ALTER TABLE users DROP PRIMARY KEY", (err, res) => {
//  console.log("drop pk");
//});

//client.query("ALTER TABLE users ADD id bigserial", (err, res) => {
//  console.log("added id");
//});

//client.query("ALTER TABLE users ADD PRIMARY KEY(id, email)", (err, res) => {
//  console.log("added pk");
//});

client.query("UPDATE users SET phonenumber='6362841357' WHERE email='tanner0397x@gmail.com'", (err,res) => {
  console.log("UPDATING users.");
  console.log(res.rows);
});

//client.query("UPDATE userstocks SET twiliobit='1' WHERE email='tanner0397x@gmail.com' AND id='2'", (err,res) => {
//  console.log("UPDATING users.");
//  console.log(res.rows);
//});

//Print # of users and all rows in users
client.query("SELECT * FROM users", (err,res) => {
  console.log("Number of users: "+res.rowCount);
  console.log(res.rows);
});

//Print # of userstocks and all rows in userstocks
//client.query("SELECT * FROM userstocks", (err,res) => {
//  console.log("Number of userstocks: "+res.rowCount);
//  console.log(res.rows);
//});

//Print # of usernotifications and all rows in usernotifications
//client.query("SELECT * FROM usernotifications", (err,res) => {
//  console.log("Number of usernotifications: "+res.rowCount);
//  console.log(res.rows);
//});


/*------------------End of queries------------------*/

async function getCurrentUserInfo(id, email, callback)
{
  var userInfo = await client.query("SELECT * FROM users WHERE id = $1 and email = $2", [id, email]);
  callback(userInfo);
}

async function getCurrentStockInfo(email, callback)
{
  var stockInfo = await client.query("SELECT * FROM userstocks WHERE email = $1", [email]);
  callback(stockInfo);
}

async function getAllInvestments(algorithm, callback)
{
  var stockInfo2 = await client.query("SELECT * FROM userstocks WHERE enabled='1' AND algorithm = $1",[algorithm]);
  callback(stockInfo2);
}

async function getNotifications(email, callback)
{
  var notifications = await client.query("SELECT * FROM usernotifications WHERE email=$1",[email]);
  callback(notifications);
}

async function addNotification(phonenumber, email, notification, callback)
{
  var notifications2 = await client.query("INSERT INTO usernotifications (email, notification) VALUES ($1,$2)",[email, notification]);
  twilio.messages.create({
    body: notification,
    to: '+1'+phonenumber,
    from: '+13146674809'
  });
  callback(notifications2);
}


async function getPhoneNumber(email, callback)
{
  var phonenumber = await client.query("SELECT phonenumber FROM users WHERE email=$1",[email]);
  callback(phonenumber);
}

async function getAllUsers(callback)
{
  var allUsers = await client.query("SELECT * FROM users");
  callback(allUsers);
}

async function addWorth(email, worth, day, callback)
{
  var add = await client.query("INSERT INTO portfolioworth (email, worth, date) VALUES ($1,$2,$3)",[email, worth, day]);
  callback(add);
}

async function getWorth(email, callback) {
  var worth = await client.query("SELECT * FROM portfolioworth WHERE email=$1",[email]);
  callback(worth);
}

module.exports.getCurrentStockInfo = getCurrentStockInfo;
module.exports.getCurrentUserInfo = getCurrentUserInfo;
module.exports.getAllInvestments = getAllInvestments;
module.exports.getNotifications = getNotifications;
module.exports.addNotification = addNotification;
module.exports.getPhoneNumber = getPhoneNumber;
module.exports.getAllUsers = getAllUsers;
module.exports.addWorth = addWorth;
module.exports.getWorth = getWorth;