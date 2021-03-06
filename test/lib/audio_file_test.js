var expect = require('chai').expect;

var dirParts = __dirname.split('/')
dirParts.pop();
var repoDir = dirParts.join('/') + '/fixtures/repo';

describe('Audio File', function() {
  var AudioFile = require('../../lib/audio_file');
  var Audio = require('../../models').audio;
  var Pila = require('../../models').pila;
  var Repo = require('../../models').repo;
  var Playlist = require('../../models').playlist;
  var hostname = require('../../lib/model_helpers').hostname;

  describe('all', function() {
    after(function(done) {
      Repo.findBySlug('fixture_repo')
        .then((repo) => {
          repo.destroy()
            .then((repo) => {
              Playlist.findBySlug('electronics')
                .then((playlist) => {
                  if (playlist) {
                    playlist.destroy()
                      .then((playlist) => {
                        done();
                      })
                  } else {
                    done();
                  }
                })
            });
        });
    });

    it('should create a new Repo and Audios from files in the Repo path', function(done) {
      AudioFile.add('Fixture Repo', repoDir, 'http://localhost:3071/')
        .then((audios) => {
          Repo.findBySlug('fixture_repo')
            .then((repo) => {
              expect('fixture_repo').to.be.equal(repo.get('slug'));
              expect(3).to.be.equal(Object.keys(audios).length);
              done();
            });
        });
    });
  });

  describe('Other Methods', function() {
    var localPila, localRepo, localFiles;

    before(function(done) {
      Pila.findByName(hostname)
        .then((pila) => {
          localPila = pila;
          done();
        });
    });


    describe('createRepo', function() {
      after(function(done) {
        Repo.findBySlug('fixture_repo')
          .then((repo) => {
            repo.destroy()
              .then((repo) => {
                done();
              });
          });
      });

      it('should create a new Repo', function(done) {
        AudioFile.createRepo(localPila, 'Fixture Repo', repoDir, (repo) => {
          expect('fixture_repo').to.be.equal(repo.get('slug'));
          done();
        });
      });
    })

    describe('getLocalFiles', function() {
      before(function(done) {
        AudioFile.createRepo(localPila, 'Fixture Repo', repoDir, (repo) => {
          localRepo = repo;
          done();
        });
      });

      after(function(done) {
        Repo.findBySlug('fixture_repo')
          .then((repo) => {
            repo.destroy()
              .then((repo) => {
                done();
              });
          });
      });

      it('should return an array of file paths', function(done) {
        AudioFile.getLocalFiles(localRepo.get('path'), (error, files) => {
          expect(error).to.be.null;
          expect(files.length).to.be.greaterThan(1);
          done();
        })
      });
    });

    describe('getAudioDetails', function() {
      before(function(done) {
        AudioFile.createRepo(localPila, 'Fixture Repo', repoDir, (repo) => {
          localRepo = repo;

          AudioFile.getLocalFiles(repo.get('path'), (error, files) => {
            localFiles = files;
            done();
          })
        });
      });

      after(function(done) {
        Repo.findBySlug('fixture_repo')
          .then((repo) => {
            repo.destroy()
              .then((repo) => {
                done();
              });
          });
      });

      it('returns a Audio details', function(done) {
        var deets = AudioFile.getAudioDetails(localFiles[0]);
        expect('15.864671').to.be.equal(deets.format.duration);
        expect(localFiles[0]).to.equal(deets.format.filename);
        done();
      });
    });

    describe('getAudios', function() {
      before(function(done) {
        AudioFile.createRepo(localPila, 'Fixture Repo', repoDir, (repo) => {
          localRepo = repo;
          done();
        });
      });

      after(function(done) {
        Repo.findBySlug('fixture_repo')
          .then((repo) => {
            repo.destroy()
              .then((repo) => {
                done();
              });
          });
      });

      it('should return an Audio for each file in a Repo', function(done) {
        AudioFile.getAudios(localPila, localRepo, (audios) => {
          expect(3).to.be.equal(Object.keys(audios).length);
          done();
        });
      });
    });

    describe('create Audio', function() {
      before(function(done) {
        AudioFile.createRepo(localPila, 'Fixture Repo', repoDir, (repo) => {
          localRepo = repo;

          AudioFile.getLocalFiles(repo.get('path'), (error, files) => {
            localFiles = files;
            done();
          })
        });
      });

      after(function(done) {
        Repo.findBySlug('fixture_repo')
          .then((repo) => {
            repo.destroy()
              .then((repo) => {
                done();
              });
          });
      });

      it('returns an Audio', function(done) {

        AudioFile.createAudio(localFiles[0], localPila, localRepo, null, (audio) => {
          expect(15.864671).to.be.equal(audio.get('duration'));
          expect(localFiles[0]).to.equal(audio.get('path'));
          done();
        });
      });
    });

    describe('checkPlaylist', function() {
      before(function(done) {
        AudioFile.createRepo(localPila, 'Fixture Repo', repoDir, (repo) => {
          localRepo = repo;
          AudioFile.getLocalFiles(repo.get('path'), (error, files) => {
            localFiles = files;
            done();
          })
        });
      });

      after(function(done) {
        Repo.findBySlug('fixture_repo')
          .then((repo) => {
            repo.destroy()
              .then((repo) => {
                Playlist.findBySlug('electronics')
                  .then((playlist) => {
                    if (playlist) {
                      playlist.destroy()
                        .then((playlist) => {
                          done();
                        })
                    } else {
                      done();
                    }
                  })
              });
          });
      });

      it('returns a Playlist', function(done) {

        AudioFile.checkPlaylist(localRepo, localFiles[localFiles.length - 1], (playlist) => {
          expect('electronics').to.be.equal(playlist.get('name'));
          done();
        });
      });
    });

  });
});
