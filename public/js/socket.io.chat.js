var socket = io.connect( window.location.protocol +'//'+ window.location.host );

socket.on( 'news', function (data) {
    console.log(data);
    socket.emit( 'my other event', { my: 'socketdata' } );
});

socket.on( 'connect', function () {
	$('#chat').addClass('connected');
});

socket.on( 'announcement', function (msg) {
	$('#lines').append( $('<p>').append($('<em>').text(msg)) );
});

socket.on( 'nicknames', function (nicknames) {
	$('#nicknames').empty().append( $('<span>Online: </span>') );
	for (var i in nicknames) {
		$('#nicknames').append( $('<b>').text(nicknames[i]) );
	}
});

socket.on( 'user message', message );
socket.on( 'reconnect', function () {
	$('#lines').remove();
	message('System', 'Reconnected to the server');
});

socket.on( 'reconnecting', function () {
	message('System', 'Attempting to re-connect to the server');
});

socket.on( 'error', function (e) {
	message('System', e ? e : 'A unknown error occurred');
});

function message ( from, msg ) {
	$('#lines').append( $('<p>').append($('<b>').text(from), msg) );
}

// dom manipulation
$(function () {
	$('#set-nickname').submit( function (ev) {
		socket.emit( 'nickname', $('#nick').val(), function (set) {
			if (!set) {
				clear();
				return $('#chat').addClass('nickname-set');
			}
			$('#nickname-err').css('visibility', 'visible');
		});
		return false;
	});
	
	$('#send-message').submit(function () {
		message( 'me', $('#message').val() );
		socket.emit( 'user message', $('#message').val() );
		clear();
		$('#lines').get(0).scrollTop = 10000000;
		return false;
	});
	
	function clear () {
		$('#message').val('').focus();
	};
});