/*
 * /socket.js
 */
var model
  , nicknames
  , sio
  , global_socket;      

exports.set = function ( app, models )
	{
		model = models;
		
		sio = require( 'socket.io' ).listen(app);

		// Configure channel
		/* sio.configure( 'development', function() {
			sio.set( 'heartbeats', false );
			sio.set( 'transports', [ 'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling' ]);
		});
		sio.configure( 'production', function() {
			sio.enable( 'browser client minification' );  // send minified client
			sio.enable( 'browser client etag' );          // apply etag caching logic based on version number
			sio.enable( 'browser client gzip' );          // gzip the file
			sio.set( 'log level', 1 );                    // reduce logging
			sio.set( 'transports', [ 'xhr-polling' ] ); 
			sio.set( 'polling duration', 10 ); 
		});*/

		// assuming io is the Socket.IO server object
		sio.configure(function () { 
			sio.set("transports", ["xhr-polling"]); 
			sio.set("polling duration", 10); 
		});
		/*
sio.configure( 'development', function(){
			sio.set( 'transports', [
				  'websocket'
				, 'flashsocket'
				, 'htmlfile'
				, 'xhr-polling'
				, 'jsonp-polling'
			]);
		});
*/
		sio.sockets.on('connection', function (socket) {
			channels( socket, sio );
			global_socket = socket;
		});
		
	};
	
exports.send = function ( msg )
	{
		return function(req, res, next) {
			sio.sockets.emit('announcement', 'asdfasdfasdf');
			next();
		}
	};

/*
io.of('/chat').on('connection', function (sockets) { });
io.of('/news').on('connection', function (sockets) { });
*/

function channels ( socket, sio ) 
	{
		nicknames = model.chat.Nicknames();
		
		//test
		socket.emit( 'news', { hello: 'world' } );
		socket.on( 'my other event', function (data) {
			console.log(data);
		});
		
		//chat
		socket.on( 
			'user message'
		  , function (msg) {
				socket.broadcast.emit( 'user message', socket.nickname, msg );
			}
		);
		
		socket.on( 
			'nickname'
		  , function (nick, fn) {
				if (nicknames[nick]) {
					fn(true);
				} else {
					fn(false);
					nicknames[nick] = socket.nickname = nick;
					socket.broadcast.emit( 'announcement', nick + ' connected' );
					sio.sockets.emit( 'nicknames', nicknames );
				}
			}
		);
		
		socket.on( 
			'disconnect'
		  , function () {
				if (!socket.nickname) return;	
				delete nicknames[socket.nickname];
				socket.broadcast.emit( 'announcement', socket.nickname + ' disconnected' );
				socket.broadcast.emit( 'nicknames', nicknames );
			}
		);

		//draw
		socket.on(
			'drawClick'
		  , function(data) {
				socket.broadcast.emit(
					'draw'
				  , {
						x: data.x,
						y: data.y,
						type: data.type
					}
				);
			}
		);

		//blog
		socket.on(
			'get article'
		  , function(data) {
		  		//model.blog.loadArticle;
			    socket.broadcast.emit(
					'put'
				  , {
						title: 'My Article Title'
					  , article: 'Narf!'
					}
				);
			}
		);
	
		//quad
		socket.on(
			'move'
		  , function(data) {
		  		//model.blog.loadArticle;
			    socket.broadcast.emit(
					'move'
				  , data
				);
			}
		);
		
		socket.on(
			'toggle'
		  , function(data) {
		  		//model.blog.loadArticle;
			    socket.broadcast.emit(
					'toggle'
				  , data
				);
			}
		);
		
		socket.on(
			'halo'
		  , function(data) {
		  		//model.blog.loadArticle;
			    socket.broadcast.emit(
					'halo'
				  , data
				);
			}
		);
		
		socket.on(
			'delo'
		  , function(data) {
		  		//model.blog.loadArticle;
			    socket.broadcast.emit(
					'delo'
				);
			}
		);
	};

	