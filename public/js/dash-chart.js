//----TESTING FUNCTION----
/*var getDates = function(startDate, endDate) {//Generate list of dates
  var dates = [],
      currentDate = startDate,
      addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
  while (currentDate <= endDate) {
    dates.push(currentDate.toLocaleDateString());
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};

var getData = function(start){//Generates random data for the dates: just for first visualisation
  var data = [];
  var currWorth = start;
  data.push(currWorth);
  for (i = 1; i < dates.length; i++) {
    currWorth = currWorth*(Math.random()*(2)+0.1);
    data.push(currWorth);
  }
  return data;
};

var dates = getDates(new Date('Feburary 17, 2017'), new Date('March 17, 2017'))//lower date to upper date
var numData = getData(10000);*/

//----END TESTING FUNCTIONS----
//----BEGINNING STUFF----
var ctx = document.getElementById('folio-value');

$.ajax({//Get porfolio value from server
  url: '/dash-get',
  dataType: 'json',
  success: function(data) {
    var json = $.parseJSON(data);
    console.log(json);
    genChart(json);
  },//end success
  error: function(data) {
    console.log('Error in AJAX responce')
  }//end error
})

function genChart(data) {
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.dates,
      datasets: [{
        label: 'Portfolio Value',
        data: data.price,
        backgroundColor: [
          'rgba(67, 160, 71, 0.4)'
        ]
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:false
          }
        }]
      }
    }
  });
}
