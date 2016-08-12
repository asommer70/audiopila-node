var fs = require('fs');

var DataApi = require('../lib/data_api');
var Audio = require('../models/audio');

var hostname = require('os').hostname().split('.').shift();

exports.audios = function(req, res, next) {
  Audio.all((audios) => {
    res.json(audios);
  })
}

exports.audio = function(req, res, next) {
  Audio.findBySlug(req.params.slug, (audio) => {
    if (!audio) {
      return res.status(404).json({message: 'Audio not found...'});
    }

    var stat = fs.statSync(audio.path);
    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });

    var readStream = fs.createReadStream(audio.path);
    res.audio = audio;
    readStream.pipe(res);
  })
}
