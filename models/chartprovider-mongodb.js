/*
 * /models/chartprovider-mongodb.js
 */
 
//DAO
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

// constructor
ChartProvider = function( host, port, username, password ) 
	{//node-mongo-blog
		
		this.db= new Db( 'blarg', new Server( host, port, { auto_reconnect: true }, {} ) );
		
		this.db.open( function( err, data ) {
			if( data )
			{
				data.authenticate( username, password, function( err2, data2 ) {
					if(data2)
					{
						console.log("Database opened");
					}
					else
					{
						console.log(err2);
					}
				} );
			}
			else
			{
				console.log(err);
			}
		} );
	};

//mongo.connect(process.env.MONGOLAB_URI, {heroku_app3222703:5n2egki91f3nt7pu8ur2352iba@}, function(error, db){


//getCollection
ChartProvider.prototype.getCollection= function( callback ) 
	{
		this.db.collection( 'Charts', function( error, chart_collection ) {
			if( error ) 
			{
				callback(error);
			}
			else 
			{
				callback( null, chart_collection );
			}
		} );
	};

//findAll
ChartProvider.prototype.findAll = function( callback ) 
	{
		this.getCollection( function( error, chart_collection ) {
			if( error ) 
			{
				callback(error)
			}
			else {
				chart_collection.find().toArray( function( error, results ) {
					if( error ) callback(error)
					else callback( null, results )
				} );
			}
		} );
	};

//findById
ChartProvider.prototype.findById = function( id, callback ) 
	{
		this.getCollection(function( error, chart_collection ) {
			if( error ) 
			{
				callback(error)
			}
			else {
				chart_collection.findOne({_id: chart_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
					if( error ) callback(error)
					else callback(null, result)
				});
			}
		});
	};

//save
ChartProvider.prototype.save = function( charts, callback ) 
	{
		this.getCollection(function(error, chart_collection) {
			if ( error ) 
			{
				callback(error);
			}
			else {
				if( typeof(charts.length) == "undefined" )
				{
					charts = [charts];
				}
				for( var i =0;i< charts.length;i++ ) 
				{
					chart = charts[i];
					chart.created_at = new Date();
					if ( chart.comments === undefined ) 
					{
						chart.comments = [];
					}
					for ( var j =0;j< chart.comments.length; j++ ) 
					{
						chart.comments[j].created_at = new Date();
					}
				}
				chart_collection.insert( charts, function() {
						callback( null, charts );
				} );
			}
		});
	};

ChartProvider.prototype.update = function( chart, callback ) 
	{
		this.getCollection( function( error, chart_collection ) {
			if ( error ) 
			{
				callback(error);
			}
			else
			{
				chart_collection.update( 
					{ _id : chart_collection.db.bson_serializer.ObjectID.createFromHexString(chart._id) } 
				  , { "$set" : 
						{ 
							"title" : chart.title
						  , "body" : chart.body
						  , "updated_at" : new Date()
						} 
					}
				);
				callback( null, chart );
			}
		} );
	};

ChartProvider.prototype.comment = function( id, comment, callback ) 
	{
		this.getCollection( function( error, chart_collection ) {
			if( error ) 
			{
				callback(error)
			}
			else 
			{
				chart_collection.update( 
					{ _id : chart_collection.db.bson_serializer.ObjectID.createFromHexString(id) } 
				  , { "$push" : { "comments" : comment } }
				);
				callback( null, comment );
			}
		} );
	};

ChartProvider.prototype.remove = function( chart, callback ) 
	{
		this.getCollection( function( error, chart_collection ) {
			if( error ) 
			{
				callback(error)
			}
			else 
			{
				chart_collection.findOne(
					{_id: chart.id}
				  , function(error, result) 
					{
						if( error ) callback(error)
						else 
						{
							chart_collection.remove(
								{ _id: chart_collection.db.bson_serializer.ObjectID.createFromHexString(chart._id) }
							  , function() {
									callback( null, chart );
								}
							);
						}
					}
				);
			}
		} );
	};

exports.ChartProvider = ChartProvider;
