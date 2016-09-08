const spawn = require('child_process').spawn;
const moment = require('moment');
const EventEmitter = require('events');
const fs = require('fs');
var probe = require('node-ffprobe');

var Audio = require('./index').audio;

var Player = {
  child: undefined,
  duration: 0,
  audio: undefined,
  state: undefined,

  play: function(slug, callback) {
    if (this.state == 'playing') {
      // If an Audio is currently playing pause it and play the new one, if it's different than the current one.
      console.log('this.state:', this.state);
      if (this.audio.slug != slug) {
        this.pause(slug, (data) => {
          this.play(slug, (data) => {});
        })
      } else {
        this.pause(slug, (data) => {
          console.log('Already playing...', data);
          callback(data);
        })
      }
    } else {
      if (this.audio == undefined) {
        // Find Audio and play it.
        Audio.findBySlug(slug)
          .then((audio) => {
            console.log('Playing:', audio.get('name'));
            this.playChild(audio);
            this.state = 'playing';

            callback({message: 'playing', audio: this.audio});
          });
      } else {
        // Play new Audio.
        if (this.audio.get('slug') != slug) {
          Audio.findBySlug(slug)
            .then((audio) => {
              console.log('Playing:', audio.get('name'));
              this.playChild(audio);
              this.state = 'playing';

              callback({message: 'playing', audio: this.audio});
            });
        } else {
          // Play current Audio
          console.log('this.play current audio slug:', this.audio.slug);
          this.playChild(this.audio);
          this.state = 'playing';

          callback({message: 'playing', audio: this.audio});
        }
      }
    }
  },

  pause: function(slug, callback) {
    if (this.child) {
      this.child.kill();

      this.audio.set('playbackTime', this.duration);
      this.state = 'paused';

      if (this.hasOwnProperty('audio')) {
        this.audio.set('playedTime', Date.now());
      }

      this.audio.save()
        .then((audio) => {
          console.log('audio saved:', audio.get('name'));
          callback({message: 'Updated audio: ' + audio.get('slug'), duration: this.duration, audio: audio})
        })
    } else {
      callback({message: 'nothing', audio: {}})
    }
  },

  seek: function(slug, direction, callback) {
    var diffNum;
    if (direction == 'forward') {
      diffNum = 5;
    } else {
      diffNum = -5;
    }

    if (this.audio) {
      console.log('going:', direction, 'diffNum:', diffNum, 'this.audio.playbackTime:', this.audio.get('playbackTime'), 'new this.audio.playbackTime:', this.audio.get('playbackTime') + diffNum);

      if ((this.audio.get('playbackTime') + diffNum < 0) || (this.audio.get('playbackTime') + diffNum > this.audio.get('duration'))) {
        this.audio.set('playbackTime', 0);
      } else {
        this.audio.set('playbackTime', this.audio.get('playbackTime') + diffNum);
      }

      if (this.child) {
        this.child.kill();
      }

      this.playChild(this.audio);
      this.state = 'playing';

      callback({message: direction + 'ed', audio: this.audio});
    } else {
      Audio.findBySlug(slug, (audio) => {


        Audio.findBySlug(slug)
          .then((audio) => {
            console.log('going:', direction, 'audio.playbackTime:', this.audio.get('playbackTime'), 'new audio.playbackTime:', this.audio.get('playbackTime') + diffNum);

            if ((this.audio.get('playbackTime') + diffNum < 0) || (this.audio.get('playbackTime') + diffNum > audio.get('duration'))) {
              this.audio.set('playbackTime', 0);
            } else {
              this.audio.set('playbackTime', this.audio.get('playbackTime') + diffNum);
            }

            this.playChild(audio);
            this.state = 'playing';

            callback({message: direction + 'ed', audio: this.audio});
          });
      });
    }
  },

  playChild: function(audio) {
    this.audio = audio;

    this.child = spawn('play', [audio.get('path'), 'trim', audio.get('playbackTime')]);

    this.child.stderr.on('data', (data) => {
      data = data + "";
      data = data.split(' ')[1];

      this.duration = moment.duration(data).asSeconds();
    });
  }
}

module.exports = Player;
