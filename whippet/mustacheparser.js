var mu = require('mustache'),
	util = require('util');

module.exports = function( content, view, customIncludes ){
	
	var parsedContent = mu.render( content, view, customIncludes );
	
	return parsedContent;
}