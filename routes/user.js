/*
 * /routes/user.js
 */

exports.login = function( req, res )
	{//res.send( '<form action="http://localhost:3000/user/authenticate" method="post"><label for="password">Password:</label><input type="text" name="password"><input type="submit" value="Log In"></form><a id="logincreate" href="http://localhost:3000/user/create">Create Account</a>' );
		res.send( '<form id="session-form" action="#" method="post"><label for="password">Password:</label><input type="password" id="password" name="password"><br /><input type="button" id="session-authenticate" value="Log In" class="btn"></form><a id="session-create" href="#">Create Account</a>' );
	};

exports.logout = function( req, res )
	{
		var html = '<div class="alert alert-block alert-success wide">You have been logged out.</div><a id="session-login" href="#">Log In</a>';
		if ( req.accepts('application/json') )
		{
			res.json(['OK']);	
		}
		else
		{
			res.send( html );
		}
	};

exports.authenticated = function( req, res )
	{
		if ( req.session.authenticatedUser )
		{
			var html = '<div class="alert alert-block alert-success wide">You are logged in as <span id="'+ req.session.authenticatedUser._id +'">' + req.session.authenticatedUser.name +'</span>.</div><a id="session-logout" href="#">Log Out</a>';
			
			if ( req.accepts('application/json') )
			{
				res.json( { "hasSession":true, "session":req.session.authenticatedUser, "html":html } );
			}
			else
			{
				res.send( html );
			}
		}
		else
		{
			var html = '<div class="alert alert-block alert-error wide">Your password was not recognized.</div><a id="session-login" href="#">Log In</a> | <a id="session-create" href="#">Create Account</a>';
			
			if ( req.accepts('application/json') )
			{
				res.json( { "hasSession":false, "session":{}, "html":html } );
			}
			else
			{
				res.send( html );
			}
		}	
	};
	
exports.create = function( req, res )
	{//res.send( '<form action="http://localhost:3000/user/create" method="post"><label for="name">Name:</label><input type="text" name="name"><br /><label for="email">Email:</label><input type="text" name="email"><br /><label for="password">Password:</label><input type="text" name="password"><br /><input type="submit" value="Create"></form><a href="http://localhost:3000/user/create">Create Account</a>' );
		res.send( '<form id="session-form" action="#" method="post"><label for="name">Name:</label><input type="text" id="name" name="name"><br /><label for="email">Email:</label><input type="text" id="email" name="email"><br /><label for="password">Password:</label><input type="password" id="password" name="password"><br /><input type="button" id="session-save" value="Create" class="btn"></form><a id="session-login" href="#">Log In</a>' );
	};

exports.created = function( req, res )
	{
		if ( req.session.authenticatedUser )
		{
			var html = '<div class="alert alert-block alert-success wide">Your user account has been created.</div>You are logged in as ' + req.session.authenticatedUser.name +'.<br /><a id="session-logout" href="#">Log Out</a>';
		
			if ( req.accepts('application/json') )
			{
				res.json( { "hasSession":true, "session":req.session.authenticatedUser, "html":html } );
			}
			else
			{
				res.send( html );
			}
		}
		else
		{
			var html = '<div class="alert alert-block alert-error wide">There was a problem creating your account!</div><a id="session-create" href="#">Create Account</a> | <a id="session-login" href="#">Log In</a>';

			if ( req.accepts('application/json') )
			{
				res.json( { "hasSession":false, "session":{}, "html":html } );
			}
			else
			{
				res.send( html );
			}
		}
	};
	
exports.remove = function( req, res )
	{
		res.send( '<div class="alert alert-block alert-success wide">Deleted user ' + req.user.name + '</div><a id="session-create" href="#">Create Account</a>' );
	};