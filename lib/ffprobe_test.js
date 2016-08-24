var probe = require('node-ffprobe');

//var track = '/home/adam/Music/Weezer - Weezer (Blue Album)/01 - Weezer - My Name is Jonas.ogg';
//var track = '/home/adam/Music/Fellowship_of_the_Ring/JRR Tolkien - The Fellowship of the Ring - Disc 13/25 - JRR Tolkien - Chapter 18 - Lothlorien (07 of 20).mp3'

var track = '/home/adam/Music/Velvet_Revolver/Contraband/Disc_1_-_9_-_Set_Me_Free.ogg'

probe(track, function(err, probeData) {
  console.log('err:', err);
  console.log('probeData:', probeData);
});
