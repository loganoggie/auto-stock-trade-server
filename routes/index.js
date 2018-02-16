var express = require('express');

// ------- mySQL db connection info -------
// Change for your personal machine
var mysql = require('mysql');
var connection = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'hamandcheese',
  database: 'autostockdb'
});

connection.getConnection(function(err, connection) {
  if(err) {
    console.log("Error connecting.");
  } else {
    console.log("Success.");
  }
});

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('splash');
});

router.post('/login', function(req, res, next) {

  // Check user credentials against stored information

  // Redirect to account page if successful

  // This wont actually need to render anything in the future
  // This is really just to make sure it worked.
  res.render('login');
});

router.post('/register', function(req, res, next) {
  connection.query("INSERT INTO users (first_name, last_name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
  [req.body.first, req.body.last, req.body.email, req.body.rpassword, "2018-01-01", "2018-01-01"],
  function(err, results){
    if(err){
      console.log("An error has occured. This email address must already be in use!")
    }});

  // Ensure user isnt already registered
  // Insert user information into table

  // Redirect to splash page to login, or give error on splash if unsuccessful

  // These wont actually need to render anything in the future
  // This is really just to make sure it worked.
  //res.render('register');
});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard');
});

module.exports = router;
