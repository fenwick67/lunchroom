var mongoose = require('mongoose')
  , arrayFill = require('./array-fill');
  
const mongoUrl = process.env.MONGOLAB_URI || process.env.MONGODB || 'mongodb://localhost:27017/test'
  , timeMin = 690
  , timeMax = 750;

mongoose.connect(mongoUrl);
var mongooseReady = false;
  
var db = mongoose.connection;
db.on('error', console.log.bind(console, 'connection error:'));
db.once('open', function (callback) {
  mongooseReady = true;
  predict();
  setInterval(predict,60000);
});

var lunchResponseSchema = mongoose.Schema({
  responseDate:Number,
  time:Number,
  wait:Number
});

var LunchResponse = mongoose.model('LunchResponse',lunchResponseSchema);

function handleResponse(data,callback){
  if(!mongooseReady){
    mongoose.connect(mongoUrl);
    return callback(new Error('database not initialized'));
  }
  var response = new LunchResponse({
    responseDate:new Date().getTime(),
    wait:data.wait,
    time:data.time    
  });
  response.save(function(er,response){
    console.log('saved response');
    callback(er);
  });
  
};

function getPredictions(callback){
  var adjustedPredictions = {today:arrayFill.smoothArray(arrayFill.interpolateArray(predictions))};
  callback(null,adjustedPredictions);
};

var predictions = [];

function predict(cb){
  var predictStart = new Date();
  
  cb=cb||function(){};
  
  if(!mongooseReady){
    return callback(new Error('database not initialized'));
  }
  
  LunchResponse.find()
  .sort({responseDate:-1})
  .limit(1000)
  .exec(function(er,responses){
        
    if(er){
      return cb(er);
    }
    var responseCounts = {};
    var responseSums = {};
    for(var i = 0,l = responses.length; i < l; i ++){
      
      if(responses[i].time < timeMin || responses[i].time > timeMax){
        // bad data
      }else{
      
        if(typeof responseSums[responses[i].time] != 'number'){
          responseSums[responses[i].time] = responses[i].wait;        
        }else{
          responseSums[responses[i].time] += responses[i].wait;
        }   
        
        if(typeof responseCounts[responses[i].time] != 'number'){
          responseCounts[responses[i].time] = 1;
        }else{
          responseCounts[responses[i].time] +=1;
        }
      }
    }
    
    predictions = [];
    for (var i = timeMin; i <= timeMax; i ++){
      var count = responseCounts[i]||0
        , sum = responseSums[i]||0
        , avg;
        
      if (count <= 0){
        avg = undefined; 
      }else{
        avg = sum/count;
      }
      predictions.push(avg);
    }
    console.log('predictions: \n'+JSON.stringify(predictions) );  
    
    console.log('time to predict '+responses.length+' records: '+ (new Date().getTime() - predictStart) + ' ms at '+predictStart.toLocaleString()); 
    cb(null,predictions);
  });
  
 
}

module.exports = {
  handleResponse:handleResponse,
  getPredictions:getPredictions  
};