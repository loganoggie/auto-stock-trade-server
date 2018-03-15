//assume that stocks.js is included
//For local testing of the functions - these will be gone when the backend is ready to deal with it
var stocks = new Stocks('QSZQSTA7ZLPXTAZO');//AlphaVantage API Key
var tempStocks = ['GOOG', 'TSLA', 'AAPL', 'BA', 'AMD', 'BAC']
var algor = ['beta', 'beta', 'beta', 'beta', 'beta', 'beta']
var stat = ['active', 'active', 'active', 'active', 'active', 'active']
var volumes = [40, 80, 20, 32, 76, 135]//Volumes of stocks

//Modal stuff
var modal = document.getElementById('myModal')
var bttn = document.getElementById('add')
var close = document.getElementsByClassName('close')[0]
var select = document.getElementsByName('algorithm')[0]

//Temp stuff for the modal
var avaAlgor = ['RSI', 'WAVES', 'SOMEOTHERTHING']

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
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function resultMin(tickerID) {//fucntion top call when the market is closed!
  var result = await stocks.timeSeries({//Result is an array, and is indexable. contents is JSON
    symbol: tickerID,
    interval: '1min',
    amount: 1
   });

   return result
}

async function generateInvestment(symbol, investNum, volume, algorithm, status) {
      resultMin(symbol).then(async function(valueMin) {
        try {
          var jsonToday = JSON.stringify(valueMin[0])
          if(jsonToday != undefined) {
            var today = JSON.parse(jsonToday)
            var investHolder = document.getElementById('investments')
            var price = Number(today.close).toFixed(2)
            var share = (price*volume).toFixed(2)
            investHolder.innerHTML += '<div class=\'invest-holder\' id=' + investNum + '>'
            var investLoc = document.getElementById(investNum)
            investLoc.innerHTML += '<span id=\'symbol-' + investNum + '\' class=\'symbol\'>' + symbol + '</span>'
            investLoc.innerHTML += '<span id=\'share-' + investNum + '\' class=\'share\'>$' + share +'</span>  '
            investLoc.innerHTML += '<span id=\'volume-' + investNum + '\' class=\'volume\'>' + volume +'</span>'
            investLoc.innerHTML += '<span id=\'price-' + investNum + '\' class=\'price\'>$' + price +'</span>'
            investLoc.innerHTML += '<span id=\'algorithm-' + investNum + '\' class=\'algorithm\'>' + algorithm +'</span>'
            investLoc.innerHTML += '<span id=\'status-' + investNum + '\' class=\'status\'>' + status +'</span>'
            await sleep(1*1000)//let the API catch up
            sortInvestments()
          }//end if
          else {
            throw "Generation Failed, json are undefined"
          }
        }
        catch(err) {
          console.log("Error: Investment with symbol with " + investNum + " has failed to generate!")
          console.log("Retrying in 30 seconds")
          setTimeout(generateInvestment.bind(null, symbol, investNum, volume, algorithm, status, 30*1000))
        }
    });
  }

function sortInvestments() {
  var investClone = [];
  var investHolder = document.getElementById('investments');
  var investments = document.getElementsByClassName('invest-holder');//get array of all the investments
  var numInvest = investments.length;

  for(i = 0; i < numInvest; i++) {//sort investments
    investClone.push(investments[i].cloneNode(true));
  }//end for

  investClone.sort(function(a, b) {//sort investments by symbol alphabetical order
    var aSymbol = document.getElementById('symbol-' + a.id);
    var bSymbol = document.getElementById('symbol-' + b.id);
    if(aSymbol.innerHTML < bSymbol.innerHTML){return -1}
    if(aSymbol.innerHTML > bSymbol.innerHTML){return 1}
    return 0;
  });

  investHolder.innerHTML = ''
  for(i = 0; i < numInvest; i++) {
    investClone[i].style.display = 'block'
    investHolder.appendChild(investClone[i])
  }

}

async function createAllInvestments(symbols, volumes, algorithms, status) {
  for(i = 0; i < symbols.length; i++) {
    generateInvestment(symbols[i], i ,volumes[i], algorithms[i], status[i])
  }//end for
}//end function createAllInvestments

function constructParamForms(algorithms, params) {//future function that will constuct the data used for the parameters

}

bttn.onclick = function() {//show modal
  modal.style.display = 'block';
}

close.onclick = function() {//close modal
  modal.style.display = 'none';
}

// close modal whgen clicked outside
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

select.onchange = function() {
  var params = document.getElementById('params')
  params.innerHTML = ''//Reset it back to blank
  if(select.value != 'default') {
    //example showing that we can dynamically generate forms to use. Needs to discuss a formatting
    params.innerHTML += '<input type=\'radio\' name=\'example\'>' + avaAlgor[select.value];
  }
}

$('#modalForm').submit(function() {
  if(select.value == "default") {
    console.log("They didn't select an algorithm");
    alert('Please select a valid algorithm');
    return false;
  }
  return true;
});

function modalAlgorithms(algorithms) {
  for(i = 0; i < algorithms.length; i++) {
    select.innerHTML += '<option value=\'' + i + '\'>' + algorithms[i];
  }
}

function loaded(symbols) {//sees if all the symbols are loaded on the page
  setInterval(function (symbols) {
    var investments = document.getElementsByClassName('invest-holder')
    if(investments.length == symbols.length) {
      document.getElementById('load').innerHTML = ''
    }//all loaded
  }, 1000, symbols);
}//end function loaded

modalAlgorithms(avaAlgor);//FEED MODAL ALGORITHMS
createAllInvestments(tempStocks, volumes, algor, stat)//GENRATE ALL TEMP STOCK DATA
loaded(tempStocks)
