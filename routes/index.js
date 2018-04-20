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
      request("https://www.alphavantage.co/query?function=SMA&symbol="+query.rows[i].stockticker+"&interval=daily&time_period=1"+parseInt(query.rows[i].params)+"&series_type=open&apikey=CJWPUA7R3VDJNLV0", function(error,response,body)
      {
<<<<<<< HEAD
        var movingAverageValue = JSON.parse(body)['Technical Analysis: SMA'][stringDate]['SMA']; //this is the moving average
        request("https://www.alphavantage.co/query?function=SMA&symbol="+this.query.rows[this.i].stockticker+"&interval=daily&time_period=2&series_type=open&apikey=CJWPUA7R3VDJNLV0", function(error,response,body2)
        {
          var currentPrice = JSON.parse(body2)['Technical Analysis: SMA'][stringDate]['SMA']; //this is the current price
          console.log("Current Price: "+currentPrice);
          console.log("Moving Average Value: "+movingAverageValue);
=======
        var movingAverageValue = JSON.parse(body)['Technical Analysis: SMA'][stringDate]['SMA']; //this is the moving average  
        console.log("Moving Average Value: "+movingAverageValue);     
        request("https://www.alphavantage.co/query?function=SMA&symbol="+query.rows[i].stockticker+"&interval=daily&time_period=2&series_type=open&apikey=CJWPUA7R3VDJNLV0", function(body, query, i, error,response,body2)
        {
          var currentPrice = JSON.parse(body2)['Technical Analysis: SMA'][stringDate]['SMA']; //this is the current price
          console.log("Current Price: "+currentPrice);
>>>>>>> f88d0d03f8dab941f32fe29ba3ef1517e332502d
          if(currentPrice>movingAverageValue)
          {
            queries.addNotification(this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should sell "+this.query.rows[this.i].numstocks+" of "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*this.query.rows[this.i].numstocks+".",function(query)
            {
              console.log("User "+query.rows[this.i].email+" should sell "+query.rows[this.i].numstocks+" of "+query.rows[this.i].stockticker+" at a price of "+this.currentPrice+" each. This would make the investment worth $"+this.currentPrice*query.rows[this.i].numstocks+".");//UnhandledPromiseRejection???
            }.bind({ i: this.i, currentPrice: currentPrice}));
          }
          else
          {
            queries.addNotification(this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should buy "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each.",function(query)
            {
              console.log("User "+query.rows[this.i].email+" should buy "+query.rows[this.i].stockticker+" at a price of "+this.currentPrice+" each.");//UnhandledPromiseRejection???
            }.bind({ i: this.i, currentPrice: currentPrice}));
          }
        }.bind({ query: this.query, i: this.i }));
      }.bind({ query: query, i: i }));
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

router.post('/updatePassword', async function(req, res, next) {
  console.log('Password Changed!');

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
