var fs = require('fs');
var Repo = require('../models').repo;
var ModelHelpers = require('../lib/model_helpers');

var hostname = ModelHelpers.hostname;

exports.repos = function(req, res, next) {
  Repo.all()
    .then((repos) => {
      res.json(repos);
    })
}
