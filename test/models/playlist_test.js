var expect = require('chai').expect;

describe('Playlist', function() {
  var Audio = require('../../models').audio;
  var Pila = require('../../models').pila;
  var Repo = require('../../models').repo;
  var Playlist = require('../../models').playlist;
  var ModelHelpers = require('../../lib/model_helpers');
  var hostname = ModelHelpers.hostname;
  var musicRepo, audioDbObj;

  describe('CRUD', function() {
    before(function(done) {
      new Playlist({
        name: 'Babel',
        slug: ModelHelpers.getSlug('Babel'),
        pila_id: 1
      }).save()
        .then((playlist) => {
          done();
        });
    })

    after(function(done) {
      Playlist.findBySlug('babel')
        .then((playlist) => {
          playlist.destroy()
            .then((playlist) => {
              done();
            })
        })
    });

    describe('findBySlug', function() {
      it('should return a Playlist', function(done) {
        Playlist.findBySlug('babel')
          .then((playlist) => {
            expect('babel').to.be.equal(playlist.get('slug'));
            done();
          })
      });
    });

    describe('Belongs To Pila', function() {
      it('should belong to a Pila', function(done) {
        Playlist.findBySlug('babel')
          .then((playlist) => {
            expect(hostname).to.be.equal(playlist.related('pila').get('name'));
            done();
          });
      });
    });
  });

  describe('belongsToMany Audios', function() {
    var audioObj = {
      name: 'taco.mp3',
      path: '/Users/adam/Music/taco.mp3',
      slug: 'taco_mp3',
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
          new Playlist({
            name: 'Babel',
            slug: ModelHelpers.getSlug('Babel'),
            pila_id: 1
          }).save()
            .then((playlist) => {
              var audios = require('../fixtures/audios');
              var keys = Object.keys(audios);
              var counter = 0;
              keys.forEach((key) => {
                var audio = new Audio(audios[key])
                delete audio['id'];
                audio.set('repo_id', musicRepo.get('id'));

                audio.save()
                  .then((audio) => {
                    var parts = audio.get('path').split('/');
                    if (parts[5] == playlist.get('name')) {
                      audio.playlists().attach([playlist]);
                    }

                    counter++
                    if(counter == keys.length) {
                      done();
                    }
                  })
                  .catch((error) => {
                    console.log('error:', error);
                  });
              }); // forEach end
            });
        });
    });

    after(function(done) {
      musicRepo.destroy()
        .then((repo) => {
          Playlist.findBySlug('babel')
            .then((playlist) => {
              playlist.destroy()
                .then((playlist) => {
                  done();
                })
            })
        });
    });

    it('should have many Audios', function(done) {
      Playlist.findBySlug('babel')
        .then((playlist) => {
          expect(6).to.be.equal(playlist.related('audios').length);
          done();
        });
    });

    it('should (an Audio) have a Playlist', function(done) {
      Audio.findBySlug('07_lovers_eyes_mp3')
        .then((audio) => {
          expect(1).to.be.equal(audio.related('playlists').length);
          done();
        })
    })
  });
});
