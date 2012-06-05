/*
 * /models/articleprovider-mongodb.js
 */
 
//DAO
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

// constructor
ArticleProvider = function( host, port, username, password ) 
	{
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
ArticleProvider.prototype.getCollection= function( callback ) 
	{
		this.db.collection( 'Articles', function( error, article_collection ) {
			if( error ) 
			{
				callback(error);
			}
			else 
			{
				callback( null, article_collection );
			}
		} );
	};

//findAll
ArticleProvider.prototype.findAll = function( callback ) 
	{
		this.getCollection( function( error, article_collection ) {
			if( error ) 
			{
				callback(error)
			}
			else {
				article_collection.find().toArray( function( error, results ) {
					if( error ) callback(error)
					else callback( null, results )
				} );
			}
		} );
	};

//findById
ArticleProvider.prototype.findById = function( id, callback ) 
	{
		this.getCollection(function( error, article_collection ) {
			if( error ) 
			{
				callback(error)
			}
			else {
				article_collection.findOne({_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
					if( error ) callback(error)
					else callback(null, result)
				});
			}
		});
	};

//save
ArticleProvider.prototype.save = function( articles, callback ) 
	{
		this.getCollection(function(error, article_collection) {
			if( error ) 
			{
				callback( error, articles )
			}
			else {
				if( typeof(articles.length) == "undefined" )
				{
					articles = [articles];
				}
				for( var i=0; i< articles.length; i++ ) 
				{
					article = articles[i];
					article.created_at = new Date();
					if( article.comments === undefined ) 
					{
						article.comments = [];
					}
					for( var j =0;j< article.comments.length; j++ ) 
					{
						article.comments[j].created_at = new Date();
					}
				}
				article_collection.insert( articles, function() {
						callback(null, articles);
				} );
			}
		});
	};

ArticleProvider.prototype.update = function( article, callback ) 
	{
		this.getCollection( function( error, article_collection ) {
			if( error ) 
			{
				callback(error)
			}
			else
			{
				article_collection.update( 
					{ _id : article_collection.db.bson_serializer.ObjectID.createFromHexString(article._id) } 
				  , { "$set" : 
						{ 
							"title" : article.title
						  , "body" : article.body
						  , "updated_at" : new Date()
						} 
					}
				);
				callback( null, article );
			}
		} );
	};

ArticleProvider.prototype.comment = function( id, comment, callback ) 
	{
		this.getCollection( function( error, article_collection ) {
			if( error ) 
			{
				callback(error)
			}
			else 
			{
				article_collection.update( 
					{ _id : article_collection.db.bson_serializer.ObjectID.createFromHexString(id) } 
				  , { "$push" : { "comments" : comment } }
				);
				callback( null, comment );
			}
		} );
	};

ArticleProvider.prototype.remove = function( article, callback ) 
	{
		this.getCollection( function( error, article_collection ) {
			if( error ) 
			{
				callback(error)
			}
			else 
			{
				article_collection.findOne(
					{_id: article.id}
				  , function(error, result) 
					{
						if( error ) callback(error)
						else 
						{
							article_collection.remove(
								{ _id: article_collection.db.bson_serializer.ObjectID.createFromHexString(article._id) }
							  , function() {
									callback( null, article );
								}
							);
						}
					}
				);
			}
		} );
	};

exports.ArticleProvider = ArticleProvider;
