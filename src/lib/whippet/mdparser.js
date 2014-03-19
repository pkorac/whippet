var md = require('marked'),
	util = require('util');


// set default options
md.setOptions({
	breaks: false, // gfm line breaks (dissable, it parses html fine)
	smartypants: true // proper quotes
});

module.exports = function( content ){
	return md( content );
}