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
  twilio.messages.create({
    body: 'myFolio update: Eat my ass.',
    to: '+13148147234', //Mario
    from: '+13146674809'
  }).then();
});

/*Runs the correct algorithm for every investment.*/

function twoDays(){
		var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var local = new Date(toLocal(new Date()));
    if(weekdays[local.getDay()] == "Monday" || weekdays[local.getDay()] == "Tuesday")
    	return local.getDate()-4;
    return local.getDate()-2;
}

function oneDay(){
		var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var local = new Date(toLocal(new Date()));
    if(weekdays[local.getDay()] == "Monday" || weekdays[local.getDay()] == "Tuesday")
    	return local.getDate()-3;
    return local.getDate()-1;
}

router.get('/run', function(req, res, next) {


  queries.getAllInvestments("RSI",function(query) {
    for(var i=0;i<query.rows.length;i++) //for each investment
    {
      if(query.rows[i].params=="lowrisk") //low risk RSI
      {
        var date = new Date();
        date.setDate(twoDays());//date form 2 days ago;
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
        request("https://www.alphavantage.co/query?function=RSI&symbol="+query.rows[i].stockticker+"&interval=daily&time_period=10&series_type=open&apikey=CJWPUA7R3VDJNLV0", function(error,response,body2)
        {
          var RSIvalue = JSON.parse(body2)['Technical Analysis: RSI'][stringDate]['RSI']; //this is the RSI value

          request("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+this.query.rows[this.i].stockticker+"&interval=60min&apikey=CJWPUA7R3VDJNLV0", function(error,response,body2)
          {
            var currentPrice = JSON.parse(body2)['Time Series (60min)'][stringDate+' 16:00:00']['1. open']; //this is the current price
            if(RSIvalue>=80)
            {
              queries.getPhoneNumber(this.query.rows[this.i].email, function(query2) {
                queries.addNotification(this.query.rows[this.i].twiliobit ,query2.rows[0].phonenumber, this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should sell "+this.query.rows[this.i].numstocks+" of "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*this.query.rows[this.i].numstocks+".", "CURRENT_TIMESTAMP", this.query.rows[this.i].stockticker, "RSI", currentPrice, function(query3)
                {
                }.bind({i: this.i, currentPrice: currentPrice, query: this.query}));
              }.bind({i: this.i, query: this.query}));
            }
            else if(RSIvalue<=20)
            {
              queries.getPhoneNumber(this.query.rows[this.i].email, function(query2) {
                queries.addNotification(this.query.rows[this.i].twiliobit ,query2.rows[0].phonenumber, this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should buy "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each.", "CURRENT_TIMESTAMP", this.query.rows[this.i].stockticker, "RSI", currentPrice, function(query3)
                {
                }.bind({i: this.i, currentPrice: currentPrice, query: this.query}));
              }.bind({i: this.i, query: this.query}));
            }
            else
            {

            }
          }.bind({ query: this.query, i: this.i }));
        }.bind({ query: query, i: i }));
      }
      else if(query.rows[i].params=="mediumrisk") //medium risk RSI
      {
        var date = new Date();
        date.setDate(twoDays());//date form 2 days ago;
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
        request("https://www.alphavantage.co/query?function=RSI&symbol="+query.rows[i].stockticker+"&interval=daily&time_period=10&series_type=open&apikey=CJWPUA7R3VDJNLV0", function(error,response,body2)
        {

          var RSIvalue = JSON.parse(body2)['Technical Analysis: RSI'][stringDate]['RSI']; //this is the RSI value

          request("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+this.query.rows[this.i].stockticker+"&interval=60min&apikey=CJWPUA7R3VDJNLV0", function(error,response,body2)
          {
            var currentPrice = JSON.parse(body2)['Time Series (60min)'][stringDate+' 16:00:00']['1. open']; //this is the current price
            if(RSIvalue>=65)
            {
              queries.getPhoneNumber(this.query.rows[this.i].email, function(query2) {
                queries.addNotification(this.query.rows[this.i].twiliobit ,query2.rows[0].phonenumber, this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should sell "+this.query.rows[this.i].numstocks+" of "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*this.query.rows[this.i].numstocks+".", "CURRENT_TIMESTAMP", this.query.rows[this.i].stockticker, "RSI", currentPrice, function(query3)
                {
                }.bind({i: this.i, currentPrice: currentPrice, query: this.query}));
              }.bind({i: this.i, query: this.query}));
            }
            else if(RSIvalue<=35)
            {
              queries.getPhoneNumber(this.query.rows[this.i].email, function(query2) {
                queries.addNotification(this.query.rows[this.i].twiliobit ,query2.rows[0].phonenumber, this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should buy "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each.", "CURRENT_TIMESTAMP", this.query.rows[this.i].stockticker, "RSI", currentPrice, function(query3)
                {
                }.bind({i: this.i, currentPrice: currentPrice, query: this.query}));
              }.bind({i: this.i, query: this.query}));
            }
            else
            {

            }
          }.bind({ query: this.query, i: this.i }));
        }.bind({ query: query, i: i }));
      }
      else if(query.rows[i].params=="highrisk") //high risk RSI
      {
        var date = new Date();
        date.setDate(twoDays());//date form 2 days ago;
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
        request("https://www.alphavantage.co/query?function=RSI&symbol="+query.rows[i].stockticker+"&interval=daily&time_period=10&series_type=open&apikey=CJWPUA7R3VDJNLV0", function(error,response,body2)
        {
          var RSIvalue = JSON.parse(body2)['Technical Analysis: RSI'][stringDate]['RSI']; //this is the RSI value

          request("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+this.query.rows[this.i].stockticker+"&interval=60min&apikey=CJWPUA7R3VDJNLV0", function(error,response,body2)
          {
            var currentPrice = JSON.parse(body2)['Time Series (60min)'][stringDate+' 16:00:00']['1. open']; //this is the current price
            if(RSIvalue>=55)
            {
              queries.getPhoneNumber(this.query.rows[this.i].email, function(query2) {
                queries.addNotification(this.query.rows[this.i].twiliobit ,query2.rows[0].phonenumber, this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should sell "+this.query.rows[this.i].numstocks+" of "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*this.query.rows[this.i].numstocks+".", "CURRENT_TIMESTAMP", this.query.rows[this.i].stockticker, "RSI", currentPrice, function(query3)
                {
                }.bind({i: this.i, currentPrice: currentPrice, query: this.query}));
              }.bind({i: this.i, query: this.query}));
            }
            else if(RSIvalue<=45)
            {
              queries.getPhoneNumber(this.query.rows[this.i].email, function(query2) {
                queries.addNotification(this.query.rows[this.i].twiliobit ,query2.rows[0].phonenumber, this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should buy "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each.", "CURRENT_TIMESTAMP", this.query.rows[this.i].stockticker, "RSI", currentPrice, function(query3)
                {
                }.bind({i: this.i, currentPrice: currentPrice, query: this.query}));
              }.bind({i: this.i, query: this.query}));
            }
            else
            {

            }
          }.bind({ query: this.query, i: this.i }));
        }.bind({ query: query, i: i }));
      }
      else
      {
        //console.log("Error");
      }
    }
  }).then(console.log("Finished RSI."));

  queries.getAllInvestments("BBands",function(query) {
    for(var i=0;i<query.rows.length;i++) //for each investment
    {

      var date = new Date();
      date.setDate(oneDay());//date form 2 days ago;
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
      request("https://www.alphavantage.co/query?function=BBANDS&symbol="+query.rows[i].stockticker+"&interval="+JSON.parse(query.rows[i].params).interval+"&time_period="+JSON.parse(query.rows[i].params).num_points+"&series_type=open&apikey=CJWPUA7R3VDJNLV0", function(error,response,body)
      {
        var upperBandValue = JSON.parse(body)['Technical Analysis: BBANDS'][stringDate]['Real Upper Band']; //this is the upper band
        var lowerBandValue = JSON.parse(body)['Technical Analysis: BBANDS'][stringDate]['Real Lower Band']; //this is the lower band
        request("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+this.query.rows[this.i].stockticker+"&interval=60min&apikey=CJWPUA7R3VDJNLV0", function(error,response,body2)
        {
          var currentPrice = JSON.parse(body2)['Time Series (60min)'][stringDate+' 16:00:00']['1. open']; //this is the current price
          if(currentPrice>upperBandValue)
          {
            queries.getPhoneNumber(this.query.rows[this.i].email, function(query2) {
              queries.addNotification(this.query.rows[this.i].twiliobit ,query2.rows[0].phonenumber, this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should sell "+this.query.rows[this.i].numstocks+" of "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*this.query.rows[this.i].numstocks+".", "CURRENT_TIMESTAMP", this.query.rows[this.i].stockticker, "BBANDS", currentPrice, function(query3)
              {
              }.bind({i: this.i, currentPrice: currentPrice, query: this.query}));
            }.bind({i: this.i, query: this.query}));
          }
          else if(currentPrice<lowerBandValue)
          {
            queries.getPhoneNumber(this.query.rows[this.i].email, function(query2) {
              queries.addNotification(this.query.rows[this.i].twiliobit ,query2.rows[0].phonenumber, this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should buy "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each.", "CURRENT_TIMESTAMP", this.query.rows[this.i].stockticker, "BBANDS", currentPrice, function(query3)
              {
              }.bind({i: this.i, currentPrice: currentPrice, query: this.query}));
            }.bind({i: this.i, query: this.query}));
          }
          else
          {

          }
        }.bind({ query: this.query, i: this.i }));
      }.bind({ query: query, i: i }));
    }
  }).then(console.log("Finished BBANDS."));

  queries.getAllInvestments("Moving Averages",function(query) {
    for(var i=0;i<query.rows.length;i++) //for each investment
    {
      var date = new Date();
      date.setDate(oneDay());//date form 2 days ago;
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

      request("https://www.alphavantage.co/query?function=SMA&symbol="+query.rows[i].stockticker+"&interval=daily&time_period=1"+parseInt(query.rows[i].params)+"&series_type=open&apikey=CJWPUA7R3VDJNLV0", function(error,response,body)
      {
        var movingAverageValue = JSON.parse(body)['Technical Analysis: SMA'][stringDate]['SMA']; //this is the moving average
        request("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+this.query.rows[this.i].stockticker+"&interval=60min&apikey=CJWPUA7R3VDJNLV0", function(error,response,body2)
        {
          var currentPrice = JSON.parse(body2)['Time Series (60min)'][stringDate+' 16:00:00']['1. open']; //this is the current price
          if(currentPrice>movingAverageValue)
          {
            queries.getPhoneNumber(this.query.rows[this.i].email, function(query2) {
              queries.addNotification(this.query.rows[this.i].twiliobit ,query2.rows[0].phonenumber, this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should sell "+this.query.rows[this.i].numstocks+" of "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*this.query.rows[this.i].numstocks+".", "CURRENT_TIMESTAMP", this.query.rows[this.i].stockticker, "Moving Averages", currentPrice, function(query3)
              {
              }.bind({i: this.i, currentPrice: currentPrice, query: this.query}));
            }.bind({i: this.i, query: this.query}));
          }
          else
          {
            queries.getPhoneNumber(this.query.rows[this.i].email, function(query2) {
              queries.addNotification(this.query.rows[this.i].twiliobit ,query2.rows[0].phonenumber, this.query.rows[this.i].email,"User "+this.query.rows[this.i].email+" should buy "+this.query.rows[this.i].stockticker+" at a price of "+currentPrice+" each.", "CURRENT_TIMESTAMP", this.query.rows[this.i].stockticker, "Moving Averages", currentPrice, function(query3)
              {
              }.bind({i: this.i, currentPrice: currentPrice, query: this.query}));
            }.bind({i: this.i, query: this.query}));
          }
        }.bind({ query: this.query, i: this.i }));
      }.bind({ query: query, i: i }));
    }
  }).then(console.log("Finished Moving Averages."));
  res.redirect('/dashboard');
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

  if(pass1!=pass2)
  {
    res.redirect('/');
  }
  else
  {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(pass1, salt);
    client.query("INSERT INTO users (fname, lname, email, password, AVkey) VALUES ('"+fName+"','"+lName+"','"+email+"','"+hash+"','CJWPUA7R3VDJNLV0');", (err,res2) => {
      if(err)
      {
        throw err;
      }
      else
      {
        console.log("User insertion successful.");
        res.redirect('/dashboard',req);
      }
    });
  }
});

