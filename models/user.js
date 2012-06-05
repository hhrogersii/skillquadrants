/*
 * /models/user.js
   authenticatedUser: 
   { name: 'asdf',
     email: 'asdf',
     password: 'asdf',
     created_at: '2012-06-03T01:38:49.747Z',
     _id: '4fcac0294128430000000001' } }
 */
 
// DAO
var UserProvider = require('./userprovider-mongodb').UserProvider;

var up = new UserProvider( 'ds031587.mongolab.com', 31587, 'henry', 'mongo' );

exports.session = function ( req, res, next ) 
	{
		req.user = req.session.authenticatedUser;
		next();
	};
	
exports.authorize = function ( ) 
	{
		return function(req, res, next) {
			req.session.authenticatedUser && req.user
				? ( req.session.authenticatedUser.id == req.user.userid
					? next()
					: next( new Error('Unauthorized access logged.') )
				)
				: next( new Error('User not logged in.') );
		}
	};
	
exports.logout = function ( req, res, next )
	{
		delete req.session.authenticatedUser;
		next();
	};
	
exports.password = function ( req, res, next )
	{
		up.findByPassword(
			req.body.password
		  , function( error, user ) 
		    {
				if (user) 
				{
					req.session.authenticatedUser = user;
				}
				next();
			}
		);
	};
	
exports.authenticate = function ( req, res, next )
	{
		if (req.user) 
		{
			req.session.authenticatedUser = req.user;
		} 
		next();
	};
	
exports.load = function ( req, res, next ) 
	{
		// You would fetch your user from the db
		up.findById(
			req.params.id
		  , function( error, user ) 
		    {
				if (user) 
				{
					req.user = user;
				}
				next();
			}
		);
	};

exports.create = function ( req, res, next )
	{
		if ( req.session.authenticatedUser )
		{
			delete req.session.authenticatedUser;
			next();
		}
		else
		{
			up.save(
				{//user
					name: req.param('name')
				  , email: req.param('email')
				  , password: req.param('password')
				}
			  , function( error, user ) 
				{
					req.session.authenticatedUser = user;
					next();
				}
			);
		}
	};


/*
exports.authorize = function ( req, res, next ) 
	{
		return function( req, res, next ) 
		{
			( req.session.authenticatedUser )
			? ( 
				( req.user.userid )
				? (
					( req.session.authenticatedUser.id == req.user.userid )
					? (
						next()
					  )
					: next( new Error('Unauthorized access logged.') )
				  )
				: next( new Error('User session not secured.') )
			  )
			: next( new Error('Go to loggin.') );
		}
	};

var sess = req.session;
var body = '';

if (sess.views) {
	res.setHeader('Content-Type', 'text/html');
	
	body = '<p>views: ' + sess.views + '</p>';
	body += '<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>';
	sess.views++;
} else {
	sess.views = 1;
	body = 'welcome to the session demo. refresh!';
}
      
function andRestrictTo(role) {
  return function(req, res, next) {
    req.authenticatedUser.role == role
      ? next()
      : next(new Error('Unauthorized'));
  }
}

app.del('/user/:id', loadUser, andRestrictTo('admin'), function(req, res){
  res.send('Deleted user ' + req.user.name);
});
*/
