var expect = require('chai').expect;

describe('Pila', function() {
  var Pila = require('../models').pila;
  var hostname = require('../lib/model_helpers').hostname;

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
})
