var express = require('express');
var router = express.Router();
const {Client} = require('pg');

//db connection string
var dbString = 'postgres://whiidzewjaaqzm:0001b1a8a6fa014941cfa07feb3bb8f8049f2210a11f1d5f14895ea6fac6f955@ec2-184-73-196-65.compute-1.amazonaws.com:5432/deacrvvlj7rj32';

const client = new Client({
  connectionString: dbString,
  ssl: true,
});

//Print all rows in users
/*
client.connect();
client.query("SELECT * FROM users;", (err,res) => {
  console.log(res); //fix this shit front end
});
*/

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('splash');
});

router.post('/login', function(req, res, next) {


  var username = (req['body']['username']);
  var password = (req['body']['password']);

  client.connect();
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
    client.connect();
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
  res.render('investments')
});

module.exports = router;
