var Datastore = require('nedb');

var db = new Datastore({ filename: './db/audiopila.db', autoload: true });
db.ensureIndex({ fieldName: 'name' }, function (err) {
  if (err) {
    console.log('error creating db index name err:', err);
  }
});
db.ensureIndex({ fieldName: 'slug' }, function (err) {
  if (err) {
    console.log('error creating db index name err:', err);
  }
});

// console.log('db:', db);
auddio = {
  slug: 'taco'
}

db.find({slug: 'taco'}, function(err, docs) {
  console.log('err:', err);
  console.log('docs:', docs);
})

// db.find({ $where: function () { return this.audios[audio.slug]; } }, function (err, docs) {
//   if (err) {
//     console.log('err:', err);
//   }
//   console.log('docs:', docs);
// });
