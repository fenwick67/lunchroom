$(function(){
  
var timeMin = 690
  , timeMax = 750;

var dirty = false;

function timeToText(time){
  if (typeof time == 'string'){
    time = parseInt(time,10);
  }
  var hours
    , minutes;
  hours = (Math.floor(time/60)-1 )% 12 + 1;
  minutes = (time % 60).toString();
  while(minutes.length < 2){
    minutes = '0' + minutes;
  }
  return hours + ':' + minutes;
}

$('#time').on('input', function(e) {
  dirty = true;
  $('#timedisplay').html(timeToText(this.value))
});

$('#wait').on('input', function(e) {
  dirty = true;
  var wait = parseInt(this.value, 10),
    desc = "";

  if (wait == 0) {
    desc = "no wait at all";
  } else if (wait < 20){
    desc = "pretty quick wait"
  }else if (wait < 40 ) {
    desc = "short wait";
  } else if (wait < 60) {
    desc = "normal wait";
  } else if (wait < 80) {
    desc = "longer wait";
  } else if (wait <100) {
    desc = "pretty long wait"
  }else {
    desc = "crazy wait"
  }

  $('#waitdisplay').html(desc);

});

// AJAX form submission if JS loads
$('#waitform').on('submit',function(e){
  var inputs = $(this).find('input');
  console.log(inputs);
  var formData = [];
  
  for(var i = 0, l = inputs.length; i < l; i ++){
    if(inputs[i].type==='range'){
      formData.push(inputs[i].name+'='+inputs[i].value);      
    } 
  }
  
  var method = $(this).attr('method');
  var url = $(this).attr('action') + '?' + formData.join('&');
  
  $.ajax({
    method:method,
    url:url    
  });
  
  console.log(url);
  e.preventDefault;
  return false;
});

$.ajax({
  url:'/waitTimes.json',
  method:'get',
  success:updateChart,
  fail:ajaxFail  
});

function updateChart(data){
    var todaysForecast = data.today;
    
    var labels60 = [];
    for(var i = 0; i <= (timeMax - timeMin); i++){
      if(i% 5 === 0){
        labels60.push(timeToText(i+timeMin));
      }else{
        labels60.push(timeToText(i+timeMin).split(':')[1]);
      }
    }
    
    var chartData = {
      labels: labels60,
      datasets: [{
        label: "Estimated Wait",
        fillColor: "rgba(255,187,0,0.2)",
        strokeColor: "#fb0",
        pointColor: "#fb0",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "#fb0",
        data: todaysForecast
      }]
    };
    var options = {

      //Boolean - Whether grid lines are shown across the chart
      scaleShowGridLines: true,

      //String - Colour of the grid lines
      scaleGridLineColor: "rgba(0,0,0,.05)",

      //Number - Width of the grid lines
      scaleGridLineWidth: 1,
      
      //Boolean, show sscale labels or not:
      scaleShowLabels:true,
      
      //overriding the scaleGridLineColor
      scaleOverride:true,
      scaleSteps:1,
      scaleStepWidth:100,
      scaleStartValue:0,
      scaleLabel:'<%=value==0?"Short":"Long"%>',
     
      //Boolean - Whether to show horizontal lines (except X axis)
      scaleShowHorizontalLines: false,

      //Boolean - Whether to show vertical lines (except Y axis)
      scaleShowVerticalLines: true,

      //Boolean - Whether the line is curved between points
      bezierCurve: true,

      //Number - Tension of the bezier curve between points
      bezierCurveTension: 0.4,

      //Boolean - Whether to show a dot for each point
      pointDot: false,

      //Number - Radius of each point dot in pixels
      pointDotRadius: 4,

      //Number - Pixel width of point dot stroke
      pointDotStrokeWidth: 1,

      //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
      pointHitDetectionRadius: 0,

      //Boolean - Whether to show a stroke for datasets
      datasetStroke: true,

      //Number - Pixel width of dataset stroke
      datasetStrokeWidth: 2,

      //Boolean - Whether to fill the dataset with a colour
      datasetFill: true,

      //String - A legend template
      legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
    };

    var myLineChart = new Chart(ctx).Line(chartData, options);

  
}

function ajaxFail(){
  console.log('ajax failed');
}


var ctx = document.getElementById("mychart").getContext("2d");
  
});