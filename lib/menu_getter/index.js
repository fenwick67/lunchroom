/*
get menu

request.get from rootUrl
then find the first href after the div with ID sideBar_pnlWeeklyMenu
then go there
then get the .post-menu element

req:
jsDOM

*/

const defaultMenuString = '(Not Available)';
var menu = defaultMenuString;
var jsdom = require('jsdom');

module.exports = function(rootUrl){
  
  getMenu();
  setInterval(getMenu,1000*60);
  
  function getMenu(callback){
    callback = callback || function(){};
    console.log('getMenu triggered');
    jsdom.env(rootUrl,function(err,window){
      if(err){
        return callback(err);
      }
      try{
        var menuLink = window.document.getElementById('sideBar_pnlWeeklyMenu').children[1].children[0].children[0].href;
      }
      catch(e){
        return callback(e);
      }
      if(!menuLink){
        return callback(new Error('unable to parse from root URL'));
      }
      
      jsdom.env(menuLink,function(err2,window2){
        if(err2){
          return callback(err2);
        }
        try{
          var printCrap = window2.document.getElementById('pnlWeeklyPrintButton');
          printCrap.parentNode.removeChild(printCrap);
          
          var liveMenu = window2.document.getElementsByClassName('post-menu')[0];
          
          var allElems = window2.document.querySelectorAll('*');
          for(var i = 0,l=allElems.length;i<l;i++){
            allElems[i].className="";
            allElems[i].href="";
            allElems[i].src="";
            allElems[i].id="";
          }
        }
        catch(e){
          return callback(e);
        }
        if(!liveMenu){
          return callback(new Error('unable to parse menu from daily page'));
        }
        menu = liveMenu.innerHTML
          .replace(/<br>\s*(?:<br>\s*)+/ig,'<br>')
          .replace(/h1/ig,'h3')
          .replace(/h6/ig,'h4')
          .replace(/<a[\s\S]*?>/ig,'<p>')
          .replace(/script/ig,'div')
          .replace(/<\/a>/ig,'</p>');
        return callback(null,menu);
      });
    });
  }
  
  function getCachedMenu(callback){
    if(menu === defaultMenuString){
      getMenu(callback);
    }else{
      callback(null,menu);    
    }
  }
  
  return {get:getCachedMenu,getLive:getMenu};
}