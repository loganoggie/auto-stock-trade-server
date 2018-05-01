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
var Stocks = require('../public/js/stocks.js')
var client = database.client;
var pool = database.pool;
var cp = require('child_process')
var twilio = require('twilio')('AC31621b0d9e4714be87ce41aa88d2cbad','a3b8be0954cd4e84950c98dbdde099f8');

//-----------------------------------------------------------------------

var child = cp.fork('routes/summing.js')

router.get('/demo', function(req,res,next){
  twilio.messages.create({
    body: 'myFolio update: I am a brainlet.',
    to: '+16365380210', //John
    from: '+13146674809'
  }).then();
  twilio.messages.create({
    body: 'myFolio update: I am a brainlet.',
    to: '+16604221182', //Gunner
    from: '+13146674809'
  }).then();
  twilio.messages.create({
    body: 'myFolio update: I am a brainlet.',
    to: '+16362841357', //Derek
    from: '+13146674809'
  }).then();
  twilio.messages.create({
    body: 'myFolio update: I am a brainlet.',
    to: '+14173984675', //Tanner
    from: '+13146674809'
  }).then();
  twilio.messages.create({
    body: 'myFolio update: I am a brainlet.',
    to: '+15734654549', //Logan
    from: '+13146674809'
  }).then();
  twilio.messages.create({
    body: 'myFolio update: I am a brainlet.',
    to: '+15733304861', //Joey
    from: '+13146674809'
  }).then();
  twilio.messages.create({
    body: 'myFolio update: I am a brainlet.',
    to: '+13148147234', //Mario
    from: '+13146674809'
  }).then();
});

/*Runs the correct algorithm for every investment.*/

function twoDays()
{
		var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var local = new Date(toLocal(new Date()));
    if(weekdays[local.getDay()] == "Monday" || weekdays[local.getDay()] == "Tuesday")
      local.setDate(local.getDate() - 4)
    	return local;
    local.setDate(local.getDate() - 2)
    return local;
}

function oneDay()
{
		var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var local = new Date(toLocal(new Date()));
    if(weekdays[local.getDay()] == "Monday")
    {
      local.setDate(local.getDate() - 3)
    	return local;
    }
    local.setDate(local.getDate() - 1)
    return local;
}

function lastWeek()
{
  var local = new Date(toLocal(new Date()));
  local.setDate(local.getDate() - 7)
  return local;
}

async function resultMin(symbol, api) { //
	try {
    var stocks = new Stocks(api);
		var result = await stocks.timeSeries({
			symbol: symbol,
			interval: '1min',
			amount: 1
		});
		return result
	}
	catch(err) {
		console.log(err);
	}
}//end resultMin

/*Fail catching timeouts*/
var rsiFail = [];
var avgFail = [];
var bbandsFail = [];

/*Technical Indicators*/

function doRSI(investment) {
  //Low med, high
  const UPPER_BOUND = [80, 65, 55];
  const LOWER_BOUND = [20, 35, 45];
  var lower = 0;
  var upper = 0;
  try
  {
    if(investment.params=="lowrisk") //low risk RSI
    {
      upper = UPPER_BOUND[0];
      lower = LOWER_BOUND[0];
    }
    else if(investment.params=="mediumrisk") //medium risk RSI
    {
      upper = UPPER_BOUND[1];
      lower = LOWER_BOUND[1];
    }
    else if(investment.params=="highrisk") //high risk RSI
    {
      upper = UPPER_BOUND[2];
      lower = LOWER_BOUND[2];
    }
    else
    {
      console.log("Error: No Risk!");
      return
    }

    var date = twoDays();//date form 2 days ago;
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
    request("https://www.alphavantage.co/query?function=RSI&symbol="+investment.stockticker+"&interval=daily&time_period=10&series_type=open&apikey=HINHR5C56XTU0VE2", function(error,response,body2)
    {
      if(error) {
        throw "Error: RSI has failed to generate any data."
      }
      var RSIvalue = JSON.parse(body2)['Technical Analysis: RSI'][stringDate]['RSI']; //this is the RSI value
      request("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+this.investment.stockticker+"&interval=60min&apikey=XJEKY7CWNCOKZ5ZP", function(error,response,body2)
      {
        if(error) {
          throw "Error: Time Series has failed";
        }

        var currentPrice = JSON.parse(body2)['Time Series (60min)'][stringDate+' 16:00:00']['1. open']; //this is the current price
        if(RSIvalue>=upper)
        {
          queries.getPhoneNumber(this.investment.email, function(query2) {
            queries.addNotification(this.investment.twiliobit ,query2.rows[0].phonenumber, this.investment.email,"User "+this.investment.email+" should sell "+this.investment.numstocks+" of "+this.investment.stockticker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*this.investment.numstocks+".",function(query3)
            {
            }.bind({currentPrice: currentPrice, investment: this.investment}));
          }.bind({investment: this.investment}));
        }
        else if(RSIvalue<=lower)
        {
          queries.getPhoneNumber(this.investment.email, function(query2) {
            queries.addNotification(this.investment.twiliobit ,query2.rows[0].phonenumber, this.investment.email,"User "+this.investment.email+" should buy "+this.investment.stockticker+" at a price of "+currentPrice+" each.",function(query3)
            {
            }.bind({currentPrice: currentPrice, investment: this.investment}));
          }.bind({investment: this.investment}));
        }
        else
        {

        }
      }.bind({ investment: this.investment }));
    }.bind({ investment: investment }));
  }//end try
  catch(err)

  {
    console.log(err);
    //Retry again in 10 seconds
    rsiFail.push(setTimeout(function(k) {doRSI(k)}, 10*1000, investment));
  }
}

