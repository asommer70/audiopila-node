var expect = require('chai').expect;

describe('Audio', function() {
  var Audio = require('../../models').audio;
  var Pila = require('../../models').pila;
  var Repo = require('../../models').repo;
  var hostname = require('../../lib/model_helpers').hostname;
  var musicRepo, audioDbObj;

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
    musicRepo.destroy()
      .then((repo) => {
        done();
      });
  })

  describe('findBySlug', function() {
    it('should return Audio object', function(done) {
      Audio.findBySlug('taco_mp3')
        .then((audio) => {
          expect(audio.get('name')).to.be.equal('taco.mp3');
          done();
        })
    });
  })

  describe('all', function() {
    it('should return all Audios', function(done) {
      Audio.all()
        .then((audios) => {
          expect(1).to.be.equal(Object.keys(audios).length);
          done();
        })
    })
  })

  describe('delete', function() {
    it('should delete an Audio', function(done) {
      new Audio({
        name: 'tico.mp3',
        path: '/Users/adam/Music/tico.mp3',
        slug: 'tico_mp3',
        pila_id: 1,
        repo_id: musicRepo.get('id')
      }).save()
        .then((newAudio) => {
          Audio.delete(newAudio.get('slug'))
            .then((delAudio) => {
              Audio.findBySlug('tico_mp3')
                .then((audio) => {
                  expect(audio).to.be.null;
                  done();
                })
            })
        })
    })
  })

  describe('Belongs To', function() {
    describe('Pila', function() {
      it('should belong to a Pila', function(done) {
        Audio.findBySlug('taco_mp3')
          .then((audio) => {
            expect('linux').to.be.equal(audio.related('pila').get('name'));
            done();
          })
      })
    })

    describe('Repo', function() {
      it('should belong to a Repo', function(done) {
        Audio.findBySlug('taco_mp3')
          .then((audio) => {
            expect('adam_music').to.be.equal(audio.related('repo').get('slug'));
            done();
          })
      })
    })
  })
});
