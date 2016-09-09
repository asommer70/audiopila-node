var test    = require('unit.js');
var expect = require('chai').expect;

describe('Audio File', function() {
  describe('POST /audios', function(){
    it('respond with json', function(done){
      test.httpAgent(app)
        .get('/user')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    })
  })
});
