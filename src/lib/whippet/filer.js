var fs = require('fs'),
	path = require('path'),
	util = require('util');


// List files
exports.listFiles = function listFiles( folder ){
	
	var fileList = [];

	var recursor = function recursor( file ){
		if ( path.basename( file, path.extname( file) ).slice(0,1) !== '.' ){
			if ( fs.statSync( file ).isDirectory() ){
	
				var files = fs.readdirSync( file );
				for( var i = 0; i < files.length; i++ ){
					recursor( file + '/' + files[i] );
				}
	
			} else {
				fileList.push( file );
			}	
		}
	};	
	recursor( folder );
	
	return fileList;
}




// Create core site structure
exports.createStructure = function createStructureSync(){
	createFolder( 'site' );
	createFolder( 'site/assets' );
	createFolder( 'site/lib' );
	createFolder( 'site/pages' );
	createFolder( 'site/blog' );
};



//Copy files
exports.copy = function copyFiles( from, to, done ){
	
	if ( from[from.length-1] === '/' ){
		from = from.substring( 0, from.length-1 );
	}
	
	if ( to[to.length-1] === '/' ){
		to = to.substring( 0, to.length-1 );
	}
	
	if ( to.length > 0 ){
		to += '/';	
	}
		
	var fromLength = from.length + 1;
	
	var files = this.listFiles( from );

	if ( files.length > 0 ){
		var counter = 0;
		var copymachine = function copymachine(){

			var fromFile = files[counter];
			var toFile = to + files[counter].substring( fromLength );			
			
			var rewrite = false;
			
			var fromSize = fs.statSync( fromFile ).size;
			var toSize = 0;
			
			if ( fs.existsSync( toFile ) ){				
				toSize = fs.statSync( toFile ).size;
				
				if ( fromSize !== toSize ) rewrite = true;
				
			} else {
				rewrite = true;
			}						
			
			if ( rewrite ){
				
				// create the folder if it doesn't exist
				var toFolder = path.dirname( toFile );
				
				var createFolder = function( folder ){
					if ( !fs.existsSync( folder ) ){
					
						var parent = folder.substring( 0, folder.lastIndexOf( path.sep ) );						
						createFolder( parent );						
						fs.mkdirSync( folder );						
						
					} else {
						return;
					}
				}
				createFolder( toFolder );
				
				
				var rd = fs.createReadStream( fromFile );
				rd.on('error', function(err){
					done( err );
				});
				
				var wr = fs.createWriteStream( toFile );
				wr.on('error', function(err){
					done( err );
				});
				
				wr.on('close', function(){
					if ( counter < files.length-1 ){
						counter++;
						copymachine();
						
					} else{
						done();
					}
				});
				
				rd.pipe( wr );
				
			} else {
				if ( counter < files.length-1 ){
					counter++;
					copymachine();
					
				} else{
					done();
				}
			}
				
		}();
	}

};





// Read a file
exports.readFile = function readFile( filename ){
	var file = fs.readFileSync( filename, {encoding: 'utf8'} ).toString();
	return file;
};


// Save a file
exports.saveFile = function saveFile( path, contents ){
	//console.log('Saving:', path);
	
	fs.writeFileSync( path, contents, {encoding: 'utf8'} );
};


////////////////////////////////////////////////////////////
// Helper functions



// Create folder 
var createFolder = function createFolder( folder ){
	if ( !fs.existsSync( folder ) ){
		fs.mkdirSync( folder );
	}
};