function doBbands(investment)
{
  try
  {
    var date = new Date(toLocal(new Date()));
    if(JSON.parse(investment.params).interval == 'daily')
    {
      date = oneDay();//last trade day
    }
    else if(JSON.parse(investment.params).interval == 'weekly')
    {
      date = lastWeek();
    }
    else if(JSON.parse(investment.params).interval == 'monthly')
    {
      date.setMonth(date.getMonth(), date.getDate());
      if(date.getDay() == 0)
        date.setDate(date.getDate()-2);
      else if(date.getDay() == 6)
        date.setDate(date.getDate()-1);
    }

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
    request("https://www.alphavantage.co/query?function=BBANDS&symbol="+investment.stockticker+"&interval="+JSON.parse(investment.params).interval+"&time_period="+JSON.parse(investment.params).num_points+"&series_type=open&apikey=1GZ7BTPWCA1XM23V", function(error,response,body)
    {
      try
      {
        if(error) {
          throw "Error: BBands request has failed to generate any data."
        }
        // console.log(typeof JSON.parse(body)['Technical Analysis: BBANDS'][stringDate] == 'undefined')
        if (typeof JSON.parse(body)['Technical Analysis: BBANDS'][stringDate] == 'undefined')
        {
          throw "Error: Alphavantage BBands undefined for " + stringDate + " at " + investment.params
        }
      }
      catch(err)
      {
        console.log(err)
        return;
      }

      var upperBandValue = JSON.parse(body)['Technical Analysis: BBANDS'][stringDate]['Real Upper Band']; //this is the upper band
      var lowerBandValue = JSON.parse(body)['Technical Analysis: BBANDS'][stringDate]['Real Lower Band']; //this is the lower band
      resultMin(this.investment.stockticker, "01JXX13CGEF2C4TR").then(function(result) {
        var json = JSON.stringify(result[0]);
        if(json != undefined)
        {//--------------------------CONTINUE HERE-------------------------

        }//end if
      });
      request("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+this.investment.stockticker+"&interval=60min&apikey=01JXX13CGEF2C4TR", function(error,response,body2)
      {
        try
        {
          if(error) {
            throw "Error: Time Series has failed";
          }

          if (typeof JSON.parse(body2)['Time Series (60min)'][stringDate+' 16:00:00'] == 'undefined')
          {
            throw "Error: Time Series undefined for " + (stringDate+' 16:00:00')
          }

        }
        catch(err)
        {
          console.log(err)
          return;
        }

        var currentPrice = JSON.parse(body2)['Time Series (60min)'][stringDate+' 16:00:00']['1. open']; //this is the current price
        if(currentPrice>upperBandValue)
        {
          queries.getPhoneNumber(this.investment.email, function(query2) {
            queries.addNotification(this.investment.twiliobit ,query2.rows[0].phonenumber, this.investment.email,"User "+this.investment.email+" should sell "+this.investment.numstocks+" of "+this.investment.stockticker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*this.investment.numstocks+".",function(query3)
            {
            }.bind({investment: this.investment, currentPrice: currentPrice}));
          }.bind({investment: this.investment}));
        }
        else if(currentPrice<lowerBandValue)
        {
          queries.getPhoneNumber(this.investment.email, function(query2) {
            queries.addNotification(this.investment.twiliobit ,query2.rows[0].phonenumber, this.investment.email,"User "+this.investment.email+" should buy "+this.investment.stockticker+" at a price of "+currentPrice+" each.",function(query3)
            {
            }.bind({investment: this.investment, currentPrice: currentPrice}));
          }.bind({investment: this.investment}));
        }
        else
        {

        }
      }.bind({ investment: this.investment }));
    }.bind({ investment: investment }));
  }//end try
  catch(err)
  {
    console.log("hello")
    console.log(err);
    //Retry again in 10 seconds
    bbandsFail.push(setTimeout(function(k) {doBbands(k)}, 10*1000, investment));
  }
}

