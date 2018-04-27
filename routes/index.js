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
var cp = require('child_process')
var twilio = require('twilio')('AC31621b0d9e4714be87ce41aa88d2cbad','a3b8be0954cd4e84950c98dbdde099f8');

//-----------------------------------------------------------------------

var child = cp.fork('routes/summing.js')

router.get('/demo', function(req,res,next){
  twilio.messages.create({
    body: 'myFolio update: Eat my ass.',
    to: '+16365380210', //John
    from: '+13146674809'
  }).then();
  twilio.messages.create({
    body: 'myFolio update: Eat my ass.',
    to: '+16604221182', //Gunner
    from: '+13146674809'
  }).then();
  twilio.messages.create({
    body: 'myFolio update: Eat my ass.',
    to: '+16362841357', //Derek
    from: '+13146674809'
  }).then();
  twilio.messages.create({
    body: 'myFolio update: Eat my ass.',
    to: '+14173984675', //Tanner
    from: '+13146674809'
  }).then();
  twilio.messages.create({
    body: 'myFolio update: Eat my ass.',
    to: '+15734654549', //Logan
    from: '+13146674809'
  }).then();
  twilio.messages.create({
    body: 'myFolio update: Eat my ass.',
    to: '+15733304861', //Joey
    from: '+13146674809'
  }).then();
});

/*Runs the correct algorithm for every investment.*/
router.get('/run', function(req, res, next) {

  /*
  queries.getAllInvestments("RSI",function(query) {
    console.log("PROCESSING RSI ALGO");
    for(var i=0;i<query.rows.length;i++) //for each investment
    {
      if(query.rows[i].params=="low") //low risk RSI
      {
        //console.log("low");
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate()-2;

        if(month<10)
        {
          month="0"+month;
        }
        if(day<10)
        {
          day="0"+day;
        }


      var stringDate = year+"-"+month+"-"+day; //converting the date into the string that AV wants
        //https://www.alphavantage.co/query?function=RSI&symbol="+this.query.rows[this.i].stockticker+"&interval=daily&time_period=10&series_type=open&apikey=CJWPUA7R3VDJNLV0
        request("https://www.alphavantage.co/query?function=RSI&symbol="+query.rows[i].stockticker+"&interval=daily&time_period=10&series_type=open&apikey=CJWPUA7R3VDJNLV0", function(error,response,body2)
        {
          console.log("RSIDate: "+stringDate);
          var RSIvalue = JSON.parse(body2)['Technical Analysis: RSI'][stringDate]['RSI']; //this is the current price
          //console.log("Current Price: "+currentPrice);
          console.log("RSI Value: "+RSIvalue);
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
  */

  queries.getAllInvestments("Moving Averages",function(query) {
    for(var i=0;i<query.rows.length;i++) //for each investment
    {
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth()+1;
      var day = date.getDate()-1;

      if(month<10)
      {
        month="0"+month;
      }
      if(day<10)
      {
        day="0"+day;
      }
      var stringDate = year+"-"+month+"-"+day; //converting the date into the string that AV wants

      request("https://www.alphavantage.co/query?function=SMA&symbol="+query.rows[i].stockticker+"&interval=daily&time_period=1"+parseInt(query.rows[i].params)+"&series_type=open&apikey=CJWPUA7R3VDJNLV0", function(error,response,body)
      {
        var movingAverageValue = JSON.parse(body)['Technical Analysis: SMA'][stringDate]['SMA']; //this is the moving average
        request("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+this.query.rows[this.i].stockticker+"&interval=60min&apikey=CJWPUA7R3VDJNLV0", function(error,response,body2)
        {
          var currentPrice = JSON.parse(body2)['Time Series (60min)'][stringDate+' 16:00:00']['1. open']; //this is the current price
          if(currentPrice>movingAverageValue)
          {
            queries.getPhoneNumber(this.query.rows[this.i].email, function(query2) {
              queries.addNotification(query2.rows[0].phonenumber, this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should sell "+this.query.rows[this.i].numstocks+" of "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*this.query.rows[this.i].numstocks+".",function(query3)
              {
              }.bind({i: this.i, currentPrice: currentPrice, query: this.query}));
            }.bind({i: this.i, query: this.query}));
          }
          else
          {
            queries.getPhoneNumber(this.query.rows[this.i].email, function(query2) {
              queries.addNotification(this.query.rows[this.i].phonenumber, this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should buy "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each.",function(query3)
              {
              }.bind({i: this.i, currentPrice: currentPrice, query: this.query}));
            }.bind({i: this.i, query: this.query}));
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
    queries.getNotifications(req.user.email, function(query){
      var note = query.rows;
      res.render('dashboard2', {notifications: note});
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
    queries.getCurrentUserInfo(req.user.id, req.user.email, function(queryUser) {
      req.session.userInfo = queryUser.rows[0];
      req.session.stockInfo=query.rows;
      res.json(JSON.stringify(req.session));
    });
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
  var del_id = req.body.delete;
  client.query("DELETE FROM userstocks WHERE id=$1", [del_id]);
  res.render('investments', req);
});

router.post('/add', function(req, res, next) {
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
  var currentPassword = req['body']['currentPassword'];
  var newPassword = req['body']['newPassword'];
  var newPasswordConfirm = req['body']['newPasswordConfirm'];

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

router.get('/sum', function(req, res) {
  allUsersWorthDay();
});

function allUsersWorthDay() {
  queries.getAllUsers(function(query) {
    var json = JSON.stringify(query.rows);
    child.send(json);
  });
}

function toLocal(day) {//for local time
    var tzo = -day.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return day.getFullYear() +
        '-' + pad(day.getMonth() + 1) +
        '-' + pad(day.getDate()) +
        'T' + pad(day.getHours()) +
        ':' + pad(day.getMinutes()) +
        ':' + pad(day.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
}

child.on('message', function(result) {//When we recieve a sum, add it to the db
  var obj = JSON.parse(result);
  var email = obj.email;
  var worth = Number(obj.result).toFixed(2);
  var today = toLocal(new Date()).slice(0, 10).replace('T', ' ');

  queries.addWorth(email, worth, today, function(result) {
    console.log("Added data to email: " + email);
  });
});

module.exports = router;
