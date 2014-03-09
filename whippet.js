/* Static site generator */


var fr = require('./whips/filereader.js'),
	mdp = require('./whips/mdparser.js'),
	mup = require('./whips/mustacheparser.js'),
	util = require('util'),
	fs = require('fs');


// read config and the sitemap	
var config = JSON.parse( fs.readFileSync( 'config.json', {encoding: 'utf8'} ).toString() );
var sitemap = JSON.parse( fs.readFileSync( 'sitemap.json', {encoding: 'utf8'} ).toString() );



