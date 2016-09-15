var expect = require('chai').expect;

var dirParts = __dirname.split('/')
dirParts.pop();
var repoDir = dirParts.join('/') + '/fixtures/repo';

describe('Sync', function() {
  var Sync = require('../../lib/sync');
  var Audio = require('../../models').audio;
  var Pila = require('../../models').pila;
  var Repo = require('../../models').repo;
  var hostname = require('../../lib/model_helpers').hostname;

  var urls = ['http://localhost:3071', '/sync'];

  var syncPila = {
  	name: 'android_phone',
  	platform: "android",
  	lastSynced: 1473349451922,
  	syncedTo: 'linux',
  	lastPlayed: "babel_mp3",
  	created_at: "2016-09-08T10:23:17.415Z",
  	updated_at: "2016-09-08T10:23:17.415Z",
  	type: "pila",
  	audios: {
      babel_mp3: {
    		httpUrl: "http://localhost:3070/audios/babel_mp3",
    		duration: 197.277,
    		playbackTime: 30,
    		pila_id: "adams_iphone",
    		repo: "tardisk_music",
    		created_at: "2016-09-08T09:58:27.611Z",
    		updated_at: "2016-09-08T09:58:27.611Z",
    		type: "audio",
    		name: "Babel.mp3",
    		slug: "babel_mp3",
    		path: "/Documents/Babel.mp3",
    		playedTime: 1473349451922,
        repo: "sync_repo",
        pila: "android_phone"
    	},
      taco_mp3: {
        httpUrl: "http://localhost:3070/audios/taco_mp3",
        duration: 197.27,
        playbackTime: 20,
        pila_id: "adams_iphone",
        repo: "tardisk_music",
        created_at: "2016-08-08T09:58:27.611Z",
        updated_at: "2016-08-08T09:58:27.611Z",
        type: "audio",
        name: "taco.mp3",
        slug: "taco_mp3",
        path: "/Documents/Taco.mp3",
        playedTime: 1473349451933,
        repo: "sync_repo",
        pila: "android_phone"
      }
    },
  	repos: {
	    sync_repo: {
    		name: "Sync Repo",
    		path: "/Downloads/Music",
    		created_at: "2016-09-08T10:25:32.658Z",
    		updated_at: "2016-09-08T10:25:32.658Z",
    		type: "repo",
    		slug: "sync_repo",
        pila: "android_phone"
      },
      misc_repo: {
        name: "Misc Repo",
        path: "/Documents/things",
        created_at: "2016-09-10T10:25:32.658Z",
        updated_at: "2016-09-10T10:25:32.658Z",
        type: "repo",
        slug: "misc_repo",
        pila: "android_phone"
      }
	  }
  }

  var syncRepos = syncPila.repos;
  var syncAudios = syncPila.audios;

  var audioObj = {
    httpUrl: "http://localhost:3070/audios/babel_mp3",
    duration: 197.277,
    playbackTime: 25,
    pila_id: "adams_iphone",
    type: "audio",
    name: "Babel.mp3",
    slug: "babel_mp3",
    path: "/Users/adam/Music/Babel.mp3",
    playedTime: 1473349451820,
    pila_id: 1,
  }

  describe('now', function() {
    // before(function(done) {
    //   Pila.addPila(syncPila)
    //     .then((pila) => {
    //       done();
    //     });
    // });

    after(function(done) {
      Pila.findByName('android_phone')
        .then((pila) => {
          pila.destroy()
            .then((pila) => {
              done();
            });
        });
    });

    it('should create new Repos and Audios', function(done) {
      Sync.now(syncPila, urls)
        .then(() => {
          Audio.all()
            .then((audios) => {
              expect(2).to.be.equal(Object.keys(audios).length);
              done();
            });
        });
    });
  });
});
