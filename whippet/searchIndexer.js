var util = require('util');

var searchIndex = [];

exports.addToIndex = function addToIndex( page ){

	// reformat url to .html
	page.url = page.url.substr( 0, page.url.lastIndexOf('.') ) + '.html';

	// remove mustache tags
	page.content = page.content.replace( /\{\{\{[\w\-\_\#\/\>]*\}\}\}/i, "" );
	
	// to do: remove markdown tags or first parse, then remove html tags?
	
	searchIndex.push( page );
};

exports.getSearchIndex = function getSearchIndex(){
	return searchIndex;
};