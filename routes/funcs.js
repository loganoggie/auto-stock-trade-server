"use strict";
var fetch = require('node-fetch')
var express = require('express');
var router = express.Router();

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
	var a = await getFunc.apply(this, ...get_args)

	if (a.length == 0)
	{
		console.log("AlphaVantage returned empty object")
		return;
	}

	doFunc(a, get_args)
}

// do_alpha_job(getTechnical, ['RSI', 'MSFT', '15min', 200, apikey], print_earliest_RSI)

 
function right_now()
{
	var date = new Date()
	var right_now = [date.getFullYear(), (date.getMonth()+1), (date.getDay()+1), (date.getHours()+1), (date.getMinutes())]
	
	// AlphaVantage errors very often and returns blanks, stick to lower intervals

	if (args[2] == "daily")
	{
		right_now[right_now.length-1]='';
	}
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


	return format_rn;
}

function print_earliest(alpha_obj, args) // this is an example, write your own in index.js
{
	right_now = right_now();
	console.log(alpha_obj['Technical Analysis: ' + args[0]][format_rn].RSI)
}

function make_params(ind, tick, inter, time=0, apikey)
{
  var params = {
	function: ind,
	ticker: tick,
	interval: inter,
  };

  if (ind == "SMA")
  {
  	params.time_period = time;
  }
  else if (ind == "MACD")
  {
  	params.series_type = 'open';
  }
  else if (ind == "RSI" || ind == "BBANDS")
  {
  	params.time_period = time;
  	params.series_type = 'open';
  }
  
  params.apikey = apikey;

  return params;
}

function getTechnical(ind, sym, inter, time, apikey)
{

  var params = make_params(ind, sym, inter, time, apikey);

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

module.exports = {
	do_alpha_job: do_alpha_job,
	right_now: right_now,
	print_earliest: print_earliest,
	make_params: make_params,
	getTechincal: getTechnical,
	algoGen: algoGen
}