// Global Module Handling -----------------------------------------------
var bcrypt = require('bcrypt');
var express = require('express');
var router = express.Router();
//-----------------------------------------------------------------------
// Local Module Handling ------------------------------------------------
var {passport} = require('../bin/passport.js');
var request = require('request');
var database = require('../bin/database.js');
var queries = require('../bin/queries.js');
var client = database.client;
var pool = database.pool;

//-----------------------------------------------------------------------

// console.log(passport);
// console.log(database);
// console.log(queries);

/*Runs the correct algorithm for every investment.*/
router.get('/run', function(req, res, next) {

  
     
  /*
  queries.getAllInvestments("RSI",function(query) {
    for(var i=0;i<query.rows.length;i++) //for each investment
    {
      if(query.rows[i].params=="low") //low risk RSI
      {
        //console.log("low");
      }
      else if(query.rows[i].params=="medium") //medium risk RSI
      {
        //console.log("medium");
      }
      else if(query.rows[i].params=="high") //high risk RSI
      {
        //console.log("high");
      }
      else
      {
        //console.log("Error");
      }
    }
  });
  */

  queries.getAllInvestments("MovingAverages",function(query) {
    for(var i=0;i<query.rows.length;i++) //for each investment
    {
      var email = query.rows[i].email;
      var numstocks = query.rows[i].numstocks;
      var day = parseInt(query.rows[i].params); //day that the user passes in for moving averages
      var stockTicker = query.rows[i].stockticker; //stock ticker
      var apikey = req.session.userInfo.avkey;

      var request_array = ['SMA', stockTicker, 'daily', 2, apikey]

      funcs.do_alpha_job(funcs.getTechnical, request_array, funcs.print_earliest)

    }
  });
  res.render('splash');
});

router.get('/', function(req, res, next) {
  res.render('splash');
});

router.post('/login', passport.authenticate('local-login', {successRedirect: '/dashboard', failureRedirect: '/'}));

router.post('/register', function(req, res, next) {

  var fName = req['body']['first'];
  var lName = req['body']['last'];
  var email = req['body']['email'];
  var pass1 = req['body']['rpassword'];
  var pass2 = req['body']['crpassword'];

  console.log("Pass1:" + pass1);
  console.log("Pass2:" + pass2);

  if(pass1!=pass2)
  {
    console.log("Passwords don't match");
  }
  else
  {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(pass1, salt);

    console.log(salt);
    console.log(hash);

    client.query("INSERT INTO users (fname, lname, email, password, AVkey) VALUES ('"+fName+"','"+lName+"','"+email+"','"+hash+"','CJWPUA7R3VDJNLV0');", (err,res2) => {
      if(err)
      {
        throw err;
        console.log("in here");
      }
      else
      {
        console.log("User insertion successful.");
      }
    });
  }
  res.redirect('/dashboard',req);
});

router.get('/dashboard', function(req, res, next) {
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    res.redirect('/');
  } else {

    res.render('dashboard2');
  }
});

router.get('/dash-get', function(req, res, next) {

  queries.getCurrentStockInfo(req.user.email, function(query){
    req.session.stockInfo=query.rows;
    queries.getNotifications(req.user.email, function(query2){
      req.session.notifications=query2.rows;
      queries.getCurrentUserInfo(req.user.id, req.user.email, function(queryUser) {
        req.session.userInfo=queryUser.rows[0];
        req.session.worth_day = {
          worth: [9000, 9200, 9460.43, 9750, 10000],
          day: ["2-21-2018", "2-22-2018", "2-23-2018", "2-24-2018", "2-25-2018"]
          };
        req.session.total_worth = 10000.00;
        res.json(JSON.stringify(req.session));
      });
    });
  });

});

router.get('/tick-get', function(req, res, next) {
    res.json(JSON.stringify(req.session));
});

router.get('/investments-get', function(req, res, next) {
  console.log(req.session);
  res.json(JSON.stringify(req.session));
});

router.post('/add', function(req, res, next) {

  var tmp_param1 = 80;
  var tmp_param2 = 20;
  var tmp_time_interval = '1min';

  if (req.body.symbol == 'RSI')
  {

  }
  else if (req.body.symbol == 'BBANDS')
  {

  }
  else if (req.body.symbol == 'SMA')
  {

  }

  var params = {
    param: tmp_param1,
    param2: tmp_param2,
    param3: req.body.radio,
    param4: tmp_time_interval
  }

  client.query("INSERT INTO userstocks (email, stockticker, numstocks, algorithm, params, enabled) VALUES ('" + req.session.userInfo.email + 
    "','" + req.body.symbol + "','" + req.body.volume + "','" + req.body.algorithm + "','" + n.params + "','" + 1 + "')")

  req.session.stockInfo.push(n)

  console.log(req.session);

  res.render('investments')
  
});

router.get('/investments', function(req, res, next) {
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    req.logout();
    res.redirect('/');
  } else {

    res.render('investments', req);
  }
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

router.post('/updatePassword', async function(req, res, next) {
  console.log('Password Changed!');

  var currentPassword = req['body']['currentPassword'];
  var newPassword = req['body']['newPassword'];
  var newPasswordConfirm = req['body']['newPasswordConfirm'];
  
  console.log(req.session);
  console.log(req.session.userInfo);
  console.log(req.session.userInfo.password);

  if(bcrypt.compareSync(currentPassword, req.session.userInfo.password) && newPassword === newPasswordConfirm) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(newPassword, salt);

    client.query("UPDATE users SET password = " + hash + ";");
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
});

module.exports = router;