//----TESTING FUNCTION----
/*var getDates = function(startDate, endDate) {//Generate list of dates
  var dates = [],
      currentDate = startDate,
      addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
  while (currentDate <= endDate) {
    dates.push(currentDate.toLocaleDateString());
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};

var getData = function(start){//Generates random data for the dates: just for first visualisation
  var data = [];
  var currWorth = start;
  data.push(currWorth);
  for (i = 1; i < dates.length; i++) {
    currWorth = currWorth*(Math.random()*(2)+0.1);
    data.push(currWorth);
  }
  return data;
};

var dates = getDates(new Date('Feburary 17, 2017'), new Date('March 17, 2017'))//lower date to upper date
var numData = getData(10000);*/

//----END TESTING FUNCTIONS----
//----BEGINNING STUFF----

/*function doRequest(url) {
  return new Promise((resolve, reject) => {
    fetch(url).then(function(responce) {
      return responce.json();
    }).then(function(data) {
      if(typeof data['Error Message'] !== 'undefined') {
        console.log("Error in API request");
      }
      resolve(data);
    });
  });
}

function convertData(data) {
  //Strip the meta data
  var key = Object.keys(data).find(
    key => key.indexOf("Stock Quotes") !== -1
  );
  data = data[key];


  var newData = [];

  for(key in data) {
    let newSample = {};
    for(var sampleKey in data[key]) {
      let newSampleKey = sampleKey.replace(/.+. /, '');
      newSample[newSampleKey] = Number(data[key][sampleKey]);
    }//end for sampleKey

    newData.push(newSample);

  }//end for key in data

  return newData;

}

async function batchStock(symbols, api) {
  var symbolString = symbols.join(",");
  var result = await doRequest('https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=' + symbolString + "&apikey=" + api)

  var converted = await convertData(result);

  var prices = [];
  for(i = 0; i < converted.length; i++) {
    prices.push(converted[i].price);
  }//end for
  return prices;
}*/

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

var ctx = document.getElementById('folio-value');

$('document').ready(function () {
  $.ajax({//Get porfolio value from server - PUT IN ONREADY LATER
    url: '/dash-get',
    dataType: 'json',
    success: function(data) {
      var json = $.parseJSON(data);
      console.log(json);
      genChart(json.worth);
      //var symbols = json.stockInfo.map(a => a.stockticker);
      //var volumes = json.stockInfo.map(a => a.numstocks);
      //var api = json.userInfo.avkey;
      //genChart2(symbols, volumes, api);
    },//end success
    error: function(data) {
      console.log('Error in AJAX responce')
    }//end error
  });
});

function genChart(data) {
  var worth = data.map(a => Number(a.worth).toFixed(2));
  var days = data.map(a => a.date.slice(0, 10).replace('T', ' '));
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Portfolio Value',
        data: worth,
        backgroundColor: ['rgba(67, 160, 71, 0.4)']
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:false,
            callback: function(label, index, labels) {
              return '$' + Number(label).toFixed(2);
            }
          }
        }]
      }
    }
  });
}

/*function genChart2(symbols, volumes, api) {
  batchStock(symbols, api).then(function(prices) {
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
  });
}*/


//testings batch
//genChart2(['GOOG', 'TSLA', 'AAPL', 'COWN', 'AMD', 'F', 'ADM'], [40, 20, 13, 70, 20, 200, 100], 'QSZQSTA7ZLPXTAZO');
