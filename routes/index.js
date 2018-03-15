var express = require('express');
var router = express.Router();
const {Client} = require('pg');

//db connection string
var dbString = 'postgres://whiidzewjaaqzm:0001b1a8a6fa014941cfa07feb3bb8f8049f2210a11f1d5f14895ea6fac6f955@ec2-184-73-196-65.compute-1.amazonaws.com:5432/deacrvvlj7rj32';

const client = new Client({
  connectionString: dbString,
  ssl: true,
});
client.connect();

/*------------------Useful queries------------------*/

//Drop table users
/*
client.query("DROP TABLE users;", (err,res) => {
  console.log("users dropped.");
});
*/

//Drop table userstocks
/*
client.query("DROP TABLE userstocks;", (err,res) => {
  console.log("userstocks dropped.");
});
*/

//Make table users
/*
client.query("CREATE TABLE users (fname varchar, lname varchar, email varchar, password varchar, AVkey varchar, PRIMARY KEY(email));", (err,res) => {
  console.log("users created");
});
*/

//Make table userstocks
/*
client.query("CREATE TABLE userstocks (id int, email varchar, stockticker varchar, numstocks int, algorithm varchar, params varchar, enabled bit, PRIMARY KEY(id), FOREIGN KEY(email) REFERENCES users(email));", (err,res) => {
  console.log("userstocks created");
});
*/


//Insert into users
/*
client.query("INSERT INTO users (fname, lname, email, password, AVkey) VALUES ('Adam','Bagsby','adam@gmail.com','apple123', 'CJWPUA7R3VDJNLV0')", (err,res) => {
  console.log("user added to database.");
});
*/

//Insert into userstocks
/*
client.query("INSERT INTO userstocks (id, email, stockticker, numstocks, algorithm, params, enabled) VALUES ('2','jwbhvb@mst.edu','AMD','40','Beta','highrisk','1')", (err,res) => {
  console.log("userstocks added to database.");
});
*/

//Print #of users and all rows in users
/*
client.query("SELECT * FROM users", (err,res) => {
  console.log("Number of users: "+res.rowCount);
  console.log(res.rows);
});
*/

//Print #of userstocks and all rows in userstocks
/*
client.query("SELECT * FROM userstocks", (err,res) => {
  console.log("Number of userstocks: "+res.rowCount);
  console.log(res.rows);
});
*/

/*------------------End of queries------------------*/

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('splash');
});

router.post('/login', function(req, res, next) {


  var username = (req['body']['username']);
  var password = (req['body']['password']);

  client.query("SELECT email,password FROM users WHERE email='"+username+"' AND password='"+password+"';", (err,res2) => {
    if(err) throw err;

    if(res2.rows.length>0)
    {
      console.log("Logged in");
      res.render('dashboard'); //pass the user in optional parameters
    }
    else
    {
      console.log("Wrong email/password");
      res.render('splash'); //redirect back to splash
    }
  });
});

router.post('/register', function(req, res, next) {

  var fName = req['body']['first'];
  var lName = req['body']['last'];
  var email = req['body']['email'];
  var pass1 = req['body']['password'][0];
  var pass2 = req['body']['password'][1];

  if(pass1!=pass2)
  {
    console.log("Passwords don't match");
  }
  else
  {
    client.query("INSERT INTO users (fname, lname, email, password, AVkey) VALUES ('"+fName+"','"+lName+"','"+email+"','"+pass1+"','CJWPUA7R3VDJNLV0');", (err,res2) => {
    if(err)
    {
      throw err;
      console.log("in here");
    }
    else
    {
      console.log('dashboard'); //pass the user in optional parameters
    }
    client.end();
    });
  }
  res.render('register');
});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard');
});

router.get('/investments', function(req, res, next) {
  res.render('investments');
});

router.get('/aboutalgorithms', function(req, res, next) {
  res.render('aboutalgorithms');
});

router.get('/accountsettings', function(req, res, next) {
  res.render('accountsettings');
});

module.exports = router;
