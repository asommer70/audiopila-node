var exec = require('child_process').execSync;
var spawn = require('child_process').spawn;
var fs = require('fs');
var moment = require('moment');
const EventEmitter = require('events');
const readline = require('readline');

const events = new EventEmitter();

var audio = {
  // path: '~/Music/Loving_the_Alien.ogg',
  path: '~/Music/Babel.mp3',
  playbackTime: 70
}

var command = `play ${audio.path} trim ${audio.playbackTime} &> /tmp/audiopila.output`

// exec(command, function(error, stdout, stderr) {
//   console.log('error:', error);
//   console.log('stdout:', stdout);
//   console.log('stderr:', stderr);
//   fs.readfile('/tmp/audiopila.output', {encoding: 'utf8'}, function(err, data) {
//     console.log('readfile data:', data);
//
//   })
// });



var child = spawn('play', [audio.path, 'trim', audio.playbackTime]);

// console.log('chils.stderr:', child.stderr);

child.stderr.on('data', (data) => {
    // console.log("Got data from child: " + data);
    data = data + "";
    data = data.split(' ')[1];

    var duration = moment.duration(data).asSeconds();
    // console.log('duration:', duration);

    setTimeout(() => {
      events.emit('paused', {duration: duration});
      child.kill();
    }, 5000);
});

events.on('playing', () => {
  console.log('an event occurred!');
});

events.on('paused', (duration) => {
  console.log('duration:', duration);
})

// child.on('exit', function (code, signal) {
//   console.log('code:', code, 'signal:', signal, 'duration:', duration);
// });

// child.stderr.on('data', function(chunk) {
//   console.log('chunk:', chunk);
// })

// child.on('exit', function(event) {
//   console.log('child exited...');
// })

// child.stdout.on('data', function(chunk) {
//   // output will be here in chunks
//   console.log('chunk:', chunk);
// });

// child.stdout.pipe(dest);
