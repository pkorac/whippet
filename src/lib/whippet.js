/* 

   # Whippet.js

  ## Static site generator
     Created by Peter Koraca

*/

var frd = require('./whippet/filer.js'),
	mdp = require('./whippet/mdparser.js'),
	mup = require('./whippet/mustacheparser.js'),
	fmp = require('./whippet/fmparser.js'),
	searcher = require('./whippet/searchIndexer.js'),
	util = require('util'),
	path = require('path'),
	fs = require('fs'),
	rss = require('rss');

function whip(){
	// DEFAULTS
	//////////////////////////////////////////////////////
	var defaultPageTemplage = 'page.html';
	var defaultIndexTemplate = 'index.html';
	var defaultBlogIndexTemplate = 'blog-index.html';
	var defaultBlogArchiveTemplate = 'blog-archive.html';
	var defaultBlogCategoryTemplate = 'blog-category.html';
	var defaultOtherCategory = 'other';
	
	var pagesFolder = 'pages';
	var blogFolder = 'blog';
	var includesFolder = 'includes';
	var templatesFolder = 'templates';
	var usedFilesFile = 'site/.usedfiles.json';
	
	
	// Read configuration
	var config = JSON.parse( frd.readFile( 'config.json' ) );
	if ( config.defaultOtherCategory ) defaultOtherCategory = config.defaultOtherCategory;
	
	// Read menu
	var menu = JSON.parse( frd.readFile( 'menu.json' ) );
	
	// Used files
	var usedFiles = {};
	if ( fs.existsSync( usedFilesFile ) ){
		usedFiles = JSON.parse( frd.readFile( usedFilesFile ) );
	}
	
	// CORE STRUCTURE
	//////////////////////////////////////////////////////
	frd.createStructure();
	
	
	// COPY ASSETS AND LIBRARY (CSS, JS, ETC.)
	//////////////////////////////////////////////////////
	frd.copy( 'assets', 'site/assets', function(err){});
	frd.copy( 'lib', 'site/lib', function(err){});
	
	
	
	// LOAD INCLUDES
	//////////////////////////////////////////////////////
	var includesList = frd.listFiles( includesFolder );
	var includes = {};
	for ( var i = 0; i < includesList.length; i++ ){
		var includeName = path.basename( includesList[i], '.html' );
		var includeContent = fs.readFileSync( includesList[i], {encoding: 'utf8'} ).toString();
		includes[ includeName ] = includeContent;
	}
	
	
	
	
	
	//////////////////////////////////////////////////////
	// RETURN MENU HELPER FUNCTION
	var returnMenu = function returnMenu( pageURL, parentPage ){
		
		pageURL = pageURL.substring( 0, pageURL.lastIndexOf('.') ) + '.html';
		var theMenu = [];
		var inFolder = false;
		
		// check if the path needs the '../' in front
		if ( pageURL.indexOf( pagesFolder ) !== -1 || pageURL.indexOf( blogFolder ) !== -1 ){
			inFolder = true;
		}
	
			
		// check if this page is in the menu and should be marked 'active'
		for( var i = 0; i < menu.menu.length; i++ ){
	
			// re-create the menu obj
			theMenu[i] = {
				title: menu.menu[i].title,
				url: menu.menu[i].url
			};
			
			// mark it as active
			if( theMenu[i].url === pageURL || path.basename( theMenu[i].url ) === parentPage ) theMenu[i].active = true;
			if( pageURL.indexOf( blogFolder ) !== -1 && theMenu[i].url.indexOf( blogFolder ) !== -1 ) theMenu[i].active = true;
			
			// change the path
			if ( inFolder ) theMenu[i].url = '../' + theMenu[i].url;
		}	
		
		return theMenu;
	}
	


	// rebuild blog index pages on either template change or blog post changes
	var rebuildBlogIndexes = false;
		
		
	//////////////////////////////////////////////////////	
	// TEMPLATE CHANGE CHECK
	var templatesChanged = false;
	var templates = frd.listFiles( templatesFolder );
	templates = templates.concat( frd.listFiles( includesFolder ) );
	templates.push( 'config.json' );
	templates.push( 'menu.json' );
	for ( var i = 0; i < templates.length; i++ ){
		if ( usedFiles[ templates[i] ] ){
			if ( usedFiles[ templates[i] ] !== fs.statSync( templates[i] ).size ){
				templatesChanged = true;
				rebuildBlogIndexes = true;
				usedFiles[ templates[i] ] = fs.statSync( templates[i] ).size;
			}
		} else {
			templatesChanged = true;
			rebuildBlogIndexes = true;
			usedFiles[ templates[i] ] = fs.statSync( templates[i] ).size;
		}
	}
	
	//////////////////////////////////////////////////////	
	// PAGES
	var pagemds = frd.listFiles( pagesFolder );
	pagemds.push( 'index.md' );	
	pagemds = pagemds.concat( frd.listFiles( blogFolder ) );
	
	var blogPosts = [];
		
	for( var i = 0; i < pagemds.length; i++ ){
		
		var shouldParse = false;
		if ( usedFiles[ pagemds[i] ] ){
			if ( usedFiles[ pagemds[i] ] !== fs.statSync( pagemds[i] ).size ){
				shouldParse = true;
				usedFiles[ pagemds[i] ] = fs.statSync( pagemds[i] ).size;
			}
		} else {
			shouldParse = true;
			usedFiles[ pagemds[i] ] = fs.statSync( pagemds[i] ).size;
		}
		
		if ( templatesChanged ) shouldParse = true;		
		
		shouldParse = true;	
		if ( shouldParse ){
			// Raw text string
			var raw = frd.readFile( pagemds[i] );
						
			// Page variables (as defined in the md document)
			var pageVars = fmp( raw );		
		
			// populate pageVariables with defaults, menu and cofig	
			if ( !pageVars.template || pageVars.template.length === 0 )	{
				pageVars.template = defaultPageTemplage;
				
				//if ( i === pagemds.length-1 ) pageVars.template = defaultIndexTemplate;
				if ( pagemds === 'index.md' ) pageVars.template = defaultIndexTemplate;
			}
			
			for( var key in config ){
				pageVars[key] = config[key];
			}
			pageVars.menu = returnMenu( pagemds[i], pageVars.parentPage );
			pageVars.url = path.basename( pagemds[i], '.md' ) + '.html';
			
			
			// blog posts
			if ( pagemds[i].split( path.sep )[0] === 'blog' ){
				var dateString = path.basename( pagemds[i], '.md' ).split('-');
				for ( var j = 0; j < dateString.length; j++ ){
					dateString[j] = parseInt( dateString[j] );
				}
				var postDate = new Date( dateString[0], dateString[1]-1, dateString[2], dateString[3] | 0, dateString[4] | 0, dateString[5] | 0 );
				pageVars.postDate = postDate;
				pageVars.postDateFormatted = '' + postDate.getDate() + '. ' + ( postDate.getMonth() + 1 ) + '. ' + postDate.getFullYear();
				pageVars.id = 'post-' + postDate.getDate() + '-' + ( postDate.getMonth() + 1 ) + '-' + postDate.getFullYear() + '-' + postDate.getHours() + '-' + postDate.getMinutes() + '-' + postDate.getSeconds();
				blogPosts.push( pageVars );
				rebuildBlogIndexes = true;				
			}
			
					
			// add page to search index
			searcher.addToIndex( {
				title: pageVars.title,
				keywords: pageVars.keywords,
				content: pageVars.content,
				url: pagemds[i]
			} );
		
			// mustache parse one (insert custom includes)
			pageVars.content = mup( pageVars.content, includes );
				
			// markdown parse
			pageVars.content = mdp( pageVars.content );
			
			
			// blog posts intro text
			if ( pagemds[i].split( path.sep )[0] === 'blog' ){
				if ( !pageVars.intro ) pageVars.intro = pageVars.content.substring( 0, config.introLength || 500 );
			}
			
			// mustache parse two (template)
			var template = fs.readFileSync( templatesFolder + '/'+ pageVars.template, {encoding: 'utf8'} ).toString();
			var parse = mup( template, pageVars, includes );			
			
			// write to a file
			var outFile = 'site/'+ pagemds[i].substring( 0, pagemds[i].lastIndexOf('.') ) + '.html';
			
			if ( pagemds[i] === 'index.md' ) outFile = 'site/index.html'; // index.html
			
			frd.saveFile( outFile, parse );	
			
		}
	}
	
		
	// BLOG INDEX
	//////////////////////////////////////////////////////
	rebuildBlogIndexes = true;
	if ( rebuildBlogIndexes ){
	
	
	
		/////////////////////////
		// POST SORTER
		// sort posts by date
		var dateSorter = function dateSorter( a, b){
			return b.postDate - a.postDate;
		}	
		blogPosts.sort( dateSorter );
	
	
		/////////////////////////
		// BUID the RSS feed

		var feed = new rss({
			title: config.site.title,
		    description: config.site.description,
		    feed_url: config.site.url + '/' + config.site.rssfile,
		    site_url: config.site.url,
		    image_url: config.site.url + '/assets/site-logo.jpg',
		    managingEditor: config.site.author,
		    webMaster: config.site.author,
		    copyright: '©' + ( new Date().getFullYear() ) + ' ' + config.site.author,
		    language: config.site.language,
		    categories: config.site.categories,
		    pubDate: (new Date()).toString()
		});
				
		for ( var i = 0; i < blogPosts.length; i++ ){
			var post = blogPosts[i];
			feed.item({
				title:  post.title,
			    description: post.intro,
			    url: config.site.url + '/' + blogFolder + '/' + post.url,
			    guid: post.id,
			    categories: config.site.categories,
			    author: config.site.author,
			    date: new Date()
			});
		}
		
		var feedXML = feed.xml({ indent: true });
		
		// write feed to a file
		frd.saveFile( 'site/' + config.site.rssfile, feedXML );
		
	
		/////////////////////////
		// ARCHIVES
		// archives obj
		var archives = {};
		var archivesArray = [];
		
		// Archive pages creation
		var archiveMaker = function archiveMaker(){		
			
			var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
			
			// fill archives
			var fillArchives = function fillArchives( year, month ){

				for ( var i = 0; i < blogPosts.length; i++ ){
					if ( blogPosts[i].postDate.getFullYear() === year && blogPosts[i].postDate.getMonth() + 1 === month ){
					
						var indexName = 'archives-' + year + '-' + month;
						if ( archives[ indexName ] ){
							archives[ indexName ].posts.push( blogPosts[i] );
						} else {
							archives[ indexName ] = {
								year: year,
								month: month,
								monthString: monthNames[ month-1 ],
								posts: [ blogPosts[i] ],
								url: indexName + '.html'
							}
						}

					}
				}
			};
		
		
			// calculate months
			var min = blogPosts[0].postDate;
			var max = blogPosts[ blogPosts.length-1 ].postDate;
			
			var diff = ( max.getFullYear() - min.getFullYear() ) *12;
			diff -= min.getMonth() + 1;
			diff += max.getMonth() + 1;
			diff += 1; // to include the last month
		
			var archiveMonth = min.getMonth() + 1;
			var archiveYear = min.getFullYear();
			for( var i = 0; i < diff; i++ ){

				fillArchives( archiveYear, archiveMonth )
								
				if ( archiveMonth === 12 ) {
					archiveMonth = 0;
					archiveYear++;
				}
				archiveMonth++;
			}
			
			var counter = 0;
			for ( var key in archives ){
				archivesArray[counter] = archives[key];
				counter++;
			}
				
			
			
		}();
		
		
		/////////////////////////
		// CATEGORIES
		var categories = {};
		var categoriesArray = [];
		var categoriser = function categoriser(){
			
			categories[defaultOtherCategory] = [];
			
			for( var i = 0; i < blogPosts.length; i++ ){
				if ( blogPosts[i].category ) {
					if ( categories[ blogPosts[i].category ] ){
						categories[ blogPosts[i].category ].push( blogPosts[i] );
					} else {
						categories[ blogPosts[i].category ] = [ blogPosts[i] ];
					}
				} else {
					categories[defaultOtherCategory].push( blogPosts[i] );
				}
			}
			
			for( var key in categories ) {
				categoriesArray.push( { 
					'category': key, 
					'posts': categories[key], 
					url: key + '.html' } );
			}		
			
		}();
			
		
		
		// CREATE THE ARCHIVE PAGES
		var archivePageMaker = function archivePageMaker(){
			// create the pages
			for ( var i in archives ){
				var a = archives[i];
				
				var indexData = {
					archiveYear: a.year,
					archiveMonth: a.month,
					archiveMonthString: a.monthString,
					archiveUrl: i + '.html',
					archives: archivesArray,
					posts: archives[i].posts,
					categories: categoriesArray
				}
				
				for( var key in config ) {
					indexData[key] = config[key];
				}
				
				indexData.menu = returnMenu( blogFolder + '/' + indexData.archiveUrl );
								
				// read the template
				var template = fs.readFileSync( templatesFolder + '/' + defaultBlogArchiveTemplate, {encoding: 'utf8'} ).toString();
				
				// mustache parse the template
				var parse = mup( template, indexData, includes );
			
				// save it
				var outFile = 'site/' + blogFolder + '/' + indexData.archiveUrl;
			
				frd.saveFile( outFile, parse );
			}
		}();
		
		
		// CREATE THE CATEGORIES PAGES
		var categoryPageMaker = function categoryPageMaker(){
			for( var i in categoriesArray ){
				
				var indexData = {
					category: categoriesArray[i].category,
					categoryUrl: categoriesArray[i].url,
					posts: categoriesArray[i].posts,
					categories: categoriesArray,
					archives: archivesArray
				}
				
				for( var key in config ) {
					indexData[key] = config[key];
				}
				
				indexData.menu = returnMenu( blogFolder + '/' + indexData.categoryUrl );
				
				// read the template
				var template = fs.readFileSync( templatesFolder + '/' + defaultBlogCategoryTemplate, {encoding: 'utf8'} ).toString();
				
				// mustache parse the template
				var parse = mup( template, indexData, includes );
			
				// save it
				var outFile = 'site/' + blogFolder + '/' + indexData.categoryUrl;
			
				frd.saveFile( outFile, parse );
				
			}
		}();
		
		
		
		
		
		/////////////////////////
		// INDEX PAGES
		// normal paging
		var allIndexes = Math.ceil( blogPosts.length / config.postsPerPage );
		
		// Index creating function
		var createIndex = function createIndex( index, blogPosts ){
					
			// index data (page number and posts to display)
			var indexData = {		
				allPages: allIndexes,
				thisPageNumber: index,
				posts: blogPosts,
				title: 'Blog',
				archives: archivesArray,
				categories: categoriesArray
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
			
			
			// populate indexData with defaults, menu and config
			for( var key in config ){
				indexData[key] = config[key];
			}
	
	
			// add the menu
			if ( index === 1 ){
				indexData.menu = returnMenu( blogFolder + '/index.html', 'blog' );
			} else {
				indexData.menu = returnMenu( blogFolder + '/index-' + index + '.html', 'blog' );
			}
			
			
	
			// read the template
			var template = fs.readFileSync( templatesFolder + '/' + defaultBlogIndexTemplate, {encoding: 'utf8'} ).toString();
			
			
			// mustache parse the template
			var parse = mup( template, indexData, includes );
			
			// save it
			var outFile = 'site/' + blogFolder + '/' + 'index-' + index + '.html';
			if ( index === 1 ) outFile = 'site/' + blogFolder + '/' + 'index.html';
			
			frd.saveFile( outFile, parse );
			
		};
		
		
		// go through the posts and create
		// an index page for every 'postsPerPage' posts
		var pageNumber = 1;
		var pagePosts = [];
		for( var i = 1; i < blogPosts.length+1; i ++ ){
			
			pagePosts.push( blogPosts[i-1] );
			
			if ( i % config.postsPerPage === 0 ){
				createIndex( pageNumber, pagePosts );
				pageNumber++;
				pagePosts = [];			
			}
		}
		createIndex( pageNumber, pagePosts );		
		
	}
	
	
	// update usedFiles file
	frd.saveFile( usedFilesFile, JSON.stringify( usedFiles ) );
	
	
	// SEARCH INDEX
	//////////////////////////////////////////////////////
	var searchIndexContents = JSON.stringify( searcher.getSearchIndex() );
	frd.saveFile( 'site/searchIndex.js', searchIndexContents );
	
	
	
		
	// HELPER FUNCTIONS
	
}



exports.whip = whip;


// Have fun