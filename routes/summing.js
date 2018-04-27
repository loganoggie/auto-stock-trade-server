"use strict";
var database = require('../bin/database.js');
var queries = require('../bin/queries.js');
var Stocks = require('../public/js/stocks.js')

function Summation(api, stockInfo, email) {
  this.email = email;
  this.api = api;
  this.symbols = stockInfo.map(a => a.stockticker);
  this.symbols_clone = this.symbols;
  this.volumes = stockInfo.map(a => a.numstocks);
  this.shares = [];
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

Summation.prototype.calcPrices = async function() {
  var length = this.symbols.length
  var sumInstance = this;
  var done = false;
  var i = 0;
  while(!done) {
    var symbol = sumInstance.symbols[i];//already set
    var volume = sumInstance.volumes[i];
    await sumInstance.resultMin(symbol).then(async function(result) {//We are no longer in the scope of summation, however i is in the scope
      try {
        var json = JSON.stringify(result[0]);
        if(json != undefined) {//if we're not undefined we're good
          var value = JSON.parse(json);
          sumInstance.shares.push(Number(Number(value.close)*Number(volume)).toFixed(2));
          i++;
          if(i >= length)
            done = true;
        }
        else {
          throw "JSON is undefined";
        }
      }
      catch(err) {
        console.log('FAILED AT SYMBOL ' + symbol);
				console.log(err);
				await sumInstance.sleep(30*1000);//sleep for ten second
      }
    });
  }
}

Summation.prototype.calcSum = async function() {
  var sum = 0;
  var length = this.symbols.length;
  for(var i = 0; i < length; i++) {
    sum += Number(this.shares[i]);
  }//end for
  var obj = {result: sum, email: this.email}
  var json = JSON.stringify(obj);
  process.send(json);//send data
}	//end sumInvestments

async function sumUsers(users) {
  var length = users.length;
  for(var i = 0; i < length; i++) {
    await queries.getCurrentStockInfo(users[i].email, async function(query){
      var stockInfo = query.rows;
      if(stockInfo.length != 0) {
        var sum = new Summation(users[i].avkey, stockInfo, users[i].email);
        await sum.calcPrices();
        await sum.calcSum().then(function(result){});
      }//end if
      else {
        var obj = {result: 0, email: users[i].email}
        var json = JSON.stringify(obj);
        process.send(json);//send data
      }//end if
    });
  }//end for
}

process.on('message', function(json) {
  var users = JSON.parse(json);
  console.log('Start summation');
  sumUsers(users);
  console.log(users.length);
});
