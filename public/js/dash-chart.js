var ctx = document.getElementById('folio-value');

$('document').ready(function () {
  $.ajax({//Get porfolio value from server - PUT IN ONREADY LATER
    url: '/dash-get',
    dataType: 'json',
    success: function(data) {
      var json = $.parseJSON(data);
      console.log(json);
      genChart(json.worth);
      //var symbols = json.stockInfo.map(a => a.stockticker);
      //var volumes = json.stockInfo.map(a => a.numstocks);
      //var api = json.userInfo.avkey;
      //genChart2(symbols, volumes, api);
    },//end success
    error: function(data) {
      console.log('Error in AJAX responce')
    }//end error
  });
});

function genChart(data) {
  var worth = data.map(a => Number(a.worth).toFixed(2));
  var days = data.map(a => a.date.slice(0, 10).replace('T', ' '));
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Portfolio Value',
        data: worth,
        backgroundColor: 'rgba(67, 160, 71, 0.6)',
        pointBackgroundColor: "#f48f4b"
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:false,
            callback: function(label, index, labels) {
              return '$' + Number(label).toFixed(2);
            }
          }
        }]
      }
    }
  });
}
