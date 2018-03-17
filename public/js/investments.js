//assume that stocks.js is included
//For local testing of the functions - these will be gone when the backend is ready to deal with it
var stocks = new Stocks('QSZQSTA7ZLPXTAZO');//AlphaVantage API Key
var tempStocks = ['GOOG', 'TSLA', 'AAPL', 'BA', 'AMD', 'BAC']
var algor = ['beta', 'beta', 'beta', 'beta', 'beta', 'beta']
var stat = ['active', 'active', 'active', 'active', 'active', 'active']
var volumes = [40, 80, 20, 32, 76, 135]//Volumes of stocks

var ALGORITHM_NAME = ['RSI', 'BETA', 'Moving Averages']

//LOOKUP stuff
var lookupBox = document.getElementsByName('lookup')[0]
var symbols =[[],[]];
//const OUTPUT_MAX = 10;

//Modal stuff
var modal = document.getElementById('myModal')
var bttn = document.getElementById('add')
var volumeBox = document.getElementsByName('volume')[0]
var close = document.getElementsByClassName('close')[0]
var select = document.getElementsByName('algorithm')[0]

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

$.get('text/nasdaqlisted.txt', function(data) {//map the fiirst list
  var text = data.split('\n')
  injectText(text)
}, 'text');

$.get('text/otherlisted.txt', function(data) {//map the second list
  var text = data.split('\n')
  injectText(text)
}, 'text');

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

function injectText(data) {//map a data set
  //var symbol = [];
  //var companies = [];
  for(i = 1; i < data.length; i++) {
    symbols[0].push(String(data[i].split('|')[0]));//get company symbol
    symbols[1].push(String(String(data[i].split('|')[1]).split('-')[0]));//get company name
  }
}

function isSubString(s1, s2) {//see if we have any matches
  s1 = s1.toString().toLowerCase();//change to lowercase
  s2 = s2.toString().toLowerCase();
  var length = s1.length;
  if(s1 == s2.substring(0, length)){return true}//match the first few chars
  return false;
}//end is SubString

function get(index) {
  document.getElementsByName('symbol')[0].value = symbols[0][index]
  volumeBox.value = '';//reset value
  volumeOnChange();
}//end get

async function generateInvestment(symbol, investNum, volume, algorithm, status) {
      resultMin(symbol).then(async function(valueMin) {
        try {
          var jsonToday = JSON.stringify(valueMin[0])
          if(jsonToday != undefined) {
            var today = JSON.parse(jsonToday)
            var investHolder = document.getElementById('investments')
            var price = Number(today.close).toFixed(2)
            var share = (price*volume).toFixed(2)
            //Display an investment
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
      console.log("Error: Investment with symbol with " + symbol + " has failed to generate!")
      console.log("Retrying in 30 seconds")
      setTimeout(generateInvestment.bind(null, symbol, investNum, volume, algorithm, status, 30*1000))
    }
  });
}//end generateInvestment

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

}//end sortInvetments

async function createAllInvestments(symbols, volumes, algorithms, status) {
  for(i = 0; i < symbols.length; i++) {
    generateInvestment(symbols[i], i ,volumes[i], algorithms[i], status[i])
  }//end for
}//end function createAllInvestments


bttn.onclick = function() {//show modal
  modal.style.display = 'block';
}//end on click

close.onclick = function() {//close modal
  modal.style.display = 'none';
}//end on click

// close modal whgen clicked outside
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}//end on click

select.onchange = function() {
  var params = document.getElementById('params')
  params.innerHTML = ''//Reset it back to blank
  if(select.value != 'default') {
    //example showing that we can dynamically generate forms to use. Needs to discuss a formatting
    if(select.value == ALGORITHM_NAME[0]) {//RSI
      params.innerHTML += '<input type=\'radio\' name=\'low\' checked=\'checked\'>' + 'Low Risk';
      params.innerHTML += '<input type=\'radio\' name=\'med\'>' + 'Medium Risk';
      params.innerHTML += '<input type=\'radio\' name=\'low\'>' + 'High Risk';
    }//end if
    if(select.value == ALGORITHM_NAME[1]) {//BETA
      params.innerHTML += '<input type=\'radio\' name=\'low\' checked=\'checked\'>' + 'Low Risk';
      params.innerHTML += '<input type=\'radio\' name=\'med\'>' + 'Medium Risk';
      params.innerHTML += '<input type=\'radio\' name=\'low\'>' + 'High Risk';
    }//end if
    if(select.value == ALGORITHM_NAME[2]) {
      params.innerHTML += '<input type=\'text\', \'name=\'days\', placeholder=\'Number of Days\'>'
    }//end if
  }//end if
}//end onchange

lookupBox.oninput = function() {
  const OUTPUT_MAX = 10;
  var div = document.getElementById('results')
  div.innerHTML = ''
  var counter = 0;
  if(lookupBox.value != '') {
    for(i = 0; i < symbols[0].length; i++) {//I just need one of the two for this
      if(isSubString(lookupBox.value, symbols[1][i]) && counter <= OUTPUT_MAX) {
        counter++;
        div.innerHTML += '<span id=' + i + ' class=\'optn\' onclick=\'get(' + i + ')\'>' + symbols[0][i] + ' - ' + symbols[1][i] + '</span></br>';
      }//end if
    }//end for
  }//end if
}//end oninput

function volumeOnChange() {
  var symbol = document.getElementsByName('symbol')[0].value
  if(symbol != '' && volumeBox.value != '') {
    document.getElementById('priceConversion').innerHTML = 'Calculating Price...'
    resultMin(symbol).then(async function(valueMin) {
      try {
        var jsonToday = JSON.stringify(valueMin[0])
        if(jsonToday != undefined) {
          var today = JSON.parse(jsonToday)
          document.getElementById('priceConversion').innerHTML = (Number(volumeBox.value)*Number(today.close)).toFixed(2)//calc money spent
        }//end if
        else {
          throw "Json is undefined"
        }//end else
      }//end catch
      catch(err) {
        console.log("Whoops");//Do proper error handeling later
      }//end catch
    });
  }//end if
  else {
    document.getElementById('priceConversion').innerHTML = ''
  }
}//end onchange




$('#modalForm').submit(function() {
  if(select.value == "default") {
    //dont submit if they havent selected an algorithm
    console.log("They didn't select an algorithm");
    alert('Please select a valid algorithm');
    return false;
  }
  return true;
});

function modalAlgorithms(algorithms) {
  for(i = 0; i < algorithms.length; i++) {
    //create the algorithms in the file
    select.innerHTML += '<option value=\'' + algorithms[i] + '\'>' + algorithms[i];
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

modalAlgorithms(ALGORITHM_NAME);//FEED MODAL ALGORITHMS
createAllInvestments(tempStocks, volumes, algor, stat)//GENRATE ALL TEMP STOCK DATA
loaded(tempStocks)
