var through = require('through2');
var centroid = require('turf-centroid');

var point = 'Point';
var type = 'type';
var geometry = 'geometry';

module.exports = function(){
  return through.obj(function(chunk, enc, cb){

    var output = {
      type: point,
      geometry: centroid(chunk).geometry,
      properties: null
    };

    var props = Object.keys(chunk);

    for(var i=0; i<props.length; i++){
      var key = props[i];
      if(key !== type && key !== geometry){
        output[key] = chunk[key];
      }
    }

    cb(null, output);
  });
};
