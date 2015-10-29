/*

*/

module.exports = {smoothArray:smoothArray,interpolateArray:interpolateArray}


function smoothArray(arr,iters){
  var iters = iters || 1;
  var exWeight = Math.SQRT2;
  var newArr = [];  
  var prevVal =0;
  
  if(iters <= 0){
    exWeight = 0;
  }
  
  for(var i = 0; i < arr.length; i ++){
    var weight = 0;
    var kernelTot = 0; 
    var prev = arr[i-1];
    var next = arr[i+1];
    var curr = arr[i];
    
    if(typeof prev !== 'undefined'){
      weight += exWeight;
      kernelTot += exWeight * prev;
    }if(typeof next !== 'undefined'){
      weight += exWeight;
      kernelTot += exWeight * next;
    }if(typeof curr !== 'undefined'){
      weight +=1;
      kernelTot += curr
    }
    if(weight !== 0){
      newArr[i] = prevVal = kernelTot/weight;
    }else{
      newArr[i] = prevVal;
    }
    
  }
  
  if(typeof iters == 'number' && iters > 1){
    return smoothArray(newArr,iters-1)
  }else{
    return newArr;
  }
  
}

function interpolateArray(r){
  function exists(val){
    return ( typeof val ==='number' && !isNaN(val) );   
  }
  var newArray = [];
  var missingIndexes = [];
  for(var i = 0,l=r.length;i < l;i++){
    if(!exists(r[i])){
      missingIndexes.push(i);
    }
  }
  //console.log(missingIndexes);
  
  for(var i = 0; i < missingIndexes.length; i ++){
    var missingIndex = missingIndexes[i];
    var prevFilledIndex = NaN;
    var prevFilledValue = NaN;
    var nextFilledIndex = NaN;
    var nextFilledValue = NaN;
    var cursor = missingIndexes[i];
    
    while(cursor>0){
      cursor --;
      if (exists(r[cursor])){
        prevFilledIndex = cursor;
        prevFilledValue = r[cursor];
        break;
      }
    }
    cursor = missingIndexes[i];
    while(cursor < r.length + 1){
      cursor ++;
      if (exists(r[cursor])){
        nextFilledIndex = cursor;
        nextFilledValue = r[cursor];
        break;
      }
    }
    
    if(!exists(prevFilledIndex)||!exists(nextFilledIndex)){
      if(exists(nextFilledValue)){
        r[missingIndex]=nextFilledValue;
      }else if (exists(prevFilledValue)){
        r[missingIndex]=prevFilledValue;
      }else{
        r[missingIndex]=0;
      }
      
    }    
    else{
      //now fill in values
      var dPrev = missingIndex - prevFilledIndex;
      var dNext = nextFilledIndex - missingIndex;
      //console.log(dPrev+','+dNext+','+nextFilledIndex);
      r[missingIndex] = (1/dNext * nextFilledValue + 1/dPrev * prevFilledValue)/( (1/dPrev + 1/dNext) );
    }
    
    
  }
  return r;
}