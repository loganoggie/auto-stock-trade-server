var text = document.getElementById('lookup')
var symbols =[[],[]];

$.get('text/nasdaqlisted.txt', function(data) {
  var text = data.split('\n')
  testFunc(text)
}, 'text');

$.get('text/otherlisted.txt', function(data) {
  var text = data.split('\n')
  testFunc(text)
}, 'text');

function testFunc(data) {
  //var symbol = [];
  //var companies = [];
  for(i = 1; i < data.length; i++) {
    symbols[0].push(String(data[i].split('|')[0]));
    symbols[1].push(String(String(data[i].split('|')[1]).split('-')[0]));
  }
}

function isSubString(s1, s2) {
  s1 = s1.toString().toLowerCase();
  s2 = s2.toString().toLowerCase();
  var length = s1.length;
  if(s1 == s2.substring(0, length)){return true}
  return false;
}

text.oninput = function() {//some fucking magic
  var div = document.getElementById('results')
  div.innerHTML = ''
  if(text.value != '') {
    for(i = 0; i < symbols[0].length; i++) {//I just need one of the two for this
      if(isSubString(text.value, symbols[1][i])) {
        div.innerHTML += symbols[0][i];
      }//end if
    }//end for
  }
}
