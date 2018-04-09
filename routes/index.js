// Global Module Handling -----------------------------------------------
var express = require('express');
var router = express.Router();
//-----------------------------------------------------------------------
// Local Module Handling ------------------------------------------------
var {passport} = require('../bin/passport.js');
var database = require('../bin/database.js');
var queries = require('../bin/queries.js');
var funcs = require('./funcs.js');
var client = database.client;
var pool = database.pool;
//-----------------------------------------------------------------------

console.log(passport);
console.log(database);
console.log(queries);

router.get('/', function(req, res, next) {
  res.render('splash');
});

router.post('/login', passport.authenticate('local', {successRedirect: '/dashboard', failureRedirect: '/'}));

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
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    res.redirect('/');
  } else {
    
    console.log(req.user)
    queries.getCurrentUserInfo(req.user.id, req.user.email, function(query){
      
      req.user.id = query.rows[0].id
      req.session.ID = query.rows[0].id
      req.session.fname = query.rows[0].fname
      req.session.lname = query.rows[0].lname
      req.session.email = query.rows[0].email
      req.session.password = query.rows[0].password
      req.session.avkey = query.rows[0].avkey

      req.session.algoArr = [] // initialize the object array

      console.log("PRINTED FROM DASHBOARD INSIDE QUERY")
      console.log(req.session) 

      res.render('dashboard');
      });

    console.log("PRINTED FROM DASHBOARD OUTSIDE QUERY")
    console.log(req.session)

    req.user.test = 0
    console.log(req.user)


    
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
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    req.logout();
    res.redirect('/');
  } else {
    console.log(req.user)


    queries.getCurrentStockInfo(req.user.email, function(query)
      {

        // Do stuff here when we can actually grab rows containing algorithms for 1 person
        console.log(query.rows)
        // for (var i in query.rows)
        // {
        //   console.log(i)
        // }
        
      });

    console.log("PRINTED IN INVESTMENTS GET")
    console.log(req.session)

    res.render('investments');
  }
});

router.post('/add', function(req, res, next) {

  // UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): error: duplicate key value violates unique constraint "userstocks_pkey"

  // The way the database is set up right now, a user can only have 1 algorithm. 

  console.log("INSERT INTO userstocks (email, stockticker, numstocks, algorithm, params, enabled) VALUES ('" + req.user.email + 
    "','" + req.body.symbol + "','" + req.body.volume + "','" + req.body.algorithm + "','" + req.body.rsi + "','" + 1 + "')")

   client.query("INSERT INTO userstocks (email, stockticker, numstocks, algorithm, params, enabled) VALUES ('" + req.user.email + 
    "','" + req.body.symbol + "','" + req.body.volume + "','" + req.body.algorithm + "','" + req.body.rsi + "','" + 1 + "')")

  
  // sloppy, but you get the idea
  var newAlgo = funcs.make_algo_obj(req.user.email, req.body.symbol, req.body.algorithm, 80 , 20, req.body.rsi, "5min", 1, funcs.make_risk_func_RSI(req.body.rsi))

  console.log("PRINTED IN ADD POST")
  req.session.algoArr.push(newAlgo)

  console.log(req.session)

  res.render('investments')
  
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

router.post('/updateAVkey', function(req, res, next) {
    
    var newAVkey = req['body']['newAVkey']; //value from the on-screen textbox

    console.log("UPDATE users SET AVkey = '" + newAVkey + "' WHERE id = '" + req.user.id + "' AND email = '" + req.user.email + "';");

    client.query("UPDATE users SET AVkey = '" + newAVkey + "' WHERE id = '" + req.user.id + "' AND email = '" + req.user.email + "';", (err,res2) => {
        if(err)
        {
          throw err;
        }
        else
        {
          console.log('Success?');
        }
        client.end();
    });
    res.render('accountsettings');
});

router.get('/logout', function(req, res) {
  console.log(req.user);
  req.logout();
  console.log(req.user);
  res.redirect('/');
})



module.exports = router;
