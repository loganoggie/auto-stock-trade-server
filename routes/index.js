// Global Module Handling -----------------------------------------------
var express = require('express');
var router = express.Router();
//-----------------------------------------------------------------------
// Local Module Handling ------------------------------------------------
var {passport} = require('../bin/passport.js');
var database = require('../bin/database.js');
var queries = require('../bin/queries.js');
var client = database.client;
var pool = database.pool;
//-----------------------------------------------------------------------

router.get('/', function(req, res, next) {
  console.log(req.user);
  res.render('splash');
});

<<<<<<< HEAD
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
=======
router.post('/login', passport.authenticate('local', {successRedirect: '/dashboard', failureRedirect: '/'}));
>>>>>>> master

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
    client.query("INSERT INTO users (fname, lname, email, password, AVkey) VALUES ('"+fName+"','"+lName+"','"+email+"','"+pass1+"','CJWPUA7R3VDJNLV0');", (err2,res2) => {
    if(err2)
    {
      throw err2;
      console.log("Error when Registering.");
    }
    else
    {
      //First time so give them money
      client.query("SELECT * FROM userstocks;", (error,response) => {
        if(error)
        {
          throw error;
          console.log("Error");
        }
        uniqueID = response.rowCount+1;
      });

      client.query("INSERT INTO userstocks (id, email, stockticker, numstocks, algorithm, params, enabled) VALUES ('"+uniqueID+"','"+email+"','$$$$','10000','NULL','NULL','NULL')", (err3,res3) => {
        if(err3)
        {
          throw err3;
          console.log("Error when giving the user initial money.");
        }
        else
        {
          console.log("$10,000 added to "+email); 
        }
      });

      var user = {
        fname: fname,
        lname: lname,
        email: email,
        AVkey: 'CJWPUA7R3VDJNLV0',
        money: '10000',
        stocks: ''
      }
      res.json(JSON.stringify(user));

      console.log('dashboard'); //pass the user in optional parameters
    }
    client.end();
    });
  }
  res.render('register');
});

router.get('/dashboard', function(req, res, next) {
<<<<<<< HEAD
  client.query("SELECT * FROM userstocks WHERE email='"+req.email+"' AND stockticker!='$$$$';", (err2,res2) => {
    if(err2)
    {
      throw err2;
      console.log("Error loading dashboard.");
    }
    else
    {
      userStocks = res2.rows;
    }
  });

  var user = {
    fname: req.user.fname,
    lname: req.user.lname,
    email: req.user.email,
    AVkey: req.user.AVkey,
    money: req.user.money,
    stocks: userStocks
  }
  res.json(JSON.stringify(user));
  res.render('dashboard');
=======
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    res.redirect('/');
  } else {
    // BUG -- queries.getCurrentUserInfo cannot return the needed info because client.query is an async
    // function. Promises need to be implemented to return needed data when available.
    console.log("Result of Query: " + queries.getCurrentUserInfo(req.user.id, req.user.email));
    res.render('dashboard');
  }
});

//---------------------------------------------------------JSON SENDING EXAMPLES---------------------------------------------------------

router.get('/dash-get', function(req, res, next) {
  //Example of how this ojbect should be constructed for the simeple dashboard graph. More info about that on the google Doc.
  var myObj = {
    worth: 10000.00,//current portfolio worth
    price: [9000, 9200, 9460.43, 9750, 10000],//array of the portfolio worth day by day, first enrty is earliest data. Maybe keep size fix so the x-axis isnt hard to read.
    dates: ["2-21-2018", "2-22-2018", "2-23-2018", "2-24-2018", "2-25-2018"]//Value of dates corresponding to the dollar amounts.
  }
  res.json(JSON.stringify(myObj));
>>>>>>> master
});

router.get('/tick-get', function(req, res, next) {
  //Example of how this ojject should be constructed to generate tickers on the dashboard
  var myObj = {
    api: 'QSZQSTA7ZLPXTAZO',//AlphaVantage API key that the user table has
    symbols: ['GOOG', 'TSLA', 'AAPL', 'BA', 'AMD', 'BAC']//An array of some of the most common stocks.
  }
  res.json(JSON.stringify(myObj));
});

//--------------------------------------------------------------END OF EXAMPLES --------------------------------------------------------

router.get('/investments', function(req, res, next) {
<<<<<<< HEAD

  var user = {
    fname: req.user.fname,
    lname: req.user.lname,
    email: req.user.email,
    AVkey: req.user.AVkey,
    money: req.user.money,
    stocks: req.user.userStocks
  }
  res.json(JSON.stringify(user));

  res.render('investments');
=======
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    req.logout();
    res.redirect('/');
  } else {
    res.render('investments');
  }
>>>>>>> master
});

router.get('/aboutalgorithms', function(req, res, next) {
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    req.logout();
    res.redirect('/');
  } else {
    res.render('aboutalgorithms');
  }
});

router.get('/accountsettings', function(req, res, next) {
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    req.logout();
    res.redirect('/');
  } else {
    res.render('accountsettings');
  }
});

router.get('/dataanalytics', function(req, res, next) {
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    req.logout();
    res.redirect('/');
  } else {
    res.render('dataanalytics');
  }
});

router.get('/logout', function(req, res) {
  console.log(req.user);
  req.logout();
  console.log(req.user);
  res.redirect('/');
})

module.exports = router;
