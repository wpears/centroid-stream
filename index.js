var through = require('through2');
var centroid = require('turf-centroid');

var point = 'Point';

module.exports = function(){
  return through.obj(function(chunk, enc, cb){

    var output = {
      type: point,
      geometry: centroid(chunk).geometry,
      properties: chunk.properties
    };

    cb(null, output);
  });
};
