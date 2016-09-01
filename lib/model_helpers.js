module.exports = {
  makeObject: function(docs, key) {
    var obj = {};
    docs.forEach((doc) => {
      obj[doc.get(key)] = doc;
    })
    return obj;
  }
}
