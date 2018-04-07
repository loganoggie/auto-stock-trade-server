//assume that stocks.js is included
//For local testing of the functions - these will be gone when the backend is ready to deal with it
var stocks = new Stocks('QSZQSTA7ZLPXTAZO');//AlphaVantage API Key
var tempStocks = ['GOOG', 'TSLA', 'AAPL', 'BA', 'AMD', 'BAC']
var algor = ['beta', 'beta', 'beta', 'beta', 'beta', 'beta']
var stat = ['active', 'active', 'active', 'active', 'active', 'active']
var volumes = [40, 80, 20, 32, 76, 135]//Volumes of stocks

//var ALGORITHM_NAME = ['RSI', 'BETA', 'Moving Averages']//Names of all the algorithms

//LOOKUP stuff

//Modal stuff

$.ajax({//Get investments from server
  url: '/investments-get',
  dataType: 'json',
  success: function(data) {
    var json = $.parseJSON(data);
    console.log(json);
    stocks = new Stocks(json.api);//use the API that the node server provides.
    createAllInvestments(json.symbols, json.volumes, json.algorithms, json.status);//create all the tickers for the page once an object is recieved
  },//end success
  error: function(data) {
    console.log('Error in AJAX responce');
  }//end error
});

//-------------------------------getText NAMESPACE-------------------------------
var getText = {
  nasdaq:  function() {
    $.get('text/nasdaqlisted.txt', function(data) {//map the first list
      var text = data.split('\n');
      myModal.injectText(text);
    }, 'text');
  },

  other: function() {
    $.get('text/otherlisted.txt', function(data) {//map the second list
      var text = data.split('\n');
      myModal.injectText(text);
    }, 'text');
  }//end other
}//end getText namespace
//-------------------------------END getText NAMESPACE-------------------------------


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function resultMin(tickerID) {//
  var result = await stocks.timeSeries({//Result is an array, and is indexable. contents is JSON
    symbol: tickerID,
    interval: '1min',
    amount: 1
   });

   return result
}

