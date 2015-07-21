var through = require('through2');
var centroid = require('turf-centroid');

var pointString = 'Point';
var typeString = 'type';
var geoString = 'geometry';
var writable = {writableObjectMode: 1};
var objectMode = {objectMode: 1};

module.exports = function(stringify){
  var obj = stringify ? writable : objectMode;
  return through(obj, function(chunk, enc, cb){

    var geometry;

    try{
      geometry = centroid(chunk).geometry;
    }catch(e){
      return process.nextTick(function(){
        cb(e);
      });
    }

    var output = {
      type: pointString,
      geometry: geometry,
      properties: null
    };

    var props = Object.keys(chunk);

    for(var i=0; i<props.length; i++){
      var key = props[i];
      if(key !== typeString && key !== geoString){
        output[key] = chunk[key];
      }
    }

    if(stringify) output = JSON.stringify(output);

    return cb(null, output);
  });
};
