
var fm = require('front-matter'),
	util = require('util');

module.exports = function ( contents ){
	
	var fmparse = fm( contents );
	
	var page = fmparse.attributes;
	page.content = fmparse.body;

	return page;
};