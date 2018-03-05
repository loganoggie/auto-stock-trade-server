//assume that stocks.js is included
//For local testing of the functions - these will be gone when the backend is ready to deal with it
var stocks = new Stocks('QSZQSTA7ZLPXTAZO');//AlphaVantage API Key
var tempStocks = ['GOOG', 'TSLA', 'AAPL', 'BA', 'AMD', 'BAC']
var algor = ['beta', 'beta', 'beta', 'beta', 'beta', 'beta']
var stat = ['active', 'active', 'active', 'active', 'active', 'active']
var volumes = [40, 80, 20, 32, 76, 135]//Volumes of stocks

$.ajax({//Get investments from server
  url: '/investments-get',
  dataType: 'json',
  success: function(data) {
    var json = $.parseJSON(data);
    console.log(json);
    stocks = new Stocks(json.api)//use the API that the node server provides.
    createAllInvestments(json.symbols, json.volumes, json.algorithms, json.status);//create all the tickers for the page once an object is recieved
  },//end success
  error: function(data) {
    console.log('Error in AJAX responce')
  }//end error
})

async function resultMin(tickerID) {//fucntion top call when the market is closed!
  var result = await stocks.timeSeries({//Result is an array, and is indexable. contents is JSON
    symbol: tickerID,
    interval: '1min',
    amount: 1
   });

   return result
}

async function generateInvestment(symbol, investNum, volume, algorithm, status, data, _callback) {
  try {
      resultMin(symbol).then(function(valueMin) {
        var jsonToday = JSON.stringify(valueMin[0])
        if(jsonToday != undefined) {
          var today = JSON.parse(jsonToday)
          var myObj = {
            investNum: investNum,
            symbol: symbol,
            algorithm: algorithm,
            status: status,
            volume: volume,
            price: today.close
          };
          _callback(data, myObj)
        }//end if
        else {
          throw "Generation Failed, json are undefined"
        }
    })
  }
  catch(err) {
    console.log("Error: Investment with symbol with " + investNum + " has failed to generate!")
    console.log("Retrying in 30 seconds")
    setTimeout(generateInvestment.bind(null, symbol, investNum, volume, algorithm, status, data, _callback), 30*1000)
  }
}


function writeToPage(data) {
  document.getElementById('load').innerHTML = ''//Take Away the loading data
  var investHolder = document.getElementById('invest')
  for(i = 0; i < data.length; i++) {
    investHolder.innerHTML += '<div class=\'invest-holder\' id=' + data[i].investNum + '>'
    var investLoc = document.getElementById(data[i].investNum)
    var share = (Number(data[i].price)*data[i].volume).toFixed(2)
    investLoc.innerHTML += '<span id=\'symbol-' + data[i].investNum + '\' class=\'symbol\'>' + data[i].symbol + '</span>'
    investLoc.innerHTML += '<span id=\'share-' + data[i].investNum + '\' class=\'share\'>$' + share +'</span>  '
    investLoc.innerHTML += '<span id=\'volume-' + data[i].investNum + '\' class=\'volume\'>' + data[i].volume +'</span>'
    investLoc.innerHTML += '<span id=\'price-' + data[i].investNum + '\' class=\'price\'>$' + data[i].price +'</span>'
    investLoc.innerHTML += '<span id=\'algorithm-' + data[i].investNum + '\' class=\'algorithm\'>' + data[i].algorithm +'</span>'
    investLoc.innerHTML += '<span id=\'status-' + data[i].investNum + '\' class=\'status\'>' + data[i].status +'</span>'
  }
}//end writeToPage

function createAllInvestments(symbols, volumes, algorithms, status) {

  data = []
  for(i = 0; i < symbols.length; i++) {
    generateInvestment(symbols[i], i, volumes[i], algorithms[i], status[i], data, function(data, obj) {
      data.push(obj)
      if(data.length == symbols.length) {
        data.sort(function(a, b) {//sort based off symbol
          if(a.symbol < b.symbol){return -1};
          if(a.symbol > b.symbol){return 1};
          return 0;
        });
        writeToPage(data)//finally write all the data to the page
      }//end if
    });
  }//end for
}//end function createAllInvestments

createAllInvestments(tempStocks, volumes, algor, stat)
