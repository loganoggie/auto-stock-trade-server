"use strict";
var AlphaVantageAPI = require('alpha-vantage-cli').AlphaVantageAPI;
var alphaVantageAPI = new AlphaVantageAPI(Apikey, 'compact', true);
var fetch = require('node-fetch')
var express = require('express');
var router = express.Router();
var Apikey = 'COTLNG8YXNJ8QO1I';
console.log(Apikey)

console.log(router.user)

//var Stocks = ['GOOG', 'TSLA', 'AAPL', 'BA', 'AMD', 'BAC']
//var Functions = ['HT_TRENDLINE', 'HT_TRENDMODE', 'MACD', 'MACDEXT', 'RSI', "BBANDS"]

const DEFAULT_URL = 'https://www.alphavantage.co/query?'

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

async function do_alpha_job(getFunc, get_args, doFunc)
{
	var a = await getFunc.apply(this, get_args)

	if (a.length == 0)
	{
		console.log("AlphaVantage returned empty object")
		return;
	}

	doFunc(a, get_args)
}

// do_alpha_job(getTechnical, ['RSI', 'MSFT', '15min', 200], print_earliest_RSI)

 

function print_earliest_RSI(alpha_obj, args)
{
	var date = new Date()
	var right_now = [date.getFullYear(), (date.getMonth()+1), (date.getDay()+1), (date.getHours()+1), (date.getMinutes())]
	
	// AlphaVantage errors very often and returns blanks, stick to lower intervals

	if (args[2] == "60min")
	{
		while (right_now[right_now.length-1] != 0)
		{
			right_now[right_now.length-1]=0;
		}
	}
	else if (args[2] == "30min")
	{
		while (right_now[right_now.length-1] % 30 != 0)
		{
			right_now[right_now.length-1]-=1;
		}
	}
	else if (args[2] == "15min")
	{
		while (right_now[right_now.length-1] % 15 != 0)
		{
			right_now[right_now.length-1]-=1;
		}
	}

	else if (args[2] == "5min")
	{
		while (right_now[right_now.length-1] % 5 != 0)
		{
			right_now[right_now.length-1]-=1;
		}
	}

	if (right_now[1] < 10)
	{
		right_now[1] = "0" + right_now[1]
	}

	if (right_now[2] < 10)
	{
		right_now[2] = "0" + right_now[2]
	}

	if (right_now[3] < 10)
	{
		right_now[3] = "0" + right_now[3]
	}

	if (right_now[4] < 10)
	{
		right_now[4] = "0" + right_now[4]
	}

	var format_rn = right_now[0] + "-" + right_now[1] + "-" + right_now[2] + " " + right_now[3] + ":" + right_now[4]
	console.log(alpha_obj['Technical Analysis: RSI'][format_rn].RSI)
}


function getTechnical(ind, sym, inter, time)
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