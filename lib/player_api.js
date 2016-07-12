const spawn = require('child_process').spawn;
const moment = require('moment');
const EventEmitter = require('events');
const fs = require('fs');

const DataApi = require('./data_api');

const events = new EventEmitter();

var PlayerApi = {
  child: undefined,
  duration: 0,
  audio: undefined,
  state: undefined,

  play: (slug, callback) => {
    if (PlayerApi.state == 'playing') {
      // If an Audio is currently playing pause it and play the new one, if it's different than the current one.
      if (PlayerApi.audio.slug != slug) {
        PlayerApi.pause(slug, (data) => {
          PlayerApi.play(slug, (data) => {});
        })
      }
    } else {
      if (PlayerApi.audio == undefined) {
        // Find Audio and play it.
        DataApi.findAudio(slug, (audio) => {
          console.log('PlayerApi.play...');
          PlayerApi.playChild(audio);
          PlayerApi.state = 'playing';

          callback({message: 'playing', audio: PlayerApi.audio});
        });
      } else {
        // Play new Audio.
        if (PlayerApi.audio.slug != slug) {
          DataApi.findAudio(slug, (audio) => {
            console.log('PlayerApi.play new audio slug:', slug);
            PlayerApi.playChild(audio);
            PlayerApi.state = 'playing';

            callback({message: 'playing', audio: PlayerApi.audio});
          });
        } else {
          // Play current Audio.
          console.log('PlayerApi.play current audio slug:', PlayerApi.audio.slug);
          PlayerApi.playChild(PlayerApi.audio);
          PlayerApi.state = 'playing';

          callback({message: 'playing', audio: PlayerApi.audio});
        }
      }
    }
  },

  pause: (slug, callback) => {
    if (PlayerApi.child) {
      PlayerApi.child.kill();

      PlayerApi.audio.playbackTime = PlayerApi.duration;
      PlayerApi.state = 'paused';
      callback({message: 'paused', duration: PlayerApi.duration, audio: PlayerApi.audio})
    } else {
      callback({message: 'nothing'})
    }
  },

  seek: (slug, direction, callback) => {
    var diffNum;
    if (direction == 'forward') {
      diffNum = 5;
    } else {
      diffNum = -5;
    }

    if (PlayerApi.audio) {
      console.log('going:', direction, 'diffNum:', diffNum, 'PlayerApi.audio.playbackTime:', PlayerApi.audio.playbackTime, 'new PlayerApi.audio.playbackTime:', PlayerApi.audio.playbackTime + diffNum);

      if ((PlayerApi.audio.playbackTime + diffNum < 0) || (PlayerApi.audio.playbackTime + diffNum > PlayerApi.audio.duration)) {
        PlayerApi.audio.playbackTime = 0;
      } else {
        PlayerApi.audio.playbackTime += diffNum;
      }

      if (PlayerApi.child) {
        PlayerApi.child.kill();
      }

      PlayerApi.playChild(PlayerApi.audio);
      PlayerApi.state = 'playing';

      callback({message: direction + 'ed', audio: PlayerApi.audio});
    } else {
      DataApi.findAudio(slug, (audio) => {
        console.log('going:', direction, 'audio.playbackTime:', audio.playbackTime, 'new audio.playbackTime:', audio.playbackTime + diffNum);

        if ((audio.playbackTime + diffNum < 0) || (audio.playbackTime + diffNum > audio.duration)) {
          audio.playbackTime = 0;
        } else {
          audio.playbackTime += diffNum;
        }

        PlayerApi.playChild(audio);
        PlayerApi.state = 'playing';

        callback({message: direction + 'ed', audio: PlayerApi.audio});
      });
    }
  },

  playChild: (audio) => {
    PlayerApi.audio = audio;

    PlayerApi.child = spawn('play', [audio.path, 'trim', audio.playbackTime]);

    PlayerApi.child.stderr.on('data', (data) => {
      data = data + "";
      data = data.split(' ')[1];

      PlayerApi.duration = moment.duration(data).asSeconds();
    });
  }
}

module.exports = PlayerApi;
