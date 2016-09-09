var expect = require('chai').expect;

describe('Repo', function() {
  var Repo = require('../models').repo;
  var hostname = require('../lib/model_helpers').hostname;
  var repoObj = {
    name: 'Adam Music',
    path: '/Users/adam/Music',
    slug: 'adam_music',
    pila_id: 1
  };

  before(function(done) {
    new Repo(repoObj).save()
      .then((repo) => {
        done();
      })
  })

  after(function(done) {
    Repo.findBySlug(repoObj.slug)
      .then((repo) => {
        repo.destroy()
          .then((repo) => {
            done();
          })
      })
  })

  describe('findBySlug', function() {
    it('should return Repo object', function(done) {
      Repo.findBySlug('adam_music')
        .then((repo) => {
          expect(repo.get('name')).to.be.equal('Adam Music');
          done();
        })
    })
  })

  describe('all', function() {
    it('should return all Repos', function(done) {
      Repo.all()
        .then((repos) => {
          expect(1).to.be.equal(Object.keys(repos).length);
          done();
        })
    })
  })

  describe('Belongs To', function() {
    describe('Pila', function() {
      it('should belong to a Pila', function(done) {
        Repo.findBySlug(repoObj.slug)
          .then((repo) => {
            // console.log('repo.pila:', repo.related('pila'));
            expect('linux').to.be.equal(repo.related('pila').get('name'));
            done();
          })
      });
    })
  });

  describe('Has Many', function() {
    var Audio = require('../models').audio;

    before(function(done) {
      Repo.findBySlug(repoObj.slug)
        .then((repo) => {
          new Audio({
            name: 'taco.mp3',
            path: '/Users/adam/Music/taco.mp3',
            slug: 'taco_mp3',
            pila_id: 1,
            repo_id: repo.get('id')
          }).save()
            .then((audio) => {
              done();
            })
        })
    })

    after(function(done) {
      Audio.findBySlug('taco_mp3')
        .then((audio) => {
          audio.destroy()
            .then((audio) => {
              done();
            })
        });
    })

    describe('audios', function() {
      it('should have many Audios', function(done) {
        Repo.findBySlug(repoObj.slug)
          .then((repo) => {
            expect(1).to.be.equal(repo.related('audios').length);
            done();
          })
      })
    })
  })
});
