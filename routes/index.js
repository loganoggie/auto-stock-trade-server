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
var funcs = require('./funcs.js')
var client = database.client;
var pool = database.pool;

//-----------------------------------------------------------------------

// console.log(passport);
// console.log(database);
// console.log(queries);


const DEFAULT_URL = 'https://www.alphavantage.co/query?'

/*Runs the correct algorithm for every investment.*/
router.get('/runRSI', function(req, res, next) {

  queries.getAllInvestments("RSI",function(query) {
    console.log("PROCESSING RSI ALGO");
    for(var i=0;i<query.rows.length;i++) //for each investment
    {
      if(query.rows[i].params=="low") //low risk RSI
      {
        //console.log("low");

        var stringDate = funcs.right_now();

        var params = funcs.make_params('RSI', query.rows[i].stockticker, "daily", 10, req.session.userInfo.avkey);
        var encoded = Object.keys(params).map(
        key => `${key}=${params[key]}`
        ).join('&');

        var url = DEFAULT_URL + encoded
        //https://www.alphavantage.co/query?function=RSI&symbol="+this.query.rows[this.i].stockticker+"&interval=daily&time_period=10&series_type=open&apikey=CJWPUA7R3VDJNLV0
        request(url, function(error,response,body2)
        {
          console.log("RSIDate: "+stringDate);
          var RSIvalue = JSON.parse(body2)['Technical Analysis: RSI'][stringDate]['RSI']; //this is the current price
          //console.log("Current Price: "+currentPrice);
          console.log("RSI Value: "+RSIvalue);
          /*
          if(currentPrice>RSIvalue)
          {
            queries.addNotification(this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should sell "+this.query.rows[this.i].numstocks+" of "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*this.query.rows[this.i].numstocks+".",function(query)
            {
              //console.log("User "+query.rows[this.i].email+" should sell "+query.rows[this.i].numstocks+" of "+query.rows[this.i].stockticker+" at a price of "+this.currentPrice+" each. This would make the investment worth $"+this.currentPrice*query.rows[this.i].numstocks+".");//UnhandledPromiseRejection???
              console.log("SELL THE STOCK:");
            }.bind({ i: this.i, currentPrice: currentPrice}));
          }
          else
          {
            queries.addNotification(this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should buy "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each.",function(query)
            {
              //console.log("User "+query.rows[this.i].email+" should buy "+query.rows[this.i].stockticker+" at a price of "+this.currentPrice+" each.");//UnhandledPromiseRejection???
              console.log("BUY THE STOCK:");
            }.bind({ i: this.i, currentPrice: currentPrice}));
          }
          */
        }.bind({ query: query, i: i }));
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

});

router.get('/runSMA', function(req, res, next) {

  queries.getAllInvestments("MovingAverages",function(query) {
    for(var i=0;i<query.rows.length;i++) //for each investment
    {

      var stringDate = funcs.right_now();

      var params = funcs.make_params('SMA', query.rows[i].stockticker, "daily", 10, req.session.userInfo.avkey);
      var encoded = Object.keys(params).map(
      key => `${key}=${params[key]}`
      ).join('&');

      var url = DEFAULT_URL + encoded

      console.log("Current date: "+stringDate);
      console.log(url)
      request(url, function(error,response,body)
      {
        console.log("CHECK this stringdate:"+stringDate);
        var movingAverageValue = JSON.parse(body)['Technical Analysis: SMA'][stringDate]['SMA']; //this is the moving average
        
        var params2 = funcs.make_params('TIME_SERIES_INTRADAY', this.query.rows[this.i].stockticker, '60min', req.session.userInfo.avkey)
        var encoded2 = Object.keys(params).map(
        key => `${key}=${params[key]}`
        ).join('&');

        var url2 = DEFAULT_URL + encoded2

        request(url2, function(error,response,body2)
        {
          var currentPrice = JSON.parse(body2)['Time Series (60min)'][stringDate+' 16:00:00']['1. open']; //this is the current price
          console.log("Current Price: "+currentPrice);
          console.log("Moving Average Value: "+movingAverageValue);
          if(currentPrice>movingAverageValue)
          {
            queries.addNotification(this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should sell "+this.query.rows[this.i].numstocks+" of "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*this.query.rows[this.i].numstocks+".",function(query)
            {
              //console.log("User "+query.rows[this.i].email+" should sell "+query.rows[this.i].numstocks+" of "+query.rows[this.i].stockticker+" at a price of "+this.currentPrice+" each. This would make the investment worth $"+this.currentPrice*query.rows[this.i].numstocks+".");//UnhandledPromiseRejection???
              console.log("SELL THE STOCK:");
            }.bind({ i: this.i, currentPrice: currentPrice}));
          }
          else
          {
            queries.addNotification(this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should buy "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each.",function(query)
            {
              //console.log("User "+query.rows[this.i].email+" should buy "+query.rows[this.i].stockticker+" at a price of "+this.currentPrice+" each.");//UnhandledPromiseRejection???
              console.log("BUY THE STOCK:");
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
  queries.getCurrentStockInfo(req.user.email, function(query){
    req.session.stockInfo=query.rows;
    res.json(JSON.stringify(req.session));
  });
});

router.get('/investments-get', function(req, res, next) {
  queries.getCurrentStockInfo(req.user.email, function(query){
    req.session.stockInfo=query.rows;
    res.json(JSON.stringify(req.session));
  // console.log(req.body)
  });
});

router.post('/edit', function(req, res, next) {
  
  // var update_id = 0;
  // client.query("UPDATE userstocks SET WHERE id=$1", [del_id]);
  
});

router.post('/delete', function(req, res, next) {
  
  // var del_id = 0;
  // client.query("DELETE FROM userstocks WHERE id=$1", [del_id]);
  
});

router.post('/add', function(req, res, next) {

  console.log(req.body)
  var params;

  if (req.body.algorithm == 'BBands')
  {

    params = JSON.stringify({
      'interval': req.body.interval,
      'num_points': req.body.num_points
    })
  }
  else if (req.body.algorithm == 'Moving Averages')
  {
    params = req.body.days;
  }
  else if (req.body.algorithm == 'RSI')
  {
    params = req.body.radio;
  }

  console.log(params)

  client.query("INSERT INTO userstocks (email, stockticker, numstocks, algorithm, params, enabled) VALUES ('" + req.session.userInfo.email + 
    "','" + req.body.symbol + "','" + req.body.volume + "','" + req.body.algorithm + "','" + req.body.radio + "','" + 1 + "')")

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