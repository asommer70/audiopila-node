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

  describe('Has Many Audios', function() {
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

                var parts = audio.get('path').split('/');
                if (parts[5] == playlist.get('name')) {
                  console.log('audio.slug:', audio.get('slug'));
                  audio.playlists().attach([playlist]);
                }

                audio.save()
                  .then((audio) => {
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

    it('should haveMany Audios', function(done) {
      Audio.findBySlug('05_ghosts_that_we_knew_mp3')
        .then((audio) => {
          console.log('audio.playlists', audio.related('playlists'));
          done();
        })
      // Playlist.findBySlug('babel')
      //   .then((playlist) => {
      //     console.log('playlist.audios:', playlist.audios().length);
      //     expect(8).to.be.equal(playlist.related('audios').length);
      //     done();
      //   });
    });
  });
});
