var express = require('express')
  , app = express()
  , serveStatic = require('serve-static')
  , lunchPredictor = require('./lib/lunch_predictor')
  , menuGetter = require('./lib/menu_getter')(process.env.MENU_URL);
  
app.get('/waitTimes.json',function(req,res){
  
  lunchPredictor.getPredictions(function(er,data){
    if(er){
      res,status(500);
      res.send();
    }else{
      res.status(200);
      res.send(data);  
    }
  });
  
});

app.get('/dailymenu',function(req,res){  
  menuGetter.get(function(er,liveMenu){
    if(er){
      console.log(er);
      res.status(500);
      res.send();
    }else{
      res.status(200);
      res.send(liveMenu);  
    }
  });
});

app.post('/submitresponse',throttleSubmissions,function(req,res){
  
  if(req.query && req.query.timeminutes && req.query.wait){
    console.log('got wait time');
    lunchPredictor.handleResponse(
      {
        wait:parseInt(req.query.wait,10),
        time:parseInt(req.query.timeminutes,10)
      }
      ,function(er){
        if(er){console.log(er)}
      }
    );
  }else{
    console.log('malformed repsonse on /submitresponse');
  }
  //do something with responses
  res.redirect('/');
});

function throttleSubmissions(req,res,next){
  const ttl = 1000 * 60 * 60;
  const COOKIE_NAME = 'lrsd';
  
  var allCookies = (req.headers.cookie||'').replace(' ','').split(';');
  var cookieMap = {};
  
  for(var i = 0; i < allCookies.length; i ++){
    var split = allCookies[i].split('=');
    cookieMap[split[0].toLowerCase()]=split[1];
  }
    
  if(cookieMap[COOKIE_NAME]){//has cookie
    if(req.headers['x-requested-with']==='XMLHttpRequest'){//XHR
      res.status(500);
      res.send();
    }
    else{//browser I guess?
      res.redirect('/');
    }
  }else{//accept request and set cookie
    
    var d = new Date();
    var nowTime = d.getTime();
    var expireTime = nowTime + ttl;
    d.setTime(expireTime);
    var expiresString = ';expires='+d.toGMTString();
    
    var cookieString = COOKIE_NAME+'='+nowTime+expiresString+'; HttpOnly';
    
    res.header('Set-Cookie',cookieString);
    next();
  }
}

app.use(serveStatic('public'));

app.listen(process.env.PORT || process.env.port || 8000,function(){
  console.log('listening on port '+(process.env.PORT || process.env.port || 8000));
});

process.on('uncaughtException',function(err){
  console.log('intercepted uncaught error: '+err+'\n Stack trace: \n' + err.stack + '\n at time '+new Date().toLocaleString() );
  console.log('continuing... naughty');
});