var test = require('tape');
var streamStats = require('stream-stats');
var centroidStream = require('../index');

test('Features', function(t){
  t.plan(6);

  var cs = centroidStream();

  cs.pipe(streamStats.obj('features', {store: 1})).sink();

  cs.write({
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
    "properties": {"prop0": "value0"}
  });

  cs.write({
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
      ]
    },
    "properties": {
      "prop0": "value0",
      "prop1": 0.0
    }
  });

  cs.end({
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
          [100.0, 1.0], [100.0, 0.0]
        ]
      ]
    },
    "properties": {
      "prop0": "value0",
      "prop1": {"this": "that"}
    }
  });

  cs.on('end', function(err){
    if(err) throw err;
    var result = streamStats.getResult('features');
    t.deepEqual(result.chunks[0].chunk.geometry, {"type": "Point", "coordinates": [102, 0.5]}, 'Gets point from point');
    t.deepEqual(result.chunks[0].chunk.properties, {"prop0": "value0"}, 'Passes properties from point');
    t.deepEqual(result.chunks[1].chunk.geometry, {"type": "Point", "coordinates": [103.5, 0.5]}, 'Gets point from line');
    t.deepEqual(result.chunks[1].chunk.properties, {"prop0": "value0", "prop1": 0}, 'Passes properties from line');
    t.deepEqual(result.chunks[2].chunk.geometry, {"type": "Point", "coordinates": [100.5, 0.5]}, 'Gets point from polygon');
    t.deepEqual(result.chunks[2].chunk.properties, {"prop0": "value0", "prop1": {"this": "that"}}, 'Passes properties from polygon');
  });



});
