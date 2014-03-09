/* Static site generator */


var frd = require('./whippet/filer.js'),
	mdp = require('./whippet/mdparser.js'),
	mup = require('./whippet/mustacheparser.js'),
	fmp = require('./whippet/fmparser.js'),
	util = require('util'),
	path = require('path'),
	fs = require('fs');


// some defaults
var defaultPageTemplage = 'default-page.html';
var defaultIndexTemplate = 'default-index.html';
var defaultBlogIndexTemplate = 'default-blog-index.html';

var pagesFolder = 'pages';
var blogFolder = 'blog';
var includesFolder = 'includes';



// Read configuration
var config = JSON.parse( fs.readFileSync( 'config.json', {encoding: 'utf8'} ).toString() );

// Read sitemap
var sitemap = JSON.parse( fs.readFileSync( 'sitemap.json', {encoding: 'utf8'} ).toString() );


// Create the core structure
frd.createStructure();


// Copy assets and lib
frd.copy( 'assets', 'site/assets', function(err){});
frd.copy( 'lib', 'site/lib', function(err){});



// load the includes
var includesList = frd.listFiles( includesFolder );
var includes = {};
for ( var i = 0; i < includesList.length; i++ ){
	var includeName = path.basename( includesList[i], '.html' );
	var includeContent = fs.readFileSync( includesList[i], {encoding: 'utf8'} ).toString();
	includes[ includeName ] = includeContent;
}


// Create pages
var pagemds = frd.listFiles( pagesFolder );
pagemds.push( 'index.md' );
for( var i = 0; i < pagemds.length; i++ ){
	
	// Raw text string
	var raw = frd.readFile( pagemds[i] );
	
	
	// Page variables (as defined in the md document)
	var pageVars = fmp( raw );

	// populate pageVariables with defaults and cofig
	
	if ( !pageVars.template || pageVars.template.length === 0 )	{
		pageVars.template = defaultPageTemplage;
		
		if ( i === pagemds.length-1 ) pageVars.template = defaultIndexTemplate;
	}
	
	for( var key in config ){
		pageVars[key] = config[key];
	}
	

	// mustache parse one (insert custom includes)
	pageVars.content = mup( pageVars.content, includes );
		
	// markdown parse
	pageVars.content = mdp( pageVars.content );
	
	
	// mustache parse two (template)
	var template = fs.readFileSync( 'templates/'+ pageVars.template, {encoding: 'utf8'} ).toString();
	var parse = mup( template, pageVars, includes );
	
	
	// write to a file	
	var outFile = 'site/'+pagesFolder+'/' + path.basename( pagemds[i], '.md' ) + '.html';	
	if ( i === pagemds.length-1 ) outFile = 'site/index.html'; // index.html
	frd.saveFile( outFile, parse );
}



// if the site has a blog
if ( config.blog ){


	// Create blog posts
	var blogmds = frd.listFiles( blogFolder );	
	
	var posts = [];
	
	for( var i = 0; i < blogmds.length; i++ ){
				
		// Raw text string
		var raw = frd.readFile( blogmds[i] );
		
		
		// Page variables (as defined in the md document)
		var pageVars = fmp( raw );
	
		// populate pageVariables with defaults and cofig
		if ( !pageVars.template || pageVars.template.length === 0 )	pageVars.template = defaultPageTemplage;
		for( var key in config ){
			pageVars[key] = config[key];
		}
	
		// post date
		var dateString = path.basename( blogmds[i], '.md' ).split('-');
		for ( var j = 0; j < dateString.length; j++ ){
			dateString[j] = parseInt( dateString[j] );
		}
		//var postDate = new Date( dateString );
		//var postDate = Date.apply( this, dateString );
		var postDate = new Date( dateString[0], dateString[1]-1, dateString[2], dateString[3] | 0, dateString[4] | 0, dateString[5] | 0 );
		pageVars.postDate = postDate;
		
	
		// mustache parse one (insert custom includes)
		pageVars.content = mup( pageVars.content, includes );
		
			
		// markdown parse	
		pageVars.content = mdp( pageVars.content );
		
		
		// mustache parse two (template)
		var template = fs.readFileSync( 'templates/'+ pageVars.template, {encoding: 'utf8'} ).toString();
		var parse = mup( template, pageVars, includes );
		
		
		// write to a file
		var outFile = 'site/'+blogFolder+'/' + path.basename( blogmds[i], '.md' ) + '.html';	
		frd.saveFile( outFile, parse );
		
		// add it to the posts list
		posts.push({
			url: path.basename( blogmds[i], '.md' ) + '.html',
			title: pageVars.title,
			intro: pageVars.intro,
			date: pageVars.postDate,
			id: i
		})
	}
	
	// sort the blog posts by date (last one should be the first in the array)
	var dateSorter = function dateSorter( a, b){
		return b.date - a.date;
	}	
	posts.sort( dateSorter );	
	
		
	// create blog index
	// how many pages are needed?
	var allIndexes = Math.ceil( posts.length / config.postsPerPage );
	
	// create index function
	var createIndex = function createIndex( index, posts ){
				
		// index data (page number and posts to display)
		var indexData = {		
			allPages: allIndexes,
			thisPageNumber: index,
			posts: posts
		};
		

		if ( index > 1 ){
			indexData.prevPageNumber = index-1;		
			indexData.prevPage = 'index-' + (index-1) + '.html';
			if ( index === 2 ) indexData.prevPage = 'index.html';
		}
		
		if ( index < allIndexes ){
			indexData.nextPageNumber = index + 1;
			indexData.nextPage = 'index-' + (index+1) + '.html';
		}
		
	
		// read the template
		var template = fs.readFileSync( 'templates/' + defaultBlogIndexTemplate, {encoding: 'utf8'} ).toString();
		
		// mustache parse the template
		var parse = mup( template, indexData, includes );
		
		var outFile = 'site/' + blogFolder + '/' + 'index-' + index + '.html';
		if ( index === 1 ) outFile = 'site/' + blogFolder + '/' + 'index.html';
		
		frd.saveFile( outFile, parse );
		
	};
		
	var pageNumber = 1;
	var pagePosts = [];
	for( var i = 1; i < posts.length+1; i ++ ){
		
		pagePosts.push( posts[i-1] );
		
		if ( i % config.postsPerPage === 0 ){
			createIndex( pageNumber, pagePosts );
			pageNumber++;
			pagePosts = [];			
		}
	}
	createIndex( pageNumber, pagePosts );
	
}





// Qick tests

//console.log( frd.readFile( 'pages/about.md' ) );
//console.log( frd.listFiles( 'pages' ) );


//frd.createStructure();

//console.log( frd.listFiles( 'site' ) );

/*
frd.copy( 'assets', 'site/assets', function(err){
	if ( err ) throw err;
} );
*/

