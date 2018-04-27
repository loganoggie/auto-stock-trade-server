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
var cp = require('child_process');

//-----------------------------------------------------------------------
//SUMMATION WORKER
var child = cp.fork('routes/summing.js');//summs up everything
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
    queries.getNotifications(req.user.email, function(query) {
      notifications = {
        "inv1": {
          "name": "APPL",
          "action": "Buy",
          "action_date": "05-10-18",
          "quantity": "1",
          "price": "110",
        },
        "inv2": {
          "name": "F",
          "action": "Sell",
          "action_date": "05-10-18",
          "quantity": "7",
          "price": "15",
        },
      };
      console.log(JSON.stringify(notifications) === JSON.stringify({}));
      res.render('dashboard2', {
        userNotifications: JSON.stringify(notifications),
      });
    });
  }
});

router.get('/dash-get', function(req, res, next) {

  queries.getCurrentStockInfo(req.user.email, function(query){
    req.session.stockInfo=query.rows;
    queries.getNotifications(req.user.email, function(query2){
      req.session.notifications=query2.rows;
      queries.getCurrentUserInfo(req.user.id, req.user.email, function(queryUser) {
        req.session.userInfo=queryUser.rows[0];
        queries.getWorth(req.user.email, function(queryWorth) {
          console.log(queryWorth.rows);
          req.session.worth = queryWorth.rows;
          req.session.total_worth = 10000;
          res.json(JSON.stringify(req.session));
        });
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

router.post('/edit-algorithm', function(req, res, next) {

  console.log(req.body)

  var ID = req.body.investID;
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

  client.query("DELETE FROM userstocks WHERE id=$1", [ID]);

  console.log(req.session.userInfo)

  client.query("INSERT INTO userstocks (email, stockticker, numstocks, algorithm, params, enabled) VALUES ('" + req.session.userInfo.email +
  "','" + req.body.symbol + "','" + req.body.volume + "','" + req.body.algorithm + "','" + params + "','" + 1 + "')")

  res.render('investments', req);

});

router.post('/delete', function(req, res, next) {

  console.log(req.body)

  var del_id = req.body.delete;
  client.query("DELETE FROM userstocks WHERE id=$1", [del_id]);

  res.render('investments', req);

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
    "','" + req.body.symbol + "','" + req.body.volume + "','" + req.body.algorithm + "','" + params + "','" + 1 + "')")

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

router.get('/accountsettings2', function(req, res, next) {
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

    res.render('accountsettings2');
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

      // client.query("SELECT * FROM users", (err,res) => {
      //  console.log("Number of users: "+res.rowCount);
      //  console.log(res.rows);
      // });
      // client.query("SELECT * FROM usernotifications", (err,res) => {
      //   console.log("Number of notifications: "+res.rowCount);
      //   console.log(res.rows);
      //  });

      if(newPassword === newPasswordConfirm)  //if new password feilds match
      {
          //run compare to make sure the currentPassword is actually the user's current password in the database
          bcrypt.compare(currentPassword, req.session.userInfo.password, function (err, res)
          { 
              if(err)
              {
                console.log("Error while comparing current password input to current database password");
                //alert("Error: your password has not been update. Please try agian");
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
                        //alert("Error: your password has not been update. Please try agian");
                        throw err;
                      }

                      console.log(res);
                      //generate and store the hash. the hash is automatically stored in result ...
                      bcrypt.hash(newPassword, res, function(error, result)
                      {
                          if(error)
                          {
                            console.log("Error while generating hash");
                            alert("Error: your password has not been update. Please try agian");
                            throw error;
                          }

                          console.log(result);
                          console.log("UPDATE users SET password = '" + result + "' where id = '" + req.session.userInfo.id + "';");
                          client.query("UPDATE users SET password = '" + result + "' where id = '" + req.session.userInfo.id + "';");
                          //alert("Your password has been updated.");
                          //client.query("UPDATE users SET password = '" + result + "';");
                      });
                  });
              }
              else
              {
                  console.log("Current password is incorrect");
                  //alert("Current password is incorrect");
              }
          }); 
      }
      else //otherwise new password fields didn't match
      {
        console.log("New passwords did not match!");
      }
      


  });

  res.render("accountsettings2");

});




router.post('/updatePhoneNumber', function(req, res, next) {
  
  console.log("Change Twillio Settings");


  queries.getCurrentUserInfo(req.user.id, req.user.email, function(query){

      req.session.userInfo = query.rows[0]; //get the current password hash and other user info from the database
     
      //get user input ...
      var newPhoneNumber = req['body']['newPhoneNumber'];                   //user input - the new plain text password the user wants to change their password to
      var newPhoneNumberConfirm = req['body']['newPhoneNumberConfirm'];

      // console.log(req.session.userInfo.id);
      // console.log("checkBox = " + checkBoxValue);
      // console.log("phoneNum = " + phoneNum);
      // console.log("phoneNum.length = " + phoneNum.length);
      // console.log("UPDATE users SET twilioenabled = '" + checkBoxValue + "' , phonenumber = '" + phoneNum + "'  where id = '" + req.session.userInfo.id + "';");
      
      if(newPhoneNumber == newPhoneNumberConfirm)
      {
        console.log("UPDATE users SET phonenumber = '" + newPhoneNumber + "'  where id = '" + req.session.userInfo.id + "';");
        client.query("UPDATE users SET phonenumber = '" + newPhoneNumber + "'  where id = '" + req.session.userInfo.id + "';");
      }
      else
      {
        console.log("Phone number did not match!");
      }
  });

  res.render("accountsettings2");

});



router.post('/updateAVkey', function(req, res, next) {
  
  var newAVkey = req['body']['newAVKey']; //value from the on-screen textbox

  console.log("UPDATE users SET avkey = '" + newAVkey + "' WHERE id = '" + req.user.id + "' AND email = '" + req.user.email + "';");

  client.query("UPDATE users SET avkey = '" + newAVkey + "' WHERE id = '" + req.user.id + "' AND email = '" + req.user.email + "';");
  
  res.render('accountsettings2');
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

router.get('/sum', function(req, res) {
  allUsersWorthDay();
});

function allUsersWorthDay() {
  queries.getAllUsers(function(query) {
    var json = JSON.stringify(query.rows);
    child.send(json);
  });
}

//client.query("INSERT INTO portfolioworth (email, worth, day) VALUES ($1,$2,$3)",["tanner0397x@gmail.com", 5000.00, "2018-04-23"])
child.on('message', function(result) {//When we recieve a sum, add it to the db
  var obj = JSON.parse(result);
  //console.log('User ID Recieved: ' + obj.email);
  //console.log('User portfolio worth: ' + obj.result);
  var email = obj.email;
  var worth = Number(obj.result).toFixed(2);
  var today = new Date().toISOString().slice(0, 10).replace('T', ' ');//todays date

  queries.addWorth(email, worth, today, function(result) {
    console.log("Added data to email: " + email);
  });
});

module.exports = router;

//make();
//allUsersWorthDay();
