/*
 * /models.js
 */

module.exports = function( config ) {
	return {
		chat: require( './models/chat' )
	  , blog: require( './models/blog' )( config.mongo )
	  , user: require( './models/user' )
	  , quad: require( './models/quad' )
	}
};
