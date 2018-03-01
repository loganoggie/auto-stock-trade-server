//assume that stocks.js is included
var stocks = new Stocks('QSZQSTA7ZLPXTAZO');//AlphaVantage API Key
var tempStocks = ['GOOG', 'TSLA', 'AAPL', 'BA', 'AMD', 'BAC']
var volumes = [40, 80, 20, 32, 76, 135]//Values of stocks

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

function generateInvestment(tickerID, tickerNum, volume) {
  try {
    resultDaily(tickerID).then(function(valueDaily) {
      resultMin(tickerID).then(function(valueMin) {
        var testOne = JSON.stringify(valueMin[0]);
        var testTwo = JSON.stringify(valueDaily[1]);
        var today = JSON.parse(testOne)
        var yesterday = JSON.parse(testTwo)
        var investHolder = document.getElementById('invest')
        investHolder.innerHTML += '<div id=' + tickerNum + '>'
        var investLoc = document.getElementById(tickerNum)
        var share = (Number(today.close)*volume).toFixed(2)
        var deltaPoints = (Number(today.close)-Number(yesterday.close)).toFixed(2)//round to 2 decimal places
        var deltaPercent = ((Number(deltaPoints)/Number(yesterday.close))*100).toFixed(2)//percent
        investLoc.innerHTML += '<span id=\'symbol-' + tickerNum + '\' class=\'symbol\'>' + tickerID + '</span></br>'
        investLoc.innerHTML += '<span id=\'share-' + tickerNum + '\' class=\'share\'>$' + share +'</span></br>'
        investLoc.innerHTML += '<span id=\'price-' + tickerNum + '\' class=\'price\'>' + Number(today.close).toFixed(2) + '</span></br>'
        investLoc.innerHTML += '<span id=\'points-' + tickerNum + '\' class=\'change\'>' + deltaPoints + '</span></br>'
        investLoc.innerHTML += '<span id=\'percent-' + tickerNum + '\' class=\'change\'>(' + deltaPercent + '%)</span></br>'
      })
    })
  }
  catch(err) {
    console.log("Error: Investment with symbol with " + tickerID + " has failed to generate!")
  }
}

for(i = 0, ln = tempStocks.length; i < ln; i++) {
  generateInvestment(tempStocks[i], i, volumes[i])
}