function doAVG(investment)
{
  try
  {
    var date = oneDay();//date form 2 days ago;
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

    request("https://www.alphavantage.co/query?function=SMA&symbol="+investment.stockticker+"&interval=daily&time_period=1"+parseInt(investment.params)+"&series_type=open&apikey=8BOE6CIGUGGJCA4F", function(error,response,body)
    {
      var movingAverageValue = JSON.parse(body)['Technical Analysis: SMA'][stringDate]['SMA']; //this is the moving average
      request("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="+this.investment.stockticker+"&interval=60min&apikey=OQN5AR8PLIEEUUQP", function(error,response,body2)
      {
        var currentPrice = JSON.parse(body2)['Time Series (60min)'][stringDate+' 16:00:00']['1. open']; //this is the current price
        if(currentPrice>movingAverageValue)
        {
          queries.getPhoneNumber(this.investment.email, function(query2) {
            queries.addNotification(this.investment.twiliobit ,query2.rows[0].phonenumber, this.investment.email,"User "+this.investment.email+" should sell "+this.investment.numstocks+" of "+this.investment.stockticker+" at a price of "+currentPrice+" each. This would make the investment worth $"+currentPrice*this.investment.numstocks+".",function(query3)
            {
            }.bind({investment: this.investment, currentPrice: currentPrice}));
          }.bind({investment: this.investment}));
        }
        else
        {
          queries.getPhoneNumber(this.investment.email, function(query2) {
            queries.addNotification(this.investment.twiliobit ,query2.rows[0].phonenumber, this.investment.email,"User "+this.investment.email+" should buy "+this.investment.stockticker+" at a price of "+currentPrice+" each.",function(query3)
            {
            }.bind({investment: this.investment, currentPrice: currentPrice}));
          }.bind({investment: this.investment}));
        }
      }.bind({ investment: this.investment }));
    }.bind({ investment: investment }));
  }//end try
  catch(err)
  {
    console.log(err);
    //Retry again in 10 seconds
    avgFail.push(setTimeout(function(k) {doAVG(k)}, 10*1000, investment));
  }
}

router.get('/run', function(req, res, next) {
  queries.getAllInvestments("RSI", async function(query)
  {
    for(var i=0;i<query.rows.length;i++)
    {
      await doRSI(query.rows[i]);
    }
  }).then(console.log("Finished RSI."));

  queries.getAllInvestments("BBands", async function(query)
  {
    for(var i=0;i<query.rows.length;i++) //for each investment
    {
      await doBbands(query.rows[i]);
    }
  }).then(console.log("Finished BBANDS."));

  queries.getAllInvestments("Moving Averages",async function(query) {
    for(var i=0;i<query.rows.length;i++) //for each investment
    {
      await doAVG(query.rows[i]);
    }
  }).then(console.log("Finished Moving Averages."));

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

  if(pass1!=pass2)
  {
    res.redirect('/splash',req);
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
      console.log(noteArry)
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

    res.render('accountsettings2');
  }
});

router.post('/updatePassword', async function(req, res, next) {
  var currentPassword = req['body']['currentPassword'];
  var newPassword = req['body']['newPassword'];
  var newPasswordConfirm = req['body']['newPasswordConfirm'];

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