//-------------------------------MODAL NAMESPACE-------------------------------
var myModal = {
  lookupBox: document.getElementsByName('lookup')[0],
  symbols: [[],[]],
  ALGORITHM_NAME: ['RSI', 'BETA', 'Moving Averages'],

  modal: document.getElementById('modal'),
  bttn: document.getElementById('add'),//The Add Button
  volumeBox: document.getElementsByName('volume')[0],
  close: document.getElementsByClassName('close')[0],
  select: document.getElementsByName('algorithm')[0],

  injectText: function(data) {
    for(i = 1; i < data.length; i++) {
      this.symbols[0].push(String(data[i].split('|')[0]));//get company symbol
      this.symbols[1].push(String(String(data[i].split('|')[1]).split('-')[0]));//get company name
    }//end for
  },//end injectText

  isSubString: function(s1, s2) {
    s1 = s1.toString().toLowerCase();//change to lowercase
    s2 = s2.toString().toLowerCase();
    var length = s1.length;
    if(s1 == s2.substring(0, length)){return true}//match the first few chars
    return false;
  },//end if

  get: function(index) {
    document.getElementsByName('symbol')[0].value = this.symbols[0][index]
    this.volumeBox.value = '';//reset value
    this.volumeOnChange();
  },

  showModal: function() {
    this.modal.style.display = 'block';
  },

  hideModal: function() {
    this.modal.style.display = 'none';
  },

  algorithmOnChange: function() {
    var params = document.getElementById('params')
    params.innerHTML = ''//Reset it back to blank
    if(this.select.value != 'default') {
      //example showing that we can dynamically generate forms to use. Needs to discuss a formatting
      if(this.select.value == this.ALGORITHM_NAME[0]) {//RSI
        params.innerHTML += '<input type=\'radio\' name=\'rsi\' value=\'low\'>' + 'Low Risk';
        params.innerHTML += '<input type=\'radio\' name=\'rsi\' value=\'med\'>' + 'Medium Risk';
        params.innerHTML += '<input type=\'radio\' name=\'rsi\' value=\'high\'>' + 'High Risk';
      }//end if
      if(this.select.value == this.ALGORITHM_NAME[1]) {//BETA
        params.innerHTML += '<input type=\'radio\' name=\'beta\' value=\'low\'>' + 'Low Risk';
        params.innerHTML += '<input type=\'radio\' name=\'beta\' value=\'med\'>' + 'Medium Risk';
        params.innerHTML += '<input type=\'radio\' name=\'beta\' value=\'high\'>' + 'High Risk';
      }//end if
      if(this.select.value == this.ALGORITHM_NAME[2]) {
        params.innerHTML += '<input type=\'number\', \'name=\'days\', placeholder=\'Number of Days\'>'
      }//end if
    }//end if
  },

  lookupOnInput: function() {//dynamically create span to click on
    const OUTPUT_MAX = 10;
    var div = document.getElementById('results')
    div.innerHTML = ''
    var counter = 0;
    if(this.lookupBox.value != '') {
      for(i = 0; i < this.symbols[0].length; i++) {//I just need one of the two for this
        if(this.isSubString(this.lookupBox.value, this.symbols[1][i]) && counter <= OUTPUT_MAX) {
          counter++;
          div.innerHTML += '<span id=' + i + ' class=\'optn\' onclick=\'myModal.get(' + i + ')\'>' + this.symbols[0][i] + ' - ' + this.symbols[1][i] + '</span></br>';
        }//end if
      }//end for
    }//end i
  },//end lookup on input

  volumeOnChange: function() {//calculate the amount of money used for buying z amount of stock
    var symbol = document.getElementsByName('symbol')[0].value
    if(symbol != '' && this.volumeBox.value != '') {
      document.getElementById('priceConversion').innerHTML = 'Calculating Price...';
      resultMin(symbol).then(async function(valueMin) {
        try {
          var jsonToday = JSON.stringify(valueMin[0])
          if(jsonToday != undefined) {
            var today = JSON.parse(jsonToday)
            document.getElementById('priceConversion').innerHTML = (Number(myModal.volumeBox.value)*Number(today.close)).toFixed(2)//calc money spent
            //We are no longer in the scope of the modal, so we must use the moda object name
          }//end if
          else {
            throw "Json is undefined";
          }//end else
        }//end catch
        catch(err) {
          console.log(err);//Do proper error handeling later
        }//end catch
      });
    }//end if
    else {
      document.getElementById('priceConversion').innerHTML = ''
    }
  },

  checkParams: function() {
    var params = document.getElementById('params')
    var children = params.childNodes;
    if(select.value == this.ALGORITHM_NAME[0]) {//RSI is selected
      if(!children[0].checked && !children[1].checked && !children[2].checked){return false}//If none of the radioboxes are checked, then dont submit
    }
    if(select.value == this.ALGORITHM_NAME[1]) {//Beta is selected
      if(!children[0].checked && !children[1].checked && !children[2].checked){return false}//If none of the radioboxes are checked, then dont submit
    }
    if(select.value == this.ALGORITHM_NAME[2]) {//Moving Averages is selected
      if(children[0].value == '' || children[0].value <= 0){return false}//if the days field is blank and a positive
    }
    return true;//no errors encountered
  },//end checkParams function

  modalAlgorithms: function(algorithms) {
    for(i = 0; i < algorithms.length; i++) {
      //create the algorithms in the file
      this.select.innerHTML += '<option value=\'' + algorithms[i] + '\'>' + algorithms[i];
    }//end for
  },//end modalAlgorithms

  initializeAlgorithms: function() {
    this.modalAlgorithms(this.ALGORITHM_NAME);
  }//end initlaization
}//end modal Namespace
//-------------------------------END MODAL NAMESPACE-------------------------------


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

$('#modalForm').submit(function() {
  if(modal.select.value == "default") {
    //dont submit if they havent selected an algorithm
    console.log("They didn't select an algorithm");
    alert('Please select a valid algorithm.');
    return false;
  }
  if(modal.volumeBox.value <= 0) {
    console.log("They had a non-positive integer")
    alert("Volume field must be a positive integer")
    return false
  }
  if(document.getElementsByName('symbol')[0].value == '') {
    console.log("They did not choose a stock")
    alert("Please choose a  vaiuld stock option")
    return false;
  }
  if(!modal.checkParams()) {
    console.log("Parameters are not valid")
    alert("Please enter valid parameters!")
    return false;
  }
  return true;
});

function loaded(symbols) {//sees if all the symbols are loaded on the page
  setInterval(function (symbols) {
    var investments = document.getElementsByClassName('invest-holder')
    if(investments.length == symbols.length) {
      document.getElementById('load').innerHTML = ''
    }//all loaded
  }, 1000, symbols);
}//end function loaded

$('document').ready( function() {
  getText.nasdaq();
  getText.other();
});

//modalAlgorithms(ALGORITHM_NAME);//FEED MODAL ALGORITHMS
myModal.initializeAlgorithms();
createAllInvestments(tempStocks, volumes, algor, stat)//GENRATE ALL TEMP STOCK DATA
loaded(tempStocks)
