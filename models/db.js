var fs = require('fs');
var Datastore = require('nedb');

var db = new Datastore({ filename: './db/audiopila.db', autoload: true });

db.ensureIndex({ fieldName: 'name' }, function (err) {
  if (err) {
    console.log('error creating db index name err:', err);
  }
});
db.ensureIndex({ fieldName: 'slug' }, function (err) {
  if (err) {
    console.log('error creating db index slug err:', err);
  }
});
db.ensureIndex({ fieldName: 'type' }, function (err) {
  if (err) {
    console.log('error creating db index type err:', err);
  }
});

db.makeObject = (docs, key) => {
  var obj = {};
  docs.forEach((doc) => {
    obj[doc[key]] = doc;
  })
  return obj;
}

module.exports = db;
