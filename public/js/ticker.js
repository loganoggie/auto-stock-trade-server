//assume that stocks.js is included
//responce tome of AlphaVantage is slow
//var stocks = new Stocks('QSZQSTA7ZLPXTAZO');//AlphaVantage API Key
//var tempStocks = ['GOOG', 'TSLA', 'AAPL', 'BA', 'AMD', 'BAC']
var stocks;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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
  try {
    var result = await stocks.timeSeries({//Result is an array, and is indexable. contents is JSON
      symbol: symbol,
      interval: 'daily',
      amount: numAmount
     });

     return result
  }//end try
  catch(err) {
    console.log(err)
  }//end catch
}

async function resultMin(symbol) {//fucntion top call when the market is closed!
  try {
    var result = await stocks.timeSeries({//Result is an array, and is indexable. contents is JSON
      symbol: symbol,
      interval: '1min',
      amount: 1
     });
     return result
  }
  catch(err) {
    console.log(err)
  }
}


async function genTicker(symbol, tickerNum) {//Generate if market is open
    resultDaily(symbol).then(async function(valueDaily) {
      await sleep(1*1000);
      resultMin(symbol).then(async function(valueOpen) {
        try {
          var jsonToday = JSON.stringify(valueOpen[0])
          var jsonDaily = JSON.stringify(valueDaily[1])
          if(jsonToday != undefined && jsonDaily != undefined) {
            var today = JSON.parse(JSON.stringify(valueOpen[0]))
            var yesterday = JSON.parse(JSON.stringify(valueDaily[1]))
            var tickersHolder = document.getElementById('tick')
            var deltaPoints = (Number(today.close)-Number(yesterday.close)).toFixed(2)//round to 2 decimal places
            var deltaPercent = ((Number(deltaPoints)/Number(yesterday.close))*100).toFixed(2)//percent
            tickersHolder.innerHTML += '<div class=\'ticker\' id=' + tickerNum + '>'
            var tickerLoc = document.getElementById(tickerNum)
            tickerLoc.innerHTML += '<span id=\'symbol-' + tickerNum + '\' class=\'symbol\'>' + symbol + '</span></br>'
            tickerLoc.innerHTML += '<span id=\'price-' + tickerNum + '\' class=\'price\'>' + Number(today.close).toFixed(2) + '</span></br>'
            tickerLoc.innerHTML += '<span id=\'points-' + tickerNum + '\' class=\'change\'>' + deltaPoints + '</span></br>'
            tickerLoc.innerHTML += '<span id=\'percent-' + tickerNum + '\' class=\'change\'>(' + deltaPercent + '%)</span></br>'
            await sleep(1000)
            sortTickers()
          }
        else {
          throw "Generation Failed, jsons are undefined"
        }
      }
      catch(err) {
        console.log("Error: Ticker " + symbol + " has failed to generate!")
        console.log("Retrying in 30 seconds")
        console.log(err)
        setTimeout(genTicker.bind(null, symbol, tickerNum), 30*1000)
      }
    });
  });
}

async function updateTicker(tickerNum) {
  try {
    var symbol = document.getElementById('symbol-' + tickerNum).innerHTML;
    resultDaily(symbol).then(async function(valueDaily) {
      await sleep(1*1000)
      resultMin(symbol).then(async function(valueOpen) {
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
          await sleep(1000)
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

function sortTickers() {
  var tickersClone = []
  var tickersHolder = document.getElementById('tick');
  var tickers = document.getElementsByClassName('ticker');//get an array of all the tickers
  var numTickers = tickers.length;

  for(i = 0; i < numTickers; i++) {
    tickersClone.push(tickers[i].cloneNode(true))
  }//end for

  tickersClone.sort(function(a, b) {
    var aPrice = document.getElementById('price-' + a.id)
    var bPrice = document.getElementById('price-' + b.id)
    return Number(bPrice.innerHTML)-Number(aPrice.innerHTML)
  });

  tickersHolder.innerHTML = ''
  document.getElementById('load').innerHTML = ''
  for(i = 0; i < numTickers; i++) {
    tickersClone[i].style.display = 'inline'//finally show the tickers
    tickersHolder.appendChild(tickersClone[i])
  }

}//end function sort Tickers

async function createAllTickers(symbols) {//this creates all the tickers for the page.
  for(i = 0, ln = symbols.length; i < ln; i++) {//Go through the stock ticker array
    try {
      await genTicker(symbols[i], i)
    }
    catch(err) {
      console.log(err)
    }
    setInterval(function(k){updateTicker(k)}, 60*1000, i)//Anon function needs snapshot of value to setInterval correctly
  }
}
