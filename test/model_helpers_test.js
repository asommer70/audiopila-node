var expect = require('chai').expect;

describe('ModelHelpers', function() {
  var ModelHelpers = require('../lib/model_helpers');

  it('should return slugified string from hostname', function() {
    expect(ModelHelpers.hostname).to.eq('linux');
  })

  it('should return slugified string for name parameter', function() {
    expect(ModelHelpers.getSlug("Adam's Music [1]")).to.eq('adams_music_1');
  })

  it('should return an object for an array based on key parameter', function() {
    var repos_array = [
      {
        slug: 'adams_music_1',
        path: '~/Music [1]',
        type: 'repo'
      },
      {
        slug: 'adams_music_2',
        path: '~/Music [2]',
        type: 'repo'
      },
    ];

    var repos_object = {
      adams_music_1: {
        slug: 'adams_music_1',
        path: '~/Music [1]',
        type: 'repo'
      },
      adams_music_2: {
        slug: 'adams_music_2',
        path: '~/Music [2]',
        type: 'repo'
      },
    }

    expect(ModelHelpers.makeObject(repos_array, 'slug')).to.deep.equal(repos_object);
  })
})
