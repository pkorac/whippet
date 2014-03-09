var md = require('marked'),
	util = require('util');


// set default options
md.setOptions({
	breaks: true, // gfm line breaks
	smartypants: true // proper quotes
});

module.exports = function( content ){
	return md( content );
}