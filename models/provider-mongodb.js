/*
 * /models/mongodb.js
 */
 
//DAO
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var  _ = require( 'underscore' );

// constructor
MongoProvider = function( collection, database, host, port, username, password ) 
	{
		this.db = new Db( database, new Server( host, port, { auto_reconnect: true }, {} ) );
		this.collectionName = collection;
		
		this.db.open( function( err, data ) {
			if( data )
			{
				data.authenticate( username, password, function( err2, data2 ) {
					if(data2)
					{
						console.log('Database opened');
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

//getCollection
MongoProvider.prototype.getCollection = function( callback ) 
	{
		this.db.collection( this.collectionName, function( error, collection ) {
			if( error ) 
			{
				callback(error);
			}
			else 
			{
				callback( null, collection );
			}
		} );
	};

//findAll
MongoProvider.prototype.findAll = function( callback ) 
	{
		this.getCollection( function( error, collection ) {
			if( error ) 
			{
				callback(error)
			}
			else {
				collection.find().toArray( function( error, docs ) {
					if( error ) callback(error)
					else callback( null, docs )
				} );
			}
		} );
	};

//findById
MongoProvider.prototype.findById = function( id, callback ) 
	{
		this.getCollection( function( error, collection ) {
			if( error ) 
			{
				callback(error)
			}
			else {
				collection.findOne(
					{'_id': collection.db.bson_serializer.ObjectID.createFromHexString(id)}
				  , function(error, doc) 
					{
						if( error ) callback(error)
						else callback( null, doc )
					}
				);
			}
		} );
	};

//save
MongoProvider.prototype.save = function( doc, callback ) 
	{
		this.getCollection( function( error, collection ) {
			if( error ) 
			{
				callback( error, doc )
			}
			else {
				doc.created_at = new Date();
				doc.updated_at = doc.created_at;
				collection.insert( doc, function() {
					callback( null, doc );
				} );
			}
		} );
	};

//saveAll
MongoProvider.prototype.saveAll = function( docs, callback ) 
	{
		this.getCollection( function( error, collection ) {
			if ( error ) 
			{
				callback( error, docs )
			}
			else {
				if( typeof(docs.length) === 'undefined' )
				{
					docs = [docs];
				}
				for( var i=0; i< docs.length; i++ ) 
				{
					var doc = docs[i];
					doc.created_at = new Date();
					doc.updated_at = doc.created_at;
				}
				collection.insert( docs, function() {
					callback( null, docs );
				} );
			}
		} );
	};

MongoProvider.prototype.update = function( doc, callback ) 
	{
		this.getCollection( function( error, collection ) {
			if ( error ) 
			{
				callback(error);
			}
			else
			{
				doc.updated_at = new Date();
				
				var data = _.clone(doc);
				delete data._id;

				collection.update(
					{ '_id': collection.db.bson_serializer.ObjectID.createFromHexString(doc._id) } 
				  , { '$set': data }
				);
				callback( null, doc );
			}
		} );
	};

MongoProvider.prototype.findById = function( id, callback ) 
	{
		this.getCollection( function( error, collection ) {
			if( error ) 
			{
				callback(error)
			}
			else {
				collection.findOne(
					{ '_id': collection.db.bson_serializer.ObjectID.createFromHexString(id) }
				  , function(error, doc) 
				  	{
						if( error ) callback(error)
						else callback( null, doc )
					}
				);
			}
		} );
	};

MongoProvider.prototype.remove = function( doc, callback ) 
	{
		this.getCollection( function( error, collection ) {
			if( error ) 
			{
				callback(error)
			}
			else 
			{
				collection.findOne(
					{ '_id': collection.db.bson_serializer.ObjectID.createFromHexString(doc._id) }
				  , function( error, doc ) 
					{
						if ( error ) callback(error)
						else 
						{
							collection.remove(
								{ '_id': doc._id }
							  , function() {
									callback( null );
								}
							);
						}
					}
				);
			}
		} );
	};

exports.MongoProvider = MongoProvider;
