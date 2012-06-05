/*
 * /models/blog.js
 */
 
// DAO
var ChartProvider = require( './chartprovider-mongodb' ).ChartProvider;
//var ap = new ChartProvider('localhost', 27017);
var cp = new ChartProvider( 'ds031587.mongolab.com', 31587, 'henry', 'mongo' );

//'mongodb://heroku_app3222703:5n2egki91f3nt7pu8ur2352iba@ds031587.mongolab.com:31587/heroku_app3222703'
// mongo ds031587.mongolab.com:31587/heroku_app3222703 -u <user> -p <password>
//'mongodb://heroku_app3222703:5n2egki91f3nt7pu8ur2352iba@ds031587.mongolab.com:31587/heroku_app3222703'

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