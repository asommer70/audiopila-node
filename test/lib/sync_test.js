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
    		playedTime: 1473349451922
    	}
    },
  	repos: {
	    sync_repo: {
    		name: "Sync Repo",
    		path: "/Downloads/Music",
    		created_at: "2016-09-08T10:25:32.658Z",
    		updated_at: "2016-09-08T10:25:32.658Z",
    		type: "repo",
    		slug: "sync_repo"
      }
	  }
  }

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

  before(function(done) {
    new Repo({
      name: 'Adam Music',
      path: '/Users/adam/Music',
      slug: 'adam_music',
      pila_id: 1
    }).save()
      .then((repo) => {
        musicRepo = repo;
        var audio = new Audio(audioObj);
        audio.set('repo_id', repo.get('id'));
        audio.save()
          .then((audio) => {
            audioDbObj = audio;
            done();
          })
      })
  })

  after(function(done) {
    Pila.findByName('android_phone')
      .then((pila) => {
        pila.destroy()
          .then((pila) => {
            Repo.findBySlug('adam_music')
              .then((repo) => {
                repo.destroy()
                  .then((repo) => {
                    done();
                  });
              });
          })
      })

    Repo.findBySlug('sync_repo')
      .then((repo) => {
        if (repo) {
          repo.destroy()
            .then((repo) => {
              done();
            });
        }
      });
  });

  it('should create a new Repo and Audios from files in the Repo path', function(done) {
    Sync.now(syncPila, urls)
      .then(() => {
        Repo.findBySlug('sync_repo')
          .then((repo) => {
            expect('sync_repo').to.be.equal(repo.get('slug'));
            // expect(3).to.be.equal(Object.keys(audios).length);
            Audio.findBySlug('babel_mp3')
              .then((audio) => {
                expect(syncPila.audios.babel_mp3.playbackTime).to.be.equal(audio.get('playbackTime'));
                done();
              })
          });
      });
  });
});
