//assume that stocks.js is included
var stocks = new Stocks('QSZQSTA7ZLPXTAZO');//AlphaVantage API Key

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
      var today = JSON.parse(JSON.stringify(valueOpen[0]));
      var yesterday = JSON.parse(JSON.stringify(valueDaily[1]));
      var tickerLoc = document.getElementById('tick')
      tickerLoc.innerHTML += '<div id=' + tickerNum + '>'
      tickerLoc.innerHTML += '<span class=\'symbol\'>' + tickerID + '</span></br>'
      tickerLoc.innerHTML += '<span class=\'price\'>' + today.close + '</span></br>'
      var deltaPoints = (Number(today.close)-Number(yesterday.close)).toFixed(2)//round to 2 decimal places
      tickerLoc.innerHTML += '<span class=\'change\'>' + deltaPoints + '</span></br>'
      var deltaPercent = ((Number(deltaPoints)/Number(yesterday.close))*100).toFixed(2)//percent
      tickerLoc.innerHTML += '<span class=\'change\'>(' + deltaPercent + '%)</span></br>'
    })
  })
}

genTicker('GOOG', 1)
genTicker('TSLA', 2)
genTicker('AAPL', 3)
