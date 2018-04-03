"use strict";
var AlphaVantageAPI = require('alpha-vantage-cli').AlphaVantageAPI;
var Apikey = 'COTLNG8YXNJ8QO1I';
var alphaVantageAPI = new AlphaVantageAPI(Apikey, 'compact', true);
var fetch = require('node-fetch')
console.log(Apikey)

// series_type 
// close / open / high / low

//HT Trendline/mode
// function, symbol, interval, series_type, apikey

//MACD
// function, symbol, interval, series_type, apikey

//RSI
// function, symbol, interval, time_period(numdatapoints), series_type, apikey

//var Stocks = ['GOOG', 'TSLA', 'AAPL', 'BA', 'AMD', 'BAC']
//var Functions = ['HT_TRENDLINE', 'HT_TRENDMODE', 'MACD', 'MACDEXT', 'RSI', "BBANDS"]

const DEFAULT_URL = 'https://www.alphavantage.co/query?'

var test = (getTechnical('RSI', 'MSFT', '5min', 60))
console.log(test)

async function getTechnical(ind, sym, inter, time)
{
	// console.log(Apikey)
 //  if (typeof ApiKey === 'undefined')
 //  {
 //    throw new Error("error1")
 //  }

  var params = {
  	function: ind,
    symbol: sym,
    interval: inter,
    time_period: time,
    series_type: 'open',
  };


  // console.log(Apikey)
  params.apikey = Apikey;

  return new Promise((resolve, reject) =>
  {
  	var encoded = Object.keys(params).map(
    key => `${key}=${params[key]}`
  	).join('&');

    var url = DEFAULT_URL + encoded;

    fetch(url).then(function (response)
    {
      return response.json();

    }).then(function (data)
    {
    	// console.log(url + "\n")
    	console.log(data);
      if (typeof data['Error Message'] !== 'undefined')
      {
        throw new Error('error3')
      }

      resolve(data);
    });
  });
}

var dbString = 'postgres://whiidzewjaaqzm:0001b1a8a6fa014941cfa07feb3bb8f8049f2210a11f1d5f14895ea6fac6f955@ec2-184-73-196-65.compute-1.amazonaws.com:5432/deacrvvlj7rj32';

var ALGORITHM_NAME = ['RSI', 'BETA', 'Moving Averages']
var RSI_RISK = [[20, 80], [25, 75], [30, 70]]

var algoObj = {
	email: "",
	stock_symbol: "",
	indicator: "",
	param1: "",
	param2: "",
	// 3, etc
	risk: 0,
	interval: "daily",
	signal: function(){}
}

// function getTechnical(ind, sym, inter, time='undefined')

function algoGen(algoObj)
{
	if (algoObj.indicator == "RSI")
	{
		switch (algoObj.risk)
		{
			case 0:
				// low risk
				break;
			case 1:
				// medium risk
				break;
			case 2:
				// high risk
				algoObj.signal = function(json) // might have a json passed to it or not, depends on what we wanna do
				{
					// if we're not preloading with json
					// json = getTechnical(this.indicator, this.stock_symbol, this.interval)

				}

				break;
			default:
				console.log("Invalid switch case")
				throw new Error("error")
				break;

		}
	}

}