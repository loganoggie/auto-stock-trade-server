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

      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth()+1;
      var day = date.getDate(); 

      if(month<10)
      {
        month="0"+month;
      }
      if(day<10)
      {
        day="0"+day;
      }
      var stringDate = year+"-"+month+"-"+day; //converting the date into the string that AV wants
      console.log("Current date: "+stringDate);
      request("https://www.alphavantage.co/query?function=SMA&symbol="+stockTicker+"&interval=daily&time_period=1"+day+"&series_type=open&apikey=CJWPUA7R3VDJNLV0", function(error,response,body)
      {
        var movingAverageValue = JSON.parse(body)['Technical Analysis: SMA'][stringDate]['SMA']; //this is the moving average  
        request("https://www.alphavantage.co/query?function=SMA&symbol="+stockTicker+"&interval=daily&time_period=2&series_type=open&apikey=CJWPUA7R3VDJNLV0", function(error,response,body2)
        {
          var currentPrice = JSON.parse(body2)['Technical Analysis: SMA'][stringDate]['SMA']; //this is the current price
          console.log("Current Price: "+currentPrice);
          console.log("Moving Average Value: "+movingAverageValue);     
          if(currentPrice>movingAverageValue)
          {
            queries.addNotification(email,"User "+email+" should sell "+numstocks+" of "+stockTicker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*numstocks+".",function(query)
            {
              console.log("User "+email+" should sell "+numstocks+" of "+stockTicker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*numstocks+".");
            });
          }
          else
          {
            queries.addNotification(email,"User "+email+" should buy "+stockTicker+" at a price of "+currentPrice+" each.",function(query)
            {
              console.log("User "+email+" should buy "+stockTicker+" at a price of "+currentPrice+" each.");
            });
          }
        });
      });
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
    queries.getCurrentUserInfo(req.user.id, req.user.email, function(query){
      req.session.userInfo=query.rows[0];
      console.log(req.session);
    });
    queries.getCurrentStockInfo(req.user.email, function(query){
      req.session.stockInfo=query.rows;
      console.log(req.session);
    });
    queries.getNotifications(req.user.email, function(query){
      req.session.notifications=query.rows;
      console.log(req.session);
    });
    res.render('dashboard2');
  }
});

router.get('/investments', function(req, res, next) {
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    req.logout();
    res.redirect('/');
  } else {
    queries.getCurrentUserInfo(req.user.id, req.user.email, function(query){
      req.session.userInfo=query.rows[0];
      console.log(req.session);
    });
    queries.getCurrentStockInfo(req.user.email, function(query){
      req.session.stockInfo=query.rows;
      console.log(req.session);
    });
    queries.getNotifications(req.user.email, function(query){
      req.session.notifications=query.rows;
      console.log(req.session);
    });
    res.render('investments', req);
  }
});

router.get('/aboutalgorithms', function(req, res, next) {
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    req.logout();
    res.redirect('/');
  } else {
    queries.getCurrentUserInfo(req.user.id, req.user.email, function(query){
      req.session.userInfo=query.rows[0];
      console.log(req.session);
    });
    queries.getCurrentStockInfo(req.user.email, function(query){
      req.session.stockInfo=query.rows;
      console.log(req.session);
    });
    queries.getNotifications(req.user.email, function(query){
      req.session.notifications=query.rows;
      console.log(req.session);
    });
    res.render('aboutalgorithms');
  }
});

router.get('/accountsettings', function(req, res, next) {
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    req.logout();
    res.redirect('/');
  } else {
    queries.getCurrentUserInfo(req.user.id, req.user.email, function(query){
      req.session.userInfo=query.rows[0];
      console.log(req.session);
    });
    queries.getCurrentStockInfo(req.user.email, function(query){
      req.session.stockInfo=query.rows;
      console.log(req.session);
    });
    queries.getNotifications(req.user.email, function(query){
      req.session.notifications=query.rows;
      console.log(req.session);
    });
    res.render('accountsettings');
  }
});

router.post('/updatePassword', function(req, res, next) {
  console.log('Password Changed!');

  console.log(req.user.id);
  console.log(req.user.email);

  queries.getCurrentUserInfo(req.user.id, req.user.email, function(query){

      req.session.userInfo = query.rows[0]; //get the current password hash and other user info from the database
     
      //get user input ...
      var currentPassword = req['body']['currentPassword'];           //user input - this should be the current plain text password associated with the users account
      var newPassword = req['body']['newPassword'];                   //user input - the new plain text password the user wants to change their password to
      var newPasswordConfirm = req['body']['newPasswordConfirm'];     //user input - this should match newPassword

      //console.log(req.session.userInfo);

      client.query("SELECT * FROM users", (err,res) => {
       console.log("Number of users: "+res.rowCount);
       console.log(res.rows);
      });

      if(newPassword === newPasswordConfirm)  //if new password fields match
      {
          //run compare to make sure the currentPassword is actually the user's current password in the database
          bcrypt.compare(currentPassword, req.session.userInfo.password, function (err, res)
          { 
              if(err)
              {
                console.log("Error while comparing current password input to current database password");
                throw err;
              }

              if(res) //res == true if the user types in the correct current password that is in the database
              {
                  //generate the salt. the salt is automatically stored in res ...
                  bcrypt.genSalt(function(err,res)
                  {
                      if(err)
                      {
                        console.log("Error while generating salt");
                        throw err;
                      }

                      console.log(res);
                      //generate and store the hash. the hash is automatically stored in result ...
                      bcrypt.hash(newPassword, res, function(error, result)
                      {
                          if(error)
                          {
                            console.log("Error while generating hash");
                            throw error;
                          }

                          console.log(result);
                          client.query("UPDATE users SET password = '" + result + "' where email = '" + req.session.userInfo.email + "';");
                          //client.query("UPDATE users SET password = '" + result + "';");
                      });
                  });
              }
              else
              {
                  console.log("Current password is incorrect");
              }
          }); 
      }
      else //otherwise new password fields didn't match
      {
        console.log("New passwords did not match!");
      }
      

  });

  res.render("accountsettings");

});

router.get('/dataanalytics', function(req, res, next) {
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    req.logout();
    res.redirect('/');
  } else {
    queries.getCurrentUserInfo(req.user.id, req.user.email, function(query){
      req.session.userInfo=query.rows[0];
      console.log(req.session);
    });
    queries.getCurrentStockInfo(req.user.email, function(query){
      req.session.stockInfo=query.rows;
      console.log(req.session);
    });
    queries.getNotifications(req.user.email, function(query){
      req.session.notifications=query.rows;
      console.log(req.session);
    });
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