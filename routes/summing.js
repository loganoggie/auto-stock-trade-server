"use strict";
var database = require('../bin/database.js');
var queries = require('../bin/queries.js');
var Stocks = require('../public/js/stocks.js')

function Summation(api, stockInfo, id) {
  this.id = id
  this.api = api;
  this.symbols = stockInfo.map(a => a.stockticker);
  this.symbols_clone = this.symbols;
  this.volumes = stockInfo.map(a => a.numstocks);
  this.done = false;
  this.stocks = new Stocks(this.api);
}

Summation.prototype.sleep = function(ms) {//Sleep is used to let the API catchup. We are only alloed 1 query per second usually.
	return new Promise(resolve => setTimeout(resolve, ms));
}

Summation.prototype.resultMin = async function(symbol) { //
	try {
		var result = await this.stocks.timeSeries({
			symbol: symbol,
			interval: '1min',
			amount: 1
		});
		return result
	}
	catch(err) {
		console.log(err);
	}
}//end resultMin

Summation.prototype.sumInvestments = async function(sumInstance) {
	var done = false;
	var sum = 0;
	//TEST
	while(!done) {
		var i = 0;
		var symbol = this.symbols[i];//already set
    console.log(symbol);
		await this.resultMin(symbol).then(async function(result) {//We are no longer in the scope of summation, however i is in the scope
			try {
				var json = JSON.stringify(result[0]);
				if(json != undefined) {//if we're not undefined we're good
					sumInstance.symbols_clone.shift();//remove first element of the clone
					var value = JSON.parse(json);
					var share = Number(Number(value.close)*Number(sumInstance.volumes[i])).toFixed(2);
					console.log("VALUE = " + share);
					sum += Number(share);//sum the share for the person.
					if(sumInstance.symbols_clone.length == 0){
            done = true;
            var obj = {result: sum, id: sumInstance.id}
            var json = JSON.stringify(obj);
            console.log('Done summing');
            process.send(json);//send data
          }//we're done!
					i++;//inrement i
          await sumInstance.sleep(5*1000);
				}
				else {
					throw "Json is undefined";
				}
			}
			catch(err) {//API call failed, lets slow it down
				console.log('FAILED AT SYMBOL ' + symbol);
				console.log(err);
				await sumInstance.sleep(30*1000);//sleep for ten second
			}
		});
	}
	return sum;
}	//end sumInvestments

async function stuff(users) {
  var length = users.length;
  for(var i = 0; i < length; i++) {
    console.log("Interation " + i);
    console.log(users[i].email);
    await queries.getCurrentStockInfo(users[i].email, function(query){
      var stockInfo = query.rows;
      if(stockInfo.length != 0) {
        var sum = new Summation(users[i].avkey, stockInfo, users[i].id);
        sum.sumInvestments(sum);
      }//end if
      else {
        var obj = {result: 0, id: users[i].id}
        var json = JSON.stringify(obj);
        process.send(json);//send data
      }//end if
    });
  }//end for
}

process.on('message', function(json) {
  var users = JSON.parse(json);
  console.log('Start summation');
  stuff(users);
  console.log(users.length);
});