function Notificaion(ac, sy, qt, pr) {//notification constructor
  this.symbol = sy;
  this.action = ac;
  this.quantity = qt;
  this.price = pr;
}

router.get('/dashboard', function(req, res, next) {
  if (!req.isAuthenticated() || !req.isAuthenticated) {
    console.log("Auth Failed.");
    res.redirect('/');
  } else {
    queries.getNotifications(req.user.email, function(query){
      var note = query.rows;
      var noteArry = note.map( a => a.notification);//gives an array of the notifations
      noteArry.reverse();
      var notes = [];
      for(var i = 0; i < noteArry.length; i++) {
        var split = noteArry[i].split(' ');
        if(noteArry[i].includes('sell')) {
          notes.push(new Notificaion('Sell', split[6], split[4], Number(Number(split[11]).toFixed(2)).toFixed(2)));
        }//end if
        else {
          notes.push(new Notificaion('Buy', split[4], 0, Number(Number(split[9]).toFixed(2)).toFixed(2)));
        }//end else
      }//end for
      res.render('dashboard2', {notifications: notes});
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

  res.render('investments', req)

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
    res.render('aboutalgorithms', req);
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
    res.render('accountsettings2', req);
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

  res.redirect("/accountsettings2");

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

  res.redirect("/accountsettings2");

});



router.post('/updateAVKey', function(req, res, next) {

  var newAVkey = req['body']['newAVKey']; //value from the on-screen textbox

  console.log("UPDATE users SET avkey = '" + newAVkey + "' WHERE id = '" + req.user.id + "' AND email = '" + req.user.email + "';");

  client.query("UPDATE users SET avkey = '" + newAVkey + "' WHERE id = '" + req.user.id + "' AND email = '" + req.user.email + "';");

  res.redirect('/accountsettings2');
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
