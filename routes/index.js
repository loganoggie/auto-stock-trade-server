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

//Drop table
/*
client.query("DROP TABLE users;", (err,res) => {
  //console.log(res); //fix this shit front end
});

//Make table
client.query("CREATE TABLE users (fname varchar, lname varchar, email varchar, password varchar, AVkey varchar, PRIMARY KEY(email));", (err,res) => {
  //console.log(res); //fix this shit front end
});
*/
//Insert into users
client.query("INSERT INTO users (fname, lname, email, password, AVkey) VALUES ('Bob1','Bagsby1','bob1@gmail.com','apple123', 'PUTDEFAULTKEYHERE')", (err,res) => {
  //console.log(res); //fix this shit front end
});

//Print all rows in users
client.query("SELECT * FROM users", (err,res) => {
  console.log("Number of users: "+res.rowCount); //fix this shit front end
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('splash');
});

router.post('/login', function(req, res, next) {


  var username = (req['body']['username']);
  var password = (req['body']['password']);

  client.query("SELECT email,password FROM users WHERE email='"+username+"' AND password='"+password+"';", (err,res) => {
    if(err) throw err;

    if(res.rows.length>0)
    {
      console.log("Logged in"); //fix this shit front end
    }
    else
    {
      console.log("Wrong email/password"); //fix this shit front end
    }
  });

  res.render('login');
});

router.post('/register', function(req, res, next) {

  var fName = req['body']['first'];
  var lName = req['body']['last'];
  var email = req['body']['email'];
  var pass1 = req['body']['password'][0];
  var pass2 = req['body']['password'][1];

  if(pass1!=pass2)
  {
    console.log("Passwords don't match"); //fix this shit front end
  }
  else
  {
    client.query("INSERT INTO users (fname, lname, email, password) VALUES ('"+fName+"','"+lName+"','"+email+"','"+pass1+"');", (err,res) => {
    if(err)
    {
      throw err;
      console.log("in here");
    }
    else
    {
      console.log("Registered."); //fix this shit front end
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
