//assume that stocks.js is included
//responce tome of AlphaVantage is slow
//var stocks = new Stocks('QSZQSTA7ZLPXTAZO');//AlphaVantage API Key
var stocks;

const STARTING_INDEX = 0;//Starting index of the ticker printing
const TICKERS_ON_PAGE = 5;//number of tickers on a page

var namespace = {//namespace to hold allSymbols and indexTickers to avoid global variables
  //namespace vars
  allSymbols: new Array(),//array of ticker symbols
  activeIntervals: new Array(),//array of intervals that are updating tickers ever minute, stored in this so they can be cleared
  currentPage: 0,//pages start at zero

  createAllTickers: function() {
    for(i = 0; i < this.allSymbols.length; i++)
      generators.genTicker(this.allSymbols[i], i);
  },

  showStartTickers: function() {
    this.showTickers(this.allSymbols, 0);
  },

  setSymbols: function(symbols) {this.allSymbols = symbols},//set this array to the array of symbol fetched from backend
  nextTickers: function() {
    var totalPages = Math.ceil(this.allSymbols.length / TICKERS_ON_PAGE)-1;
    //var length = TICKERS_ON_PAGE;//default length
    var lastPageItems = this.allSymbols.length % TICKERS_ON_PAGE;
    this.currentPage++;
    if(this.currentPage > totalPages) {this.currentPage = 0;}
    //if(this.currentPage == totalPages) {length = lastPageItems == 0 ? 0 : lastPageItems}
    var index = this.currentPage*TICKERS_ON_PAGE;
    //generators.clearLoadInterval();
    //generators.loaded(length);
    //generators.clearTimeouts();//clear all timeouts of tickers that encountered errors
    this.clearOld();
    this.showTickers(this.allSymbols, index)
  },//end nextTickers

  prevTickers: function() {//goto previous page of tickers
    var totalPages = Math.ceil(this.allSymbols.length / TICKERS_ON_PAGE)-1;
    //var length = TICKERS_ON_PAGE;//default length
    var lastPageItems = this.allSymbols.length % TICKERS_ON_PAGE;
    this.currentPage--;
    if(this.currentPage < 0) {this.currentPage = totalPages}
    //if(this.currentPage == totalPages) {length = lastPageItems == 0 ? 0 : lastPageItems}
    var index = this.currentPage*TICKERS_ON_PAGE;
    //generators.clearLoadInterval();
    //generators.loaded(length);
    //generators.clearTimeouts();
    this.clearOld();
    this.showTickers(this.allSymbols, index)
  },//end prvTickers

  clearOld: function() {//clear all the old tickers off the page
    //document.getElementById('tick').innerHTML = ''//Set back to empty
    var tickers = document.getElementsByClassName('ticker');
    for(i = 0; i < this.allSymbols.length; i++)
      tickers[i].style.display = 'none';
    for(i = 0; i < this.activeIntervals.length; i++) {//stop updating for those old tickers
      clearInterval(this.activeIntervals[i]);
    }//end for
  },
  showTickers: async function(symbols, start) {//this creates all the tickers for the page.
    var length = 0;
    var tickers = document.getElementsByClassName('ticker');
    for(i = start, ln = start + TICKERS_ON_PAGE; i < ln; i++) {//Go through the stock ticker array
      try {
        if(i < symbols.length) {
          length++;
          tickers[i].style.display = 'inline';
        }//end if
      }
      catch(err) {
        console.log(err)
      }
      this.activeIntervals.push(setInterval(function(k){generators.updateTicker(k)}, 60*1000, i))//Anon function needs snapshot of value to setInterval correctly
    }
    //generators.loaded(length);
  }//end createTickers

};//end namespace

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function resultDaily(symbol) {//The will get the stock values for the past 2 days
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

async function resultMin(symbol) {//This will get the stock data for the past minute
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

var generators = {//generation namespace. Using to avoid an other global variable

  symbol_price: new Array(),
  retry: new Array(),
  loadInterval: {},

  genTicker: async function(symbol, tickerNum) {
    resultDaily(symbol).then(async function(valueDaily) {
      await sleep(1*1000);
      resultMin(symbol).then(async function(valueOpen) {
        try {
          var jsonToday = JSON.stringify(valueOpen[0])
          var jsonDaily = JSON.stringify(valueDaily[1])
          if(jsonToday != undefined && jsonDaily != undefined) {
            var today = JSON.parse(JSON.stringify(valueOpen[0]))
            var yesterday = JSON.parse(JSON.stringify(valueDaily[1]))
            var tickersHolder = document.getElementById('tick');
            generators.symbol_price.push({sym: symbol, prc: today.close});
            var deltaPoints = (Number(today.close)-Number(yesterday.close)).toFixed(2)//round to 2 decimal places
            var deltaPercent = ((Number(deltaPoints)/Number(yesterday.close))*100).toFixed(2)//percent
            tickersHolder.innerHTML += '<div class=\'ticker\' id=' + tickerNum + '>'
            var tickerLoc = document.getElementById(tickerNum)
            tickerLoc.innerHTML += '<span id=\'symbol-' + tickerNum + '\' class=\'symbol\'>' + symbol + '</span></br>'
            tickerLoc.innerHTML += '<span id=\'price-' + tickerNum + '\' class=\'price\'>' + Number(today.close).toFixed(2) + '</span></br>'
            tickerLoc.innerHTML += '<span id=\'points-' + tickerNum + '\' class=\'change\'>' + deltaPoints + '</span></br>'
            tickerLoc.innerHTML += '<span id=\'percent-' + tickerNum + '\' class=\'change\'>(' + deltaPercent + '%)</span></br>'
            await sleep(1000);
            //sortTickers();
          }
        else {
          throw "Generation Failed, jsons are undefined"
        }
      }
      catch(err) {
        console.log("Error: Ticker " + symbol + " has failed to generate!")
        console.log("Retrying in 30 seconds")
        console.log(err)
        generators.retry.push(setTimeout(function(k, j){generators.genTicker(k, j)}, 30*1000, symbol, tickerNum));
        //In the above line you cannot use the this keyword because we are not in the scope of generators anymore because of resultsDaily and resultsMin!
        //So insead of this we can just use generators. We have the same functionality
      }
    });
  });
  },//end member function genTicker

  updateTicker: async function(tickerNum) {
    try {//Try and catch to be moved inside the resultDaily function------
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
  },

  clearTimeouts: function(){//clear all the timouts of the tickers that encountered errors.
    for(i = 0; i < this.retry.length; i++) {
      clearTimeout(this.retry[i]);//clear all timeouts so if they goto a new page old tickers are not generated too
    }//end for
  },//end function clearTimeouts

  loaded: function(length, volumes) {
    var prev = document.getElementById('prev');
    var next = document.getElementById('next');
    loadInterval = setInterval(function(length){
      var tickers = document.getElementsByClassName('ticker');
      if(tickers.length == length) {//Finally load
        document.getElementById('load').innerHTML = '';
        prev.disabled = false;
        next.disabled = false;
        sortTickers();
        namespace.showStartTickers();//show the inital set of tickers
        clearInterval(loadInterval);
        //Done with ticker stuff
        //Start pie chart stuff
        genChart2(generators.symbol_price, volumes)
      }//end if
    }, 1000, length);
  },//end loaded function

  clearLoadInterval: function() {
    if(loadInterval != undefined) {clearInterval(loadInterval);}
  }

};//end generators namespace

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
  for(i = 0; i < numTickers; i++) {
    tickersHolder.appendChild(tickersClone[i])
  }
}//end function sort Tickers

//-----------------------------------------CHART NUMBER 2-----------------------------------------

var ctx2 = document.getElementById('folio-value2');

function sortTogether(shares, symbols) {
  var all = []
  for(i = 0; i < shares.length; i++) {
    all.push({'A': shares[i], 'B': symbols[i]})
  }//end for

  all.sort(function(a, b) {
    return b.A - a.A;
  });

  shares = []
  symbols = []

  for(i = 0; i < all.length; i++) {
    shares.push(all[i].A);
    symbols.push(all[i].B);
  }//end for loop

  return {shr: shares, sym: symbols}
}

function genChart2(symbol_price, volumes) {
  var symbols = symbol_price.map(a => a.sym);
  var prices = symbol_price.map(a => a.prc);
  var shares = [];
  //Create shares
  for(i = 0; i < symbols.length; i++) {
    shares.push(Number(Number(Number(prices[i]) * Number(volumes[i]))).toFixed(2));
  }//end for calculating shares
  //We need to split everything up...

  var sorted = sortTogether(shares, symbols);//sort based on chare value
  shares = sorted.shr;
  symbols = sorted.sym;


  var topFiveSymbols = [];
  var topFiveShares = [];
  var ceiling = Math.min(5, symbols.length);
  for(i = 0; i < ceiling; i++) {//top
    topFiveSymbols.push(symbols[i]);
    topFiveShares.push(Number(shares[i]));//make sure we're  pushing a number
  }//end forloop

  //We if celing is 5 and we have more than 5 stocks we need to add a 6th number that is the sum of the shares of all other Stocks
  if(ceiling == 5 && symbols.length != 5) {
    topFiveSymbols.push("Other");
    var sum = 0;
    for(i = 5; i < shares.length; i++)
      sum += Number(shares[i]);
    topFiveShares.push(sum);
  }//end if

  console.log(topFiveShares);
  console.log(topFiveSymbols);

  var myChart = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: topFiveSymbols,
      datasets: [{
        label: 'Portfolio Value',
        data: topFiveShares,
        backgroundColor: ['#43a047', '#f48f4b', '#3e95cd', '#8e5ea2', '#c45850', '#e8c3b9']//colors
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Top 5 Shares'
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            var dataset = data.datasets[tooltipItem.datasetIndex];
            var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
              return previousValue + currentValue;
            });
            var currentValue = dataset.data[tooltipItem.index];
            var percent = Math.floor(((currentValue/total) * 100)+0.5);
            return '$' + currentValue + " - " + percent + "%";
          }
        }
      }
    }
  });
}

$.ajax({//Get tickers from server
  url: '/tick-get',
  dataType: 'json',
  success: function(data) {
    var json = $.parseJSON(data);
    stocks = new Stocks(json.userInfo.avkey)//use the API that the node server provides
    var symbols = json.stockInfo.map(a => a.stockticker);
    var volumes = json.stockInfo.map(a => a.numstocks);
    namespace.setSymbols(symbols);
    namespace.createAllTickers();
    generators.loaded(symbols.length, volumes);
    //namespace.createTickers(symbols, STARTING_INDEX);//create the initial tickers
  },//end success
  error: function(data) {
    console.log('Error in AJAX responce');
  }//end error
});
