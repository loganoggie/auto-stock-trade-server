//assume that stocks.js is included
//For local testing of the functions - these will be gone when the backend is ready to deal with it

//var ALGORITHM_NAME = ['RSI', 'BETA', 'Moving Averages']//Names of all the algorithms

//LOOKUP stuff

//Modal stuff



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


async function sleep(ms) {
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
  company: {
    symbol_name: [[],[]],
    type: []
  },
  ALGORITHM_NAME: ['RSI', 'BBands', 'Moving Averages'],
  PARAM_RADIO_RISK: ['lowrisk', 'mediumrisk', 'highrisk'],
  ACCEPTED_TYPES: ['common', 'ordinary', 'portfolio', 'equity Fund', 'etf'],

  modal: document.getElementById('modal'),
  bttn: document.getElementById('add'),//The Add Button
  volume: document.getElementsByName('volume')[0],
  close: document.getElementsByClassName('close')[0],
  select: document.getElementsByName('algorithm')[0],

  injectText: function(data) {
    for(i = 1; i < data.length; i++) {
      this.company.symbol_name[0].push(String(data[i].split('|')[0]));//get company symbol
      this.company.symbol_name[1].push(String(String(data[i].split('|')[1]).split('-')[0]));//get company name
      this.company.type.push(String(String(data[i].split('|')[1]).split('-')))//Check of this is a common stock
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
    document.getElementsByName('symbol')[0].value = this.company.symbol_name[0][index]
    this.volume.value = '';//reset value
    this.volumeOnChange();
  },

  showModal: function() {
    this.modal.style.display = 'block';
  },

  hideModal: function() {
    document.getElementById('params').innerHTML = '';//clear params
    this.volume.value = '';
    this.select.value = 'default';
    document.getElementById('results').innerHTML = '';
    this.modal.style.display = 'none';
  },

  algorithmOnChange: function() {
    var params = document.getElementById('params')
    params.innerHTML = ''//Reset it back to blank
    if(this.select.value != 'default') {
      //example showing that we can dynamically generate forms to use. Needs to discuss a formatting
      if(this.select.value == this.ALGORITHM_NAME[0]) {//RSI
        params.innerHTML += '<input type=\'radio\' name=\'radio\' value=\'' + this.PARAM_RADIO_RISK[0] + '\'>' + 'Low Risk';
        params.innerHTML += '<input type=\'radio\' name=\'radio\' value=\'' + this.PARAM_RADIO_RISK[1] + '\'>' + 'Medium Risk';
        params.innerHTML += '<input type=\'radio\' name=\'radio\' value=\'' + this.PARAM_RADIO_RISK[2] + '\'>' + 'High Risk';
      }//end if
      if(this.select.value == this.ALGORITHM_NAME[1]) {
        params.innerHTML += '<select name=\'interval\'>';
        var bbands = document.getElementsByName('interval')[0];
        //Bbands Time intervals
        bbands.innerHTML += '<option value=\'default\'> Select a Time Period';
        bbands.innerHTML += '<option value=\'daily\'> Daily';
        bbands.innerHTML += '<option value=\'weekly\'> Weekly';
        bbands.innerHTML += '<option value=\'monthly\'> Monthly';
        //Time_period number
        params.innerHTML += '<input type=\'number\' name=\'num_points\' placeholder=\'Number of Data Points\'>'
      }//end if
      if(this.select.value == this.ALGORITHM_NAME[2]) {
        params.innerHTML += '<input type=\'number\' name=\'days\' placeholder=\'Number of Days\'>'
      }//end if
    }//end if
  },

  lookupOnInput: function() {//dynamically create span to click on
    const OUTPUT_MAX = 10;
    var div = document.getElementById('results')
    div.innerHTML = ''
    var counter = 0;
    if(this.lookupBox.value != '') {
      for(i = 0; i < this.company.symbol_name[0].length; i++) {//I just need one of the two for this
        if(this.isSubString(this.lookupBox.value, this.company.symbol_name[1][i]) && counter <= OUTPUT_MAX) {
          counter++;
          if(new RegExp(this.ACCEPTED_TYPES.join("|")).test(this.company.type[i].toLowerCase()))//If the index is -1, type is does not contain
            div.innerHTML += '<span id=' + i + ' class=\'optn\' onclick=\'myModal.get(' + i + ')\'>' + this.company.symbol_name[0][i] + ' - ' + this.company.symbol_name[1][i] + '</span></br>';
        }//end if
      }//end for
    }//end i
  },//end lookup on input

  volumeOnChange: function() {//calculate the amount of money used for buying z amount of stock
    var symbol = document.getElementsByName('symbol')[0].value
    if(symbol != '' && this.volume.value != '') {
      document.getElementById('priceConversion').innerHTML = 'Calculating Price...';
      resultMin(symbol).then(async function(valueMin) {
        try {
          var jsonToday = JSON.stringify(valueMin[0])
          if(jsonToday != undefined) {
            var today = JSON.parse(jsonToday)
            document.getElementById('priceConversion').innerHTML = (Number(myModal.volume.value)*Number(today.close)).toFixed(2)//calc money spent
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
    var radioButtons = document.getElementsByName('radio');
    var children = params.childNodes;
    if(this.select.value == this.ALGORITHM_NAME[0]) {//RSI is selected
      if(!radioButtons[0].checked && !radioButtons[1].checked && !radioButtons[2].checked){return false}//If none of the radioboxes are checked, then dont submit
    }
    if(this.select.value == this.ALGORITHM_NAME[1]) {//BBands is selected
      if(children[1].value == '' || children[1].value <= 1)
      {
        swal("Please enter a number of data points greater than or equal to 2");
        return false;
      }
      if(children[0].value == 'default'){return false}
    }
    if(this.select.value == this.ALGORITHM_NAME[2]) {//Moving Averages is selected
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
//-------------------------------EDIT MODAL-------------------------------
var edit = {

  ALGORITHM_NAME: ['RSI', 'BBands', 'Moving Averages'],
  RADIO_GROUP: 'radio',
  PARAM_RADIO_RISK: ['lowrisk', 'mediumrisk', 'highrisk'],
  modal: document.getElementById('edit'),
  investID: document.getElementsByName('investID')[0],//this is the first investID on the page
  symbol: document.getElementsByName('symbol')[1],
  volume: document.getElementsByName('volume')[1],//this is the second box called volume
  close: document.getElementsByClassName('close')[1],//the second closed
  select: document.getElementsByName('algorithm')[1],
  deleteID: document.getElementsByName('delete')[0],
  twilio: document.getElementsByName('editTwilio')[0],
  index: 0,//generator.investments index

  hideModal: function() {
    document.getElementById('edit-params').innerHTML = '';//clear params
    this.modal.style.display = 'none';
  },

  constructEdit: function(num) {
    /*num is the index that this investment is located in inside the generator.investments array.*/
    this.symbol.value = generator.investments[num].symbol;
    this.investID.value = generator.investments[num].investID;
    this.deleteID.value = generator.investments[num].investID;//fill for deletion
    this.volume.value = generator.investments[num].volume;
    if(generator.investments[num].twilio == "1")
      this.twilio.checked = true;
    else
      this.twilio.checked = false;

    if(generator.investments[num].algorithm == this.ALGORITHM_NAME[0])//if we have RSI selected
      this.select.value = this.ALGORITHM_NAME[0];
    else if(generator.investments[num].algorithm == this.ALGORITHM_NAME[1])
      this.select.value = this.ALGORITHM_NAME[1];
    else if(generator.investments[num].algorithm == this.ALGORITHM_NAME[2])
      this.select.value = this.ALGORITHM_NAME[2];
    else {

    }//The algorithm name didn't match anything.
    this.algorithmOnChange();//We changed the algorithm
    this.getParams(generator.investments[num].param);
    this.index = num;//for remembering what index we used for this modal.
    this.modal.style.display = 'block';//Show the modal now

  },//end constructEdit fucntion

  algorithmOnChange: function() {
    var params = document.getElementById('edit-params')
    params.innerHTML = ''//Reset it back to blank
    if(this.select.value != 'default') {
      //example showing that we can dynamically generate forms to use. Needs to discuss a formatting
      if(this.select.value == this.ALGORITHM_NAME[0]) {//RSI
        params.innerHTML += '<input type=\'radio\' name=\'radio\' value=\'' + this.PARAM_RADIO_RISK[0] + '\'>' + 'Low Risk';
        params.innerHTML += '<input type=\'radio\' name=\'radio\' value=\'' + this.PARAM_RADIO_RISK[1] + '\'>' + 'Medium Risk';
        params.innerHTML += '<input type=\'radio\' name=\'radio\' value=\'' + this.PARAM_RADIO_RISK[2] + '\'>' + 'High Risk';
        if(this.select.value == generator.investments[this.index].algorithm)//if this new option is the one it started with.
          this.getParams(generator.investments[this.index].param);//check that ond value.
      }//end if
      if(this.select.value == this.ALGORITHM_NAME[1]) {//BBands
        params.innerHTML += '<select id=\'edit-interval\' name=\'interval\'>';
        var bbands = document.getElementById('edit-interval');
        //Bbands Time intervals
        bbands.innerHTML += '<option value=\'default\'> Select a Time Period';
        bbands.innerHTML += '<option value=\'daily\'> Daily';
        bbands.innerHTML += '<option value=\'weekly\'> Weekly';
        bbands.innerHTML += '<option value=\'monthly\'> Monthly';
        //Time_period number
        params.innerHTML += '<input id=\'edit-num_points\' type=\'number\' name=\'num_points\' placeholder=\'Number of Data Points\'>'
        if(this.select.value == generator.investments[this.index].algorithm)
          this.getParams(generator.investments[this.index].param);
      }//end if
      if(this.select.value == this.ALGORITHM_NAME[2]) {//Moving Averages
        params.innerHTML += '<input type=\'number\' name=\'days\' placeholder=\'Number of Days\'>'
        if(this.select.value == generator.investments[this.index].algorithm)//if this new option is the one it started with.
          this.getParams(generator.investments[this.index].param);//check that ond value
      }//end if
    }//end if
  },

  getParams: function(param) {
    if(this.select.value == this.ALGORITHM_NAME[0]) {
      if(param == this.PARAM_RADIO_RISK[0]) {//low risk
        document.getElementsByName(this.RADIO_GROUP)[0].checked = true;
      }//end if the param is low
      else if(param == this.PARAM_RADIO_RISK[1]) {//med risk
        document.getElementsByName(this.RADIO_GROUP)[1].checked = true;
      }//end else param is med
      else if(param == this.PARAM_RADIO_RISK[2]) {
        document.getElementsByName(this.RADIO_GROUP)[2].checked = true;
      }//ense else param is high
    }//end if this is RSI or BETA
    else if(this.select.value == this.ALGORITHM_NAME[1]) {
      document.getElementById('edit-interval').value = param.interval;
      document.getElementById('edit-num_points').value = Number(param.num_points);
    }
    else if(this.select.value == this.ALGORITHM_NAME[2]) {//moving averages
      document.getElementsByName('days')[0].value = Number(param);//set it to the days provided in param
    }
  },

  checkParams: function() {
    var params = document.getElementById('edit-params')
    var radioButtons = document.getElementsByName('radio');
    var children = params.childNodes;
    if(this.select.value == this.ALGORITHM_NAME[0]) {//RSI is selected
      if(!radioButtons[0].checked && !radioButtons[1].checked && !radioButtons[2].checked){return false}//If none of the radioboxes are checked, then dont submit
    }
    if(this.select.value == this.ALGORITHM_NAME[1]) {//BBands is selected
      if(children[1].value == '' || children[1].value <= 1)
      {
        swal("Please enter a number of data points greater than or equal to 2");
        return false;
      }
      if(children[0].value == 'default'){return false}
    }
    if(this.select.value == this.ALGORITHM_NAME[2]) {//Moving Averages is selected
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

}//end modal
//-------------------------------END EDIT MODAL-------------------------------


async function generateInvestment(stockData, investNum) {
      resultMin(stockData.stockticker).then(async function(valueMin) {
        try {
          var jsonToday = JSON.stringify(valueMin[0])
          if(jsonToday != undefined) {
            var today = JSON.parse(jsonToday)
            var investHolder = document.getElementsByClassName('tbody')[0];
            var price = Number(today.close).toFixed(2)
            var share = (price*stockData.numstocks).toFixed(2)
            var status = "active";
            if(stockData.twiliobit != '1')//maybe remove later
              status = "inactive";
            //Display an investment
            var row = investHolder.insertRow(-1);//insert at end
            row.className = 'invest-holder';
            row.id = investNum
            row.onclick = function() {edit.constructEdit(investNum)};

            //Cells in the row
            var cellSymbol = row.insertCell(-1);
            var cellShare = row.insertCell(-1);
            var cellVolume = row.insertCell(-1);
            var cellPrice = row.insertCell(-1);
            var cellAlgorithm = row.insertCell(-1);
            var cellStatus = row.insertCell(-1);

            //insert data
            cellSymbol.innerHTML = stockData.stockticker;
            cellSymbol.className = 'cell';
            cellSymbol.id = 'symbol-' + investNum;

            cellShare.innerHTML = share;
            cellShare.className = 'cell';
            cellShare.id = 'share-' + investNum;

            cellVolume.innerHTML = stockData.numstocks;
            cellVolume.className = 'cell';
            cellVolume.id = 'volume-' + investNum;

            cellPrice.innerHTML = price;
            cellPrice.className = 'cell';
            cellPrice.id = 'price-' + investNum;

            cellAlgorithm.innerHTML = stockData.algorithm;
            cellAlgorithm.className = 'cell';
            cellAlgorithm.id = 'algorithm-' + investNum;

            cellStatus.innerHTML = status;
            cellStatus.className = 'cell';
            cellStatus.id = 'notif-' + investNum;
            await sleep(1*1000)//let the API catch up
            //sortInvestments()
          }//end if
          else {
            throw "Generation Failed, json are undefined"
          }
        }
    catch(err) {
      console.log("Error: Investment with symbol with " + stockData.stockticker + " has failed to generate!");
      console.log("Retrying in 30 seconds");
      console.log(err);
      setTimeout(generateInvestment.bind(null, stockData, investNum), 30*1000)
    }
  });
}//end generateInvestment

/*function sortInvestments() {
  console.log();
  var investClone = [];
  const HEADERS = ['Symbols', 'Share', 'Volume', 'Price', 'Algorithm', 'Status'];
  var parent = document.getElementById('investments');
  var investHolder = document.getElementsByClassName('tbody')[0];
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
  // var header = investHolder.createTHead();//make the row
  // var hRow = header.insertRow(0);
  // for(var i = 0; i < HEADERS.length; i++) {
  //   hRow.insertCell(i).innerHTML = HEADERS[i];
  // }//end or

  while(investHolder.rows.length > 0) {
    investHolder.deleteRow(0);
  }

  for(i = 0; i < numInvest; i++) {
    var children = investClone[i].children;
    var row = investHolder.insertRow(-1);
    row.className = 'invest-holder';
    row.id = investClone[i].id;
    row.onclick = function() {edit.constructEdit(this.id)}.bind(investClone[i]);
    row.style.display = 'inline';

    for(var j = 0; j < HEADERS.length; j++) {
      var newCell = row.insertCell(-1);
      newCell.innerHTML = children[j].innerHTML;
      newCell.className = 'cell';
      newCell.id = children[j].id;
    }
    console.log(investHolder.rows[0]);
  }

}//end sortInvetments*/

var generator = {
  investments: new Array(),
  createAllInvestments: async function(stockData) {
    for(i = 0; i < stockData.length; i++) {
      generateInvestment(stockData[i], i);
      /*investID is the unique ID for that investment, investNum is the unquite ID that this script generats
      //so elements on the page have a unique ID. investNum domain: 0<= num < n where n is the number of investments the user has
      InvestID domain: 0<= id < m, where m is the total number of investments the shite has stored*/
      var paramWrapper = {}
      try {
        paramWrapper = $.parseJSON(stockData[i].params)
      }
      catch(e) {
        paramWrapper = stockData[i].params
      }
      this.investments.push({symbol: stockData[i].stockticker, volume: stockData[i].numstocks, algorithm: stockData[i].algorithm, status: stockData[i].enabled, investID: stockData[i].id, investNum: i, param: paramWrapper, twilio: stockData[i].twiliobit})
    }//end for
  }//end function createAllInvestments
}//end generator object

$('#modalForm').submit(function() {
  if(myModal.select.value == "default") {
    //dont submit if they havent selected an algorithm
    console.log("They didn't select an algorithm");
    swal('Please select a valid algorithm.');
    return false;
  }
  if(myModal.volume.value <= 0 || myModal.volume.value == '') {
    console.log("They had a non-positive integer")
    swal("Volume field must be a positive integer!")
    return false
  }
  if(document.getElementsByName('symbol')[0].value == '') {
    console.log("They did not choose a stock")
    swal("Please choose a valid stock option!")
    return false;
  }
  if(!myModal.checkParams()) {
    console.log("Parameters are not valid")
    if(myModal.select.value == "RSI")
      swal("Please enter valid parameters!", 'Please select a risk.');
    else if(myModal.select.value == "BBands")
      swal("Please enter valid parameters!", 'Please select a time interval and a number of data points greater than 1.');
    else if(myModal.select.value == "Moving Averages")
      swal("Please enter valid parameters!", 'Number of days is a positive integer!');
    return false;
  }
  return true;
});

$('#editForm').submit(function() {
  if(edit.select.value == 'default') {
    swal('Please select a valid algorithm.');
    return false;
  }//end if
  if(edit.volume.value <= 0 || edit.volume.value == '') {
    swal("Volume field must be a positive integer!")
    return false;
  }//end if
  if(!edit.checkParams()) {
    console.log("Parameters are not valid")
    if(edit.select.value == "RSI")
      swal("Please enter valid parameters!", 'Please select a risk.');
    else if(edit.select.value == "BBands")
      swal("Please enter valid parameters!", 'Please select a time interval and a number of data points greater than 1.');
    else if(edit.select.value == "Moving Averages")
      swal("Please enter valid parameters!", 'Number of days is a positive integer!');
    return false;
  }
  return true;
});

$('#deleteForm').submit(function(e) {
  e.preventDefault();
  var form = this;
  var submit = false;
  swal({
    title: "Are you sure?",
    text: "Your investment will be removed form your portfolio.",
    icon: "warning",
    buttons: true,
    dangerMode: true
  }).then(function(isConfirm) {
    if(isConfirm) {
      form.submit();
    }
  });
});

function loaded(symbols) {//sees if all the symbols are loaded on the page
  setInterval(function (symbols) {
    var investments = document.getElementsByClassName('invest-holder')
    if(investments.length == symbols.length || symbols.length == 0) {
      document.getElementById('load').innerHTML = ''
    }//all loaded
  }, 1000, symbols);
}//end function loaded

$('document').ready( function() {
  getText.nasdaq();
  getText.other();
  window.history.pushState("object or string", "Title", "/investments");
  $.ajax({//Get investments from server
    url: '/investments-get',
    dataType: 'json',
    success: function(data) {
      var json = $.parseJSON(data);
      console.log(json);
      stocks = new Stocks(json.userInfo.avkey)//use the API that the node server provides.
      console.log(json.stockInfo.length);
      generator.createAllInvestments(json.stockInfo);
      loaded(json.stockInfo);
      //createAllInvestments(json.symbols, json.volumes, json.algorithms, json.status);//create all the tickers for the page once an object is recieved
    },//end success
    error: function(data) {
      console.log('Error in AJAX responce');
    }//end error
  });
});

//modalAlgorithms(ALGORITHM_NAME);//FEED MODAL ALGORITHMS
myModal.initializeAlgorithms();
edit.initializeAlgorithms();//initialize both
//generator.createAllInvestments(tempStocks, volumes, algor, stat, algoIDs, params)//GENRATE ALL TEMP STOCK DATA
//loaded(tempStocks)
