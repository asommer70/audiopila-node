module.exports = {
  makeObject: function(docs, key) {
    var obj = {};
    docs.forEach((doc) => {
      if (doc.get) {
        obj[doc.get(key)] = doc;
      } else {
        obj[doc[key]] = doc;
      }
    })
    return obj;
  },

  getSlug: function(name) {
    return name.replace(/[\])}[{(']/g, '').replace(/[\s\.]/g, '_').toLowerCase();
  },

  init: function() {
    this.hostname = this.getSlug(require('os').hostname().split('.').shift());
    return this;
  },
}.init();
