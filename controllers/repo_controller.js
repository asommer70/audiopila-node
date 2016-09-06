var fs = require('fs');
var Repo = require('../models').repo;
var hostname = require('os').hostname().split('.').shift();

exports.repos = function(req, res, next) {
  Repo.all()
    .then((repos) => {
      res.json(repos);
    })
}
