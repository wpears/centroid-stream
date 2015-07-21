var test = require('tape');
var streamStats = require('stream-stats');
var centroidStream = require('../index');

test('Features', function(t){
  t.plan(6);

  var cs = centroidStream();
  var stats = streamStats.obj({store: 1});

  cs.pipe(stats).pipe(stats.sink());

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

  stats.on('finish', function(err){
    if(err) throw err;
    var result = this.getResult();
    t.deepEqual(result.chunks[0].chunk.geometry, {"type": "Point", "coordinates": [102, 0.5]}, 'Gets point from point');
    t.deepEqual(result.chunks[0].chunk.properties, {"prop0": "value0"}, 'Passes properties from point');
    t.deepEqual(result.chunks[1].chunk.geometry, {"type": "Point", "coordinates": [103.5, 0.5]}, 'Gets point from line');
    t.deepEqual(result.chunks[1].chunk.properties, {"prop0": "value0", "prop1": 0}, 'Passes properties from line');
    t.deepEqual(result.chunks[2].chunk.geometry, {"type": "Point", "coordinates": [100.5, 0.5]}, 'Gets point from polygon');
    t.deepEqual(result.chunks[2].chunk.properties, {"prop0": "value0", "prop1": {"this": "that"}}, 'Passes properties from polygon');
  });

});


test('Features with stringified output', function(t){
  t.plan(1);

  var cs = centroidStream.stringify();
  var stats = streamStats({store: 1});

  cs.pipe(stats).pipe(stats.sink());

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

  stats.on('finish', function(err){
    if(err) throw err;
    var result = this.getResult();
    var store = '{"type":"Point","geometry":{"type":"Point","coordinates":[102,0.5]},"properties":{"prop0":"value0"}}{"type":"Point","geometry":{"type":"Point","coordinates":[103.5,0.5]},"properties":{"prop0":"value0","prop1":0}}{"type":"Point","geometry":{"type":"Point","coordinates":[100.5,0.5]},"properties":{"prop0":"value0","prop1":{"this":"that"}}}'
    t.equal(result.store.toString(), store, 'Results in proper stringified output for all types.');
  });

});


test('Features with stringified output, passing object', function(t){
  t.plan(1);

  var cs = centroidStream({writableObjectMode: true, readableObjectMode: false});
  var stats = streamStats({store: 1});

  cs.pipe(stats).pipe(stats.sink());

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

  stats.on('finish', function(err){
    if(err) throw err;
    var result = this.getResult();
    var store = '{"type":"Point","geometry":{"type":"Point","coordinates":[102,0.5]},"properties":{"prop0":"value0"}}{"type":"Point","geometry":{"type":"Point","coordinates":[103.5,0.5]},"properties":{"prop0":"value0","prop1":0}}{"type":"Point","geometry":{"type":"Point","coordinates":[100.5,0.5]},"properties":{"prop0":"value0","prop1":{"this":"that"}}}'
    t.equal(result.store.toString(), store, 'Results in proper stringified output for all types.');
  });

});


test('Bad object keys', function(t){
  t.plan(1);

  try{
    centroidStream({readableObjectMode: false});
  }catch(e){
    t.pass('Error if passing object and leaving out explicit objectMode');
  }
});


test('Feature Collection', function(t){
  t.plan(2);

  var cs = centroidStream();
  var stats = streamStats.obj({store: 1})

  cs.pipe(stats).pipe(stats.sink());

  stats.on('finish', function(err){
    if(err) throw err;
    var result = this.getResult();

    t.deepEqual(result.chunks[0].chunk.geometry, {"type": "Point", "coordinates": [102, 0.5]}, 'Gets point from feature collection');
    t.deepEqual(result.chunks[0].chunk.properties, null, 'Properties are null on feature created from feature collection.');

  });

  cs.end({ "type": "FeatureCollection",
    "features": [
      { "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
        "properties": {"prop0": "value0"}
        },
      { "type": "Feature",
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
        },
      { "type": "Feature",
         "geometry": {
           "type": "Polygon",
           "coordinates": [
             [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
               [100.0, 1.0], [100.0, 0.0] ]
             ]
         },
         "properties": {
           "prop0": "value0",
           "prop1": {"this": "that"}
           }
         }
       ]
     }
  );

});

test('Error conditions', function(t){
  t.plan(2);

  var cs = centroidStream();
  cs.end('notanobject');
  cs.on('error', function(err){
    t.ok(err, 'Errors when passed a non-object');
  });

  var cs2 = centroidStream();
  cs2.end({"type": "Feature", "geometry": {"type": "fake", "coordinates": [14, 14]}, "properties": null});
  cs2.on('error', function(err){
    t.ok(err, 'Errors when passed a bad geometry type');
  });

  var cs3 = centroidStream();
  cs3.end({"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[14, 14], [15, 15]]}, "properties": null});
  cs3.on('error', function(err){
    t.ok(err, 'Errors when passed invalid GeoJSON (polygons must be LinearRings)');
  });
});
