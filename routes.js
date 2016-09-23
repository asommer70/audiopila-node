var express = require('express');
var fs = require('fs');
var busboy = require('connect-busboy');
var bodyParser = require('body-parser');

var router = express.Router();

var PilaController = require('./controllers/pila_controller');
var AudioController = require('./controllers/audio_controller');
var RepoController = require('./controllers/repo_controller');
var PlaylistController = require('./controllers/playlist_controller');

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

// GET /playlists (index of repositories)
router.get('/playlists', PlaylistController.playlists);

// GET /playlists/:slug (details for a playlist)
router.get('/playlists/:slug', PlaylistController.playlist);

// GET /stats (data about this Pila)
router.get('/status', PilaController.status);


// POST /audios (add Audios in directory)
router.post('/audios', AudioController.addRepoAudios);

// POST /sync (sync device and audio details)
router.post('/sync', PilaController.sync);

// POST /repos/:slug (upload Audios to repository)
router.post('/repos/:slug', PilaController.upload);

// POST /playlists (add Playlist)
router.post('/playlists', PlaylistController.add);

// POST /playlist/audio (add Audio to a Playlist)
router.post('/playlist/audio', PlaylistController.addAudio);


// PUT /audios/:slug (play Audio)
router.put('/audios/:slug', AudioController.action);


// DELETE /pilas/:name (remove pila)
router.delete('/pilas/:name', PilaController.deletePila);

// DELETE /audios/:slug (remove audio)
router.delete('/audios/:slug', AudioController.deleteAudio);


module.exports = router;
