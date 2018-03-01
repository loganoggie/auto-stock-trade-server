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

//---JSON SENDING EXAMPLES---

router.get('/dash-get', function(req, res, next) {
  //Example of how this ojbect should be constructed for the simeple dashboard graph. More info about that on the google Doc.
  var myObj = {
    worth: 10000.00,
    price: [9000, 9200, 9460.43, 9750, 10000],
    dates: ["2-21-2018", "2-22-2018", "2-23-2018", "2-24-2018", "2-25-2018"]
  }
  res.json(JSON.stringify(myObj));
});

router.get('/tick-get', function(req, res, next) {
  //Example of how this ojject should be constructed to generate tickers on the dashboard
  var myObj = {
    api: 'QSZQSTA7ZLPXTAZO',
    symbols: ['GOOG', 'TSLA', 'AAPL', 'BA', 'AMD', 'BAC']
  }
  res.json(JSON.stringify(myObj));
});

//---END EXAMPLES---

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
