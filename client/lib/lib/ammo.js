// Due to a bug when minifying ammo.js, physics completely mess up
// No idea why, but ammo.js was already minified and perhaps another minification screws up some things
// Meteor doesn't provide a way for us to ignore some files from minification, we have to introduce
// a hacky way to load the file manually
// See http://stackoverflow.com/questions/14197398/how-to-include-javascript-from-a-cdn-in-meteor

var script = document.createElement('script');

script.src = 'lib/ammo.js';

document.getElementsByTagName('head')[0].appendChild(script);
