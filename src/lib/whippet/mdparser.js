var md = require('marked'),
	util = require('util');


// set default options
md.setOptions({
	breaks: false, // gfm line breaks
	smartypants: true, // proper quotes
	highlight: function (code) {
		return require('highlight.js').highlightAuto(code).value;
	}
});

module.exports = function( content ){
	return md( content );
}