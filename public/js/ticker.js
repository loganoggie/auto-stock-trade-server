//assume that stocks.js is included
//responce tome of AlphaVantage is slow
//var stocks = new Stocks('QSZQSTA7ZLPXTAZO');//AlphaVantage API Key
//var tempStocks = ['GOOG', 'TSLA', 'AAPL', 'BA', 'AMD', 'BAC']
var stocks;

$.ajax({//Get tickers from server
  url: '/tick-get',
  dataType: 'json',
  success: function(data) {
    var json = $.parseJSON(data);
    console.log(json);
    stocks = new Stocks(json.api)//use the API that the node server provides.
    createAllTickers(json.symbols);//create all the tickers for the page once an object is recieved
  },//end success
  error: function(data) {
    console.log('Error in AJAX responce')
  }//end error
})

async function resultDaily(symbol) {//fucntion top call when the market is closed!
  numAmount = 2
  var result = await stocks.timeSeries({//Result is an array, and is indexable. contents is JSON
    symbol: symbol,
    interval: 'daily',
    amount: numAmount
   });

   return result
}

async function resultMin(symbol) {//fucntion top call when the market is closed!
  var result = await stocks.timeSeries({//Result is an array, and is indexable. contents is JSON
    symbol: symbol,
    interval: '1min',
    amount: 1
   });
   return result
}


function genTicker(symbol, tickerNum, data, _callback) {//Generate if market is open
    resultDaily(symbol).then(function(valueDaily) {
      resultMin(symbol).then(function(valueOpen) {
        try {
          var jsonToday = JSON.stringify(valueOpen[0])
          var jsonDaily = JSON.stringify(valueDaily[1])
          if(jsonToday != undefined && jsonDaily != undefined) {
            var today = JSON.parse(JSON.stringify(valueOpen[0]))
            var yesterday = JSON.parse(JSON.stringify(valueDaily[1]))
            var myObj = {
              symbol: symbol,
              tickerNum: tickerNum,
              curPrice: today.close,
              lastClose: yesterday.close
            };
            _callback(data, myObj)
          }
        else {
          throw "Generation Failed, jsons are undefined"
        }
      }
      catch(err) {
        document.getElementById('warn').innerHTML = "An Error has occured, attemping to fix.</br>"
        console.log("Error: Ticker " + symbol + " has failed to generate!")
        console.log("Retrying in 10 seconds")
        console.log(err)
        setTimeout(genTicker.bind(null, symbol, tickerNum, data, _callback), 10*1000)
      }
    });
  });
}

function updateTicker(tickerNum) {
  try {
    var symbol = document.getElementById('symbol-' + tickerNum).innerHTML;
    resultDaily(symbol).then(function(valueDaily) {
      resultMin(symbol).then(function(valueOpen) {
        var jsonToday = JSON.stringify(valueOpen[0])
        var jsonDaily = JSON.stringify(valueDaily[1])
        if(jsonToday != undefined && jsonDaily != undefined) {
          var today = JSON.parse(jsonToday)
          var yesterday = JSON.parse(jsonDaily)
          var deltaPoints = (Number(today.close)-Number(yesterday.close)).toFixed(2)
          var deltaPercent = ((Number(deltaPoints)/Number(yesterday.close))*100).toFixed(2)//percent
          document.getElementById('price-' + tickerNum).innerHTML = '$' + Number(today.close).toFixed(2)
          document.getElementById('points-' + tickerNum).innerHTML = deltaPoints
          document.getElementById('percent-' + tickerNum).innerHTML = '('+deltaPercent+'%)'
          console.log('Ticker ' + symbol + ' has updated')
        }//end if
        else {
          throw "Update Failed, jsons are undefined"
        }//end else
      });
    });
  }
  catch(err) {//the ticker has not generated yet
    console.log('Error: Ticker with number: ' + tickerNum + ' has encounted an error')
  }
}

function writeToPage(data) {
  document.getElementById('load').innerHTML = ''
  document.getElementById('warn').innerHTML = ''
  var tickersHolder = document.getElementById('tick')
  for(i = 0; i < data.length; i++) {
     tickersHolder.innerHTML += '<div id=' + data[i].tickerNum + '>'
     var tickerLoc = document.getElementById(data[i].tickerNum)
     var deltaPoints = (Number(data[i].curPrice)-Number(data[i].lastClose)).toFixed(2)//round to 2 decimal places
     var deltaPercent = ((Number(deltaPoints)/Number(data[i].lastClose))*100).toFixed(2)//percent
     tickerLoc.innerHTML += '<span id=\'symbol-' + data[i].tickerNum + '\' class=\'symbol\'>' + data[i].symbol + '</span></br>'
     tickerLoc.innerHTML += '<span id=\'price-' + data[i].tickerNum + '\' class=\'price\'>$' + data[i].curPrice + '</span></br>'
     tickerLoc.innerHTML += '<span id=\'points-' + data[i].tickerNum + '\' class=\'change\'>' + deltaPoints + '</span></br>'
     tickerLoc.innerHTML += '<span id=\'percent-' + data[i].tickerNum + '\' class=\'change\'>(' + deltaPercent + '%)</span></br>'
  }//end for
}

function createAllTickers(symbols) {//this creates all the tickers for the page.
  data = []
  for(i = 0, ln = symbols.length; i < ln; i++) {//Go through the stock ticker array
    try {
      genTicker(symbols[i], i, data, function(data, obj) {
        data.push(obj)
        if(data.length == symbols.length) {
          data.sort(function(a, b) {//Sort in descending order, by current stock price
            return b.curPrice-a.curPrice
          });
          writeToPage(data);
        }//end if
      });
    }
    catch(err) {
      console.log(err)
    }
    setInterval(function(k){updateTicker(k)}, 60*1000, i)//Anon function needs snapshot of value to setInterval correctly
  }
}
