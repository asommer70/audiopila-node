var expect = require('chai').expect;

var dirParts = __dirname.split('/')
dirParts.pop();
var repoDir = dirParts.join('/') + '/fixtures/repo';

describe('Sync', function() {
  var AudioFile = require('../../lib/audio_file');
  var Audio = require('../../models').audio;
  var Pila = require('../../models').pila;
  var Repo = require('../../models').repo;
  var hostname = require('../../lib/model_helpers').hostname;

  after(function(done) {
    Repo.findBySlug('sync_repo')
      .then((repo) => {
        repo.destroy()
          .then((repo) => {
            done();
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
