module.exports = {
  makeObject: function(docs, key) {
    var obj = {};
    docs.forEach((doc) => {
      obj[doc.get(key)] = doc;
    })
    return obj;
  },

  getSlug: function(name) {
    return name.replace(/[\])}[{(']/g, '').replace(/[\s\.]/g, '_').toLowerCase();
  },

  hostname: require('os').hostname().split('.').shift(),
}
