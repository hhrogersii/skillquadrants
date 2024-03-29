/*
 * /models/blog.js
 */
 
// DAO
var config = require( '../configure' ).mongo;
var ChartProvider = require( './provider-mongodb' ).MongoProvider;
	ChartProvider.prototype.comment = function( id, comment, callback ) 
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
var ap = new ChartProvider( 'Charts', config.database, config.host, config.port, config.uname, config.pword );

// Service
exports.load = function ( req, res, next ) 
	{
		// You would fetch your chart from the db
		// and set it in a callback function
		cp.findById(
			req.params.id
		  , function( error, chart ) 
		    {
				if ( chart ) 
				{
					req.chart = chart;
					next();
				} 
				else 
				{
					next( new Error('Failed to load chart ' + req.params.id) );
				}
			}
		);
	};

exports.loadAll = function ( req, res, next ) 
	{
		// You would fetch all charts from the db
		// and set it in a callback function
		cp.findAll( 
			function( error, charts ){
				if ( charts ) 
				{
					req.charts = charts;
					next();
				} 
				else 
				{
					next( new Error('Failed to load any charts.') );
				}
			}
		);
	};

exports.save = function ( req, res, next )
	{
		cp.save(
			{
				title: req.param('title')
			  , body: req.param('body')
			}
		  , function( error, charts ) 
			{
				next();
			}
		);
	};

exports.update = function ( req, res, next )
	{
		cp.update(
			{
				_id: req.params.id
			  , title: req.param('title')
			  , body: req.param('body')
			}
		  , function( error, chart ) 
			{
				next();
			}
		);
	};
	
exports.remove = function ( req, res, next )
	{
		cp.remove(
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
		cp.comment(
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