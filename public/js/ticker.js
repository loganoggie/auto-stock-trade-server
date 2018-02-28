//assume that stocks.js is included
//responce tome of AlphaVantage is slow, sicne we're not paying for anything. 
var stocks = new Stocks('QSZQSTA7ZLPXTAZO');//AlphaVantage API Key
var tempStocks = ['GOOG', 'TSLA', 'AAPL', 'BA', 'AMD', 'BAC']

async function resultDaily(tickerID) {//fucntion top call when the market is closed!
  numAmount = 2
  var result = await stocks.timeSeries({//Result is an array, and is indexable. contents is JSON
    symbol: tickerID,
    interval: 'daily',
    amount: numAmount
   });

   return result
}

async function resultMin(tickerID) {//fucntion top call when the market is closed!
  var result = await stocks.timeSeries({//Result is an array, and is indexable. contents is JSON
    symbol: tickerID,
    interval: '1min',
    amount: 1
   });
   return result
}



/*function genTickerClosed(tickerID, tickerNum) {//generate is market is closed, wont need to be updated constantly
  resultDaily(tickerID).then(function(value){
    var today = JSON.parse(JSON.stringify(value[0]));
    var yesterday = JSON.parse(JSON.stringify(value[1]));
    var tickerLoc = document.getElementById('tick')
    tickerLoc.innerHTML += '<div id=' + tickerNum + '>'
    tickerLoc.innerHTML += '<span class=\'symbol\'>' + tickerID + '</span></br>'
    tickerLoc.innerHTML += '<span class=\'price\'>' + today.close + '</span></br>'
    var deltaPoints = (Number(today.close)-Number(yesterday.close)).toFixed(2)//round to 2 decimal places
    tickerLoc.innerHTML += '<span class=\'change\'>' + deltaPoints + '</span></br>'
    var deltaPercent = ((Number(deltaPoints)/Number(yesterday.close))*100).toFixed(2)//percent
    tickerLoc.innerHTML += '<span class=\'change\'>(' + deltaPercent + '%)</span></br>'
  })
}*/

function genTicker(tickerID, tickerNum) {//Generate if market is open
    resultDaily(tickerID).then(function(valueDaily) {
      resultMin(tickerID).then(function(valueOpen) {
        try {
          var jsonToday = JSON.stringify(valueOpen[0])
          var jsonDaily = JSON.stringify(valueDaily[1])
          if(jsonToday != undefined && jsonDaily != undefined) {
            var today = JSON.parse(JSON.stringify(valueOpen[0]))
            var yesterday = JSON.parse(JSON.stringify(valueDaily[1]))
            var tickersHolder = document.getElementById('tick')
            tickersHolder.innerHTML += '<div id=' + tickerNum + '>'
            var tickerLoc = document.getElementById(tickerNum)
            tickerLoc.innerHTML += '<span id=\'symbol-' + tickerNum + '\' class=\'symbol\'>' + tickerID + '</span></br>'
            tickerLoc.innerHTML += '<span id=\'price-' + tickerNum + '\' class=\'price\'>' + Number(today.close).toFixed(2) + '</span></br>'
            var deltaPoints = (Number(today.close)-Number(yesterday.close)).toFixed(2)//round to 2 decimal places
            tickerLoc.innerHTML += '<span id=\'points-' + tickerNum + '\' class=\'change\'>' + deltaPoints + '</span></br>'
            var deltaPercent = ((Number(deltaPoints)/Number(yesterday.close))*100).toFixed(2)//percent
            tickerLoc.innerHTML += '<span id=\'percent-' + tickerNum + '\' class=\'change\'>(' + deltaPercent + '%)</span></br>'
          }
        else {
          throw "Generation Failed, jsons are undefined"
        }
      }
      catch(err) {
        console.log("Error: Ticker " + tickerID + " has failed to generate!")
        console.log("Retrying in a 30 seconds")
        setTimeout(genTicker.bind(null, tickerID, tickerNum), 30*1000)
      }
    })
  })
}

function updateTicker(tickerNum) {
  try {
    var tickerID = document.getElementById('symbol-' + tickerNum).innerHTML;
    resultDaily(tickerID).then(function(valueDaily) {
      resultMin(tickerID).then(function(valueOpen) {
        var today = JSON.parse(JSON.stringify(valueOpen[0]))
        var yesterday = JSON.parse(JSON.stringify(valueDaily[1]))
        document.getElementById('price-' + tickerNum).innerHTML = Number(today.close).toFixed(2)
        var deltaPoints = (Number(today.close)-Number(yesterday.close)).toFixed(2)
        document.getElementById('points-' + tickerNum).innerHTML = deltaPoints
        var deltaPercent = ((Number(deltaPoints)/Number(yesterday.close))*100).toFixed(2)//percent
        document.getElementById('percent-' + tickerNum).innerHTML = '('+deltaPercent+'%)'
        console.log('Ticker ' + tickerID + ' has updated')
      })
    })
  }
  catch(err) {//the ticker has not generated yet
    console.log('Error: Ticker with number: ' + tickerNum + ' has encounted an error')
  }
}

/*function createTicker(tickerID, tickerNum) { //I can't get this to work properly
  genTicker(tickerID, 1)
  setTimeout(() => setInterval(function(){updateTicker(tickerNum)}, 60*1000), 60*1000)
}*/

//The following works for updating

for(i = 0, ln = tempStocks.length; i < ln; i++) {//Go through the stock ticker array
  try {
    genTicker(tempStocks[i], i)
  }
  catch(err) {
    console.log(err)
  }
  setInterval(function(k){updateTicker(k)}, 60*1000, i)//Anon function needs snapshot of value to setInterval correctly
}


/*createTicker('GOOG', 1)
createTicker('TSLA', 2)
createTicker('AAPL', 3)*/
