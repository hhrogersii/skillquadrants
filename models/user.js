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
var config = require( '../configure' ).mongo;
var UserProvider = require('./provider-mongodb').MongoProvider;
	UserProvider.prototype.findByPassword = function(password, callback) 
	{
	//.Users.find({'password':'narfblarg'}).skip(0).limit(30)
	
		this.getCollection( function(error, collection) {
			if( error ) callback(error)
			else {
				collection.findOne(
					{'password': password}
				  , function( error, doc ) {
						if( error ) callback(error)
						else callback( null, doc )
					}
				);
			}
		} );
	};
var up = new UserProvider( 'Users', config.database, config.host, config.port, config.uname, config.pword );

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
			//if the result of the previus password check results in a session
			//then a user with that password already exists and go to next route
			delete req.session.authenticatedUser;
			next();
		}
		else
		{
/*
if ( doc.roles !== undefined )
					{
					 	for(var j =0;j< User.roles.length; j++) 
					 	{
							User.roles[j].created_at = new Date();
						}
					}
*/
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

app.del('/user/:id', loadUser, andRestrictTo('admin'), function(req, res){
  res.send('Deleted user ' + req.user.name);
});
*/
