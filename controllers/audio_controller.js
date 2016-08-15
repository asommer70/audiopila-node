var fs = require('fs');

var Audio = require('../models/audio');
var Player = require('../models/player');
var hostname = require('os').hostname().split('.').shift();


exports.audios = function(req, res, next) {
  Audio.all((audios) => {
    res.json(audios);
  });
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
  });
}

exports.deleteAudio = function(req, res, next) {
  Audio.delete(req.params.slug, (audios) => {
    res.json(audios);
  });
}

exports.addRepoAudios = function(req, res, next) {
  var baseUrl = req.protocol + '://' + req.get('host');

  Audio.add(req.body.name, req.body.path, baseUrl, (audios) => {
    res.json({message: 'Successfully added audios.', audios: audios});
  })
}

exports.action = function(req, res, next) {
  console.log('audio_controller action:', req.body.action);
  switch (req.body.action) {
    case 'play':
    console.log('playing...');
      Player.play(req.params.slug, (data) => {
        res.json(data);
      })
      break;

    case 'pause':
      console.log('pausing...');
      Player.pause(req.params.slug, (data) => {
        res.json(data);
      })
      break;

    case 'forward':
      console.log('going forward...');
      Player.seek(req.params.slug, 'forward', (data) => {
        res.json(data);
      })
      break;
    case 'backward':
      console.log('going backward...');
      Player.seek(req.params.slug, 'backward', (data) => {
        res.json(data);
      })
      break;
  }
}
