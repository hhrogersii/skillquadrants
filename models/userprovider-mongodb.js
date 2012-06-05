//DAO
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

// constructor
UserProvider = function( host, port, username, password ) 
	{
		this.db= new Db( 'heroku_app3222703', new Server( host, port, { auto_reconnect: true }, {} ) );
		
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

//getCollection
UserProvider.prototype.getCollection= function(callback) 
	{
		this.db.collection('Users', function(error, User_collection) {
			if( error ) callback(error);
			else callback(null, User_collection);
		});
	};

//findAll
UserProvider.prototype.findAll = function(callback) 
	{
		this.getCollection( function( error, User_collection ) {
			if( error ) callback(error)
			else {
				User_collection.find().toArray(function(error, results) {
					if( error ) callback(error)
					else callback( null, results )
				} );
			}
		} );
	};

//findById
UserProvider.prototype.findById = function(id, callback) 
	{
		this.getCollection( function(error, User_collection) {
			if( error ) callback(error)
			else {
				User_collection.findOne(
					{_id: User_collection.db.bson_serializer.ObjectID.createFromHexString(id)}
				  , function( error, result ) {
						if( error ) callback(error)
						else callback( null, result )
					}
				);
			}
		} );
	};

//findByPassword
UserProvider.prototype.findByPassword = function(password, callback) 
	{
	//.Users.find({"password":"narfblarg"}).skip(0).limit(30)
	
		this.getCollection( function(error, User_collection) {
			if( error ) callback(error)
			else {
				User_collection.findOne(
					{"password": password}
				  , function( error, result ) {
						if( error ) callback(error)
						else callback( null, result )
					}
				);
			}
		} );
	};
	
//save
UserProvider.prototype.save = function(User, callback) 
	{
		this.getCollection(function(error, User_collection) {
			if( error ) callback(error)
			else {
				User.created_at = new Date();
				if( User.roles !== undefined )
				{
				 	for(var j =0;j< User.roles.length; j++) 
				 	{
						User.roles[j].created_at = new Date();
					}
				}
				User_collection.insert(User, function() {
					callback(null, User);
				} );
			}
		} );
	};

UserProvider.prototype.update = function(User, callback) 
{
	this.getCollection(function(error, User_collection) {
		if( error ) callback(error)
		else 
		{
			User_collection.update( 
				{ _id : User_collection.db.bson_serializer.ObjectID.createFromHexString(User._id) } 
			  , { "$set" : 
			  		{ 
			  			"title" : User.title
			  		  , "body" : User.body
			  		  , "updated_at" : new Date()
			  		} 
			  	} 
			);
			callback(null, User);
		}
	} );
};

UserProvider.prototype.remove = function(User, callback) 
{
    this.getCollection(function(error, User_collection) {
		if( error ) callback(error)
		else 
		{
			User_collection.findOne(
				{_id: User_collection.db.bson_serializer.ObjectID.createFromHexString(User.id)}
			  , function(error, result) 
				{
					if( error ) callback(error)
					else 
					{
						User_collection.remove(
							{ _id: User_collection.db.bson_serializer.ObjectID.createFromHexString(User._id) }
						  , function() {
								callback(null, User);
							}
						);
					}
				}
			);
		}
	} );
};

exports.UserProvider = UserProvider;
