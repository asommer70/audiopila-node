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

  play: (slug, callback) => {

    if (PlayerApi.audio == undefined) {
      DataApi.findAudio(slug, (audio) => {
        console.log('PlayerApi.play...');
        PlayerApi.audio = audio;

        PlayerApi.child = spawn('play', [audio.path, 'trim', audio.playbackTime]);

        PlayerApi.child.stderr.on('data', (data) => {
          data = data + "";
          data = data.split(' ')[1];

          PlayerApi.duration = moment.duration(data).asSeconds();
          // console.log('duration:', duration);
          // events.emit('playing');
        });

        callback({message: 'playing', audio: PlayerApi.audio});
      });
    }  else {
      PlayerApi.child = spawn('play', [PlayerApi.audio.path, 'trim', PlayerApi.audio.playbackTime]);

      PlayerApi.child.stderr.on('data', (data) => {
        data = data + "";
        data = data.split(' ')[1];

        PlayerApi.duration = moment.duration(data).asSeconds();
        // console.log('duration:', duration);
        // events.emit('playing');
      });

      callback({message: 'playing', audio: PlayerApi.audio});
    }
  },

  pause: (slug, callback) => {
    // events.emit('paused', {duration: duration});
    PlayerApi.child.kill();
    PlayerApi.audio.playbackTime = PlayerApi.duration;
    callback({message: 'paused', duration: PlayerApi.duration, audio: PlayerApi.audio})
  },

  forward: (slug, callback) => {
    // events.emit('paused', {duration: duration});
    PlayerApi.audio.playbackTime = PlayerApi.duration + 5;

    PlayerApi.child.kill();

    PlayerApi.play(PlayerApi.audio.slug, (audio) => {
      callback({message: 'forwarded', duration: PlayerApi.duration, audio: PlayerApi.audio})
    })
  },

  backward: (slug, callback) => {
    // events.emit('paused', {duration: duration});
    PlayerApi.audio.playbackTime = PlayerApi.duration - 5;

    PlayerApi.child.kill();

    PlayerApi.play(PlayerApi.audio.slug, (audio) => {
      callback({message: 'forwarded', duration: PlayerApi.duration, audio: PlayerApi.audio})
    })
  }
}

module.exports = PlayerApi;
