var text = document.getElementById('lookup')
var symbols =[[],[]];
const DISPLAY_MAX = 10;

$.get('text/nasdaqlisted.txt', function(data) {//map the fiirst list
  var text = data.split('\n')
  testFunc(text)
}, 'text');

$.get('text/otherlisted.txt', function(data) {//map the second list
  var text = data.split('\n')
  testFunc(text)
}, 'text');

function testFunc(data) {//map a data set
  //var symbol = [];
  //var companies = [];
  for(i = 1; i < data.length; i++) {
    symbols[0].push(String(data[i].split('|')[0]));
    symbols[1].push(String(String(data[i].split('|')[1]).split('-')[0]));
  }
}

function isSubString(s1, s2) {//see if we have any matches
  s1 = s1.toString().toLowerCase();
  s2 = s2.toString().toLowerCase();
  var length = s1.length;
  if(s1 == s2.substring(0, length)){return true}
  return false;
}//end is SubString

function get(index) {
  document.getElementById('symbol').value = symbols[0][index]
}

text.oninput = function() {//some fucking magic
  var div = document.getElementById('results')
  div.innerHTML = ''
  var counter = 0;
  if(text.value != '') {
    for(i = 0; i < symbols[0].length; i++) {//I just need one of the two for this
      if(isSubString(text.value, symbols[1][i]) && counter <= DISPLAY_MAX) {
        counter++;
        div.innerHTML += '<span id=' + i + ' class=\'optn\' onclick=\'get(' + i + ')\'>' + symbols[0][i] + ' - ' + symbols[1][i] + '</span></br>';
      }//end if
    }//end for
  }//end if
}//end oninput
