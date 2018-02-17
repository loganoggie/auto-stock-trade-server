var ctx = document.getElementById('folio-value');

var getDates = function(startDate, endDate) {//Generate list of dates
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
    currWorth = currWorth*Math.random()*2;
    data.push(currWorth);
  }
  return data;
};

var dates = getDates(new Date('Feburary 17, 2017'), new Date('March 17, 2017'))//lower date to upper date
var numData = getData(10000);


var myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: dates,
    datasets: [{
      label: 'Portfolio Value',
      data: numData,
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
