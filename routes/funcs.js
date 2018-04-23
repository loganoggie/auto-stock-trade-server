"use strict";
// var fetch = require('node-fetch')
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
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate()-2;

	if(month<10)
	{
	  month="0"+month;
	}
	if(day<10)
	{
	  day="0"+day;
	}

	var stringDate = year+"-"+month+"-"+day;


	return stringDate;
}

function print_earliest(alpha_obj, args) // this is an example, write your own in index.js
{
	right_now = right_now();
	console.log(alpha_obj['Technical Analysis: ' + args[0]][format_rn].RSI)
}

function make_params(ind, tick=0, inter, time=0, apikey)
{
  var params = {
	function: ind,
  };

  if (ind == "SMA")
  {
  	params.ticker = tick;
  	params.time_period = time;
  }
  else if (ind == "MACD")
  {
  	params.ticker = tick;
  	params.series_type = 'open';
  }
  else if (ind == "RSI" || ind == "BBANDS")
  {
  	params.ticker = tick;
  	params.time_period = time;
  	params.series_type = 'open';
  }

  params.interval = inter;
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

module.exports = {
	do_alpha_job: do_alpha_job,
	right_now: right_now,
	print_earliest: print_earliest,
	make_params: make_params,
	getTechincal: getTechnical,
}