/*
 * /models/blog.js
 */
 
// DAO
var ArticleProvider = require( './articleprovider-mongodb' ).ArticleProvider;
//var ap = new ArticleProvider('localhost', 27017);
var ap = new ArticleProvider( 'ds031587.mongolab.com', 31587, 'henry', 'mongo' );

//'mongodb://heroku_app3222703:5n2egki91f3nt7pu8ur2352iba@ds031587.mongolab.com:31587/heroku_app3222703'
// mongo ds031587.mongolab.com:31587/heroku_app3222703 -u <user> -p <password>
//'mongodb://heroku_app3222703:5n2egki91f3nt7pu8ur2352iba@ds031587.mongolab.com:31587/heroku_app3222703'

// Service
exports.load = function ( req, res, next ) 
	{
		// You would fetch your article from the db
		// and set it in a callback function
		ap.findById(
			req.params.id
		  , function( error, article ) 
		    {
				if ( article ) 
				{
					req.article = article;
					next();
				} 
				else 
				{
					next( new Error('Failed to load article ' + req.params.id) );
				}
			}
		);
	};

exports.all = function ( req, res, next ) 
	{
		// You would fetch all articles from the db
		// and set it in a callback function
		ap.findAll( 
			function( error, articles ){
				if ( articles ) 
				{
					req.articles = articles;
					next();
				} 
				else 
				{
					next( new Error('Failed to load any articles.') );
				}
			}
		);
	};

exports.save = function ( req, res, next )
	{
		ap.save(
			{//articles
				title: req.param('title')
			  , body: req.param('body')
			}
		  , function( error, articles ) 
			{
				next();
			}
		);
	};

exports.update = function ( req, res, next )
	{
		ap.update(
			{
				_id: req.params.id
			  , title: req.param('title')
			  , body: req.param('body')
			}
		  , function( error, article ) 
			{
				next();
			}
		);
	};
	
exports.remove = function ( req, res, next )
	{
		ap.remove(
			{
				_id: req.params.id
			}
		  , function( error ) 
			{
				next();
			}
		);
	};

exports.comment = function ( req, res, next )
	{
		ap.comment(
			req.param('_id')
		  , {
				person: req.param('person')
			  , comment: req.param('comment')
			  , created_at: new Date()
			} 
		  , function( error, comment ) 
			{
				next();
			}
		);
	};