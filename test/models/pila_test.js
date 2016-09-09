var expect = require('chai').expect;

describe('Pila', function() {
  var Pila = require('../../models').pila;
  var hostname = require('../../lib/model_helpers').hostname;

  describe('findByName', function() {
    it('should return Pila object', function(done) {
      Pila.findByName(hostname)
        .then((pila) => {
          expect(pila.get('name')).to.be.equal(hostname);
          done();
        })
    })
  })

  describe('all', function() {
    before(function(done) {
      new Pila({
        name: 'adams_iphone',
        platform: 'ios',
      }).save()
        .then((pila) => {
          done();
        })
    });

    after(function(done) {
      Pila.findByName('adams_iphone')
        .then((pila) => {
          pila.destroy()
            .then(() => {
              done();
            });
        })
    })

    it('should return all Pilas', function(done) {
      Pila.all()
        .then((pilas) => {
          expect(2).to.be.equal(Object.keys(pilas).length);
          done();
        })
    })
  })

  describe('addPila', function() {
    after(function(done) {
      Pila.findByName('adams_iphone')
        .then((pila) => {
          pila.destroy()
            .then(() => {
              done();
            });
        })
    })

    it('should return new pila', function(done) {
      Pila.addPila({
        name: 'adams_iphone',
        platform: 'ios',
      })
        .then((pila) => {
          expect(pila.get('name')).to.be.equal('adams_iphone');
          done();
        })
    })
  })

  describe('Has Many', function() {
    describe('repos and audios', function() {
      var Repo = require('../../models').repo;
      var Audio = require('../../models').audio;

      before(function(done) {
        new Repo({
          name: 'Adam Music',
          path: '/Users/adam/Music',
          slug: 'adam_music',
          pila_id: 1
        }).save()
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
      });

      after(function(done) {
        Audio.findBySlug('taco_mp3')
          .then((audio) => {
            audio.destroy()
              .then((audio) => {
                Repo.findBySlug('adam_music')
                  .then((repo) => {
                    repo.destroy()
                      .then((repo) => {
                        done();
                      });
                  })
              })
          })
      })

      it('should have many repos', function(done) {
        Pila.findByName(hostname)
          .then((pila) => {
            expect(1).to.be.equal(pila.related('repos').length);
            done();
          })
      });

      it('should have many audios', function(done) {
        Pila.findByName(hostname)
          .then((pila) => {
            expect(1).to.be.equal(pila.related('audios').length);
            done();
          })
      });
    })
  })
})
