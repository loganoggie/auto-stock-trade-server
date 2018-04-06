// var AlphaVantageAPI = require('alpha-vantage-cli').AlphaVantageAPI
// var alphaVantageAPI = new AlphaVantageAPI(Apikey, 'compact', true)
var fetch = require('node-fetch')
var users = require('./users')
// var Apikey = 'COTLNG8YXNJ8QO1I'

const DEFAULT_URL = 'https://www.alphavantage.co/query?'

// var algoObj = {
// 	email: "", // to ID the user
// 	ticker: "",
// 	indicator: "",
// 	param1: "",
// 	param2: "",
// 	risk: 0,
// 	interval: "daily",
// 	signal: function(){}
// }

function make_algo_obj(em, ti, ind, p1, p2, ri, inter, sig)
{
	var algoObj = {
	email: em, // to ID the user
	ticker: ti,
	indicator: ind,
	param1: p1,
	param2: p2,
	risk: ri,
	interval: inter,
	signal: function(){}
	}

	algoObj.signal = sig
	return algoObj;
}

// console.log(make_algo_obj('ninjas@mst.edu', 'MST', 'RSI', 20, 80, 0, '1min', function(low, hi) {
// 	if (this.param1 > 25)
// 		return 1
// 	else if (this.param2 < 75)
// 		return 2
// 	else
// 		return 0
// }))

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

// alpha_obj is the json object
// args is get_args in above function
// out is var that the RSI value is assigned 

function get_earliest_RSI(alpha_obj, args, out)
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
	out = alpha_obj['Technical Analysis: RSI'][format_rn].RSI
}

// just RSI for now

function getTechnical(ind, sym, inter, time, Apikey)
{

  var params = {
	function: ind,
	symbol: sym,
	interval: inter,
	time_period: time,
	series_type: 'open',
  };

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

module.exports.make_algo_obj = make_algo_obj;
module.exports.do_alpha_job = do_alpha_job;
module.exports.get_earliest_RSI = get_earliest_RSI;