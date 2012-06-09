/*
 * /models/blog.js
 */

module.exports = function( config ) {
	 
	// DAO
	var ArticleProvider = require( './provider-mongodb' ).MongoProvider;
		ArticleProvider.prototype.comment = function( id, comment, callback ) 
		{
			this.getCollection( function( error, collection ) {
				if ( error ) 
				{
					callback(error)
				}
				else 
				{
					collection.update( 
						{ '_id': collection.db.bson_serializer.ObjectID.createFromHexString(id) } 
					  , { 
						  	'$push': { 'comments': comment } 
					      , 'updated_at': new Date()
					    }
					);
					callback( null, comment );
				}
			} );
		};
	var ap = new ArticleProvider( 'Articles', config.database, config.host, config.port, config.uname, config.pword );
	//var ArticleProvider = require( './articleprovider-mongodb' ).ArticleProvider;
	//var ap = new ArticleProvider( 'ds031587.mongolab.com', 31587, 'henry', 'mongo' );

	return {
		// Service
		load: function ( req, res, next ) 
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
			}
		,
		all: function ( req, res, next ) 
			{
				// You would fetch all articles from the db
				// and set it in a callback function
				ap.findAll( 
					function( error, articles )
					{
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
			}
		,
		save: function ( req, res, next )
			{
/*
				if ( article.comments === undefined ) 
				{
					article.comments = [];
				}
				for ( var j =0;j< article.comments.length; j++ ) 
				{
					article.comments[j].created_at = new Date();
				}
*/
				ap.save(
					{
						'title': req.param('title')
					  , 'body': req.param('body')
					  , 'comments': []
					}
				  , function( error, article ) 
					{
						req.article = article;
						next();
					}
				);
			}
		,
		update: function ( req, res, next )
			{
				ap.update(
					{
						'_id': req.params.id
					  , 'title': req.param('title')
					  , 'body': req.param('body')
					}
				  , function( error, article ) 
					{
						req.article = article;
						next();
					}
				);
			}
		,
		remove: function ( req, res, next )
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
			}
		,
		comment: function ( req, res, next )
			{
				ap.comment(
					req.param('_id')
				  , {
						'person': req.param('person')
					  , 'comment': req.param('comment')
					  , 'created_at': new Date()
					} 
				  , function( error, comment ) 
					{
						next();
					}
				);
			}
	}
};