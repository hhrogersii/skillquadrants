//process.env.NODE_ENV = 'development';
//Mr. Holowaychuk, indeed

// Module dependencies
var express = require( 'express' )
  , stylus = require( 'stylus' )
  , nib = require( 'nib' ) 
  , http = require ( 'http' );
  
// Resources
var config = require( './configure' );

var socket = require( './socket' )
  , routes = require( './routes' )
  , models = require( './models' )( config ) ;


// Create server
var app = module.exports = express.createServer() ;

// Configure server
app.configure( function() 
{
	
	
	app.set( 'views', __dirname + '/views' ) ;
	app.set( 'view engine', 'jade' ) ;
	
	app.use( express.bodyParser() ) ;
	app.use( express.cookieParser() ) ;
	app.use( express.session({ secret: 'blarg' }) ) ;
	app.use( express.session.ignore.push('/robots.txt') ) ;
	
	app.use( express.methodOverride() ) ;
	app.use( stylus.middleware({ src: __dirname + '/public', compile: compile }) ) ;
	app.use( app.router );
	app.use( express.static(__dirname + '/public') ) ;
	
	function compile (str, path) { return stylus(str).set('filename', path).use( nib() ); } ;
});


// Error handling
app.configure( 'development', function() {
	app.use( express.errorHandler({ dumpExceptions: true, showStack: true }) );
});
app.configure( 'production', function() {
	app.use( express.errorHandler() );
});



// Create socket channel
socket.set( app, models );
    
// HTTP controller
routes.set( app, models, socket );


// Open server port
app.listen( config.web.port, function () {
	config.set( { 'addr': app.address() } );
	console.log( 'Express server listening on port http://%s:%d in %s mode!', config.addr.address, config.addr.port, app.settings.env );
});
