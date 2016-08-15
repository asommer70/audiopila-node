var express = require('express');
var fs = require('fs');
var busboy = require('connect-busboy');
var bodyParser = require('body-parser');

var router = express.Router();

var PilaController = require('./controllers/pila_controller');
var AudioController = require('./controllers/audio_controller');
var RepoController = require('./controllers/repo_controller');
var DataApi = require('./lib/data_api');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var hostname = require('os').hostname().split('.').shift();

router.use(busboy({ immediate: true }));


// GET / (index of everything)
router.get('/', PilaController.pilas);

// GET /pilas (index of pilas)
router.get('/pilas', PilaController.pilas);

// GET /pilas/:name (get individual pila)
router.get('/pilas/:name', PilaController.pila);

// GET /audios (index of audios)
router.get('/audios', AudioController.audios);

// GET /audios/:slug (download Audio from repository)
router.get('/audios/:slug', AudioController.audio);

// GET /repos (index of repositories)
router.get('/repos', RepoController.repos);


// POST /audios (add Audios in directory)
router.post('/audios', AudioController.addRepoAudios);

// POST /sync (sync device and audio details)
router.post('/sync', PilaController.sync);

// POST /repos/:slug (upload Audios to repository)
router.post('/repos/:slug', PilaController.upload);


// PUT /audios/:slug (play Audio)
router.put('/audios/:slug', AudioController.action);
// router.put('/audios/:slug', function(req, res) {
  // switch (req.body.action) {
  //   case 'play':
  //   console.log('playing...');
  //     PlayerApi.play(req.params.slug, (data) => {
  //       res.json(data);
  //     })
  //     break;
  //
  //   case 'pause':
  //     console.log('pausing...');
  //     PlayerApi.pause(req.params.slug, (data) => {
  //       if (data.hasOwnProperty('audio')) {
  //         data.audio.playedTime = Date.now();
  //
  //         DataApi.updateAudio(data.audio, (audio) => {
  //           res.json(data);
  //         })
  //       } else {
  //         res.json(data);
  //       }
  //     })
  //     break;
  //
  //   case 'forward':
  //     console.log('going forward...');
  //     PlayerApi.seek(req.params.slug, 'forward', (data) => {
  //       res.json(data);
  //     })
  //     break;
  //   case 'backward':
  //     console.log('going backward...');
  //     PlayerApi.seek(req.params.slug, 'backward', (data) => {
  //       res.json(data);
  //     })
  //     break;
  // }
// })


// DELETE /pilas/:name (remove pila)
router.delete('/pilas/:name', PilaController.deletePila);

// DELETE /audios/:slug (remove audio)
router.delete('/audios/:slug', AudioController.deleteAudio);


module.exports = router;
