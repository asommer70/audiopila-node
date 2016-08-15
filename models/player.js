const spawn = require('child_process').spawn;
const moment = require('moment');
const EventEmitter = require('events');
const fs = require('fs');
var probe = require('node-ffprobe');

var Audio = require('./audio');

var Player = {
  child: undefined,
  duration: 0,
  audio: undefined,
  state: undefined,

  play: function(slug, callback) {
    if (this.state == 'playing') {
      // If an Audio is currently playing pause it and play the new one, if it's different than the current one.
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
        Audio.findBySlug(slug, (audio) => {
          console.log('Playing:', audio.slug, audio.path);
          this.playChild(audio);
          this.state = 'playing';

          callback({message: 'playing', audio: this.audio});
        });
      } else {
        // Play new Audio.
        if (this.audio.slug != slug) {
          Audio.findBySlug(slug, (audio) => {
            console.log('this.play new audio slug:', slug);
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

      this.audio.playbackTime = this.duration;
      this.state = 'paused';

      if (this.hasOwnProperty('audio')) {
        this.audio.playedTime = Date.now();
      }

      Audio.update(this.audio, (data) => {
        callback({message: data.message, duration: data.audio.duration, audio: data.audio})
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
      console.log('going:', direction, 'diffNum:', diffNum, 'this.audio.playbackTime:', this.audio.playbackTime, 'new this.audio.playbackTime:', this.audio.playbackTime + diffNum);

      if ((this.audio.playbackTime + diffNum < 0) || (this.audio.playbackTime + diffNum > this.audio.duration)) {
        this.audio.playbackTime = 0;
      } else {
        this.audio.playbackTime += diffNum;
      }

      if (this.child) {
        this.child.kill();
      }

      this.playChild(this.audio);
      this.state = 'playing';

      callback({message: direction + 'ed', audio: this.audio});
    } else {
      Audio.findBySlug(slug, (audio) => {
        console.log('going:', direction, 'audio.playbackTime:', audio.playbackTime, 'new audio.playbackTime:', audio.playbackTime + diffNum);

        if ((audio.playbackTime + diffNum < 0) || (audio.playbackTime + diffNum > audio.duration)) {
          audio.playbackTime = 0;
        } else {
          audio.playbackTime += diffNum;
        }

        this.playChild(audio);
        this.state = 'playing';

        callback({message: direction + 'ed', audio: this.audio});
      });
    }
  },

  playChild: function(audio) {
    this.audio = audio;

    this.child = spawn('play', [audio.path, 'trim', audio.playbackTime]);

    this.child.stderr.on('data', (data) => {
      data = data + "";
      data = data.split(' ')[1];

      this.duration = moment.duration(data).asSeconds();
    });
  }
}

module.exports = Player;
