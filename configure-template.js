var config = {}

config.twitter = {};
config.mongo = {};
config.redis = {};
config.addr = {};
config.web = {};

config.twitter.user_name = process.env.TWITTER_USER || <twitterusername>;
config.twitter.password=  process.env.TWITTER_PASSWORD || <twitterpassword>;

config.mongo.uname = <mongousername>;
config.mongo.pword = <mongopassword>;
config.mongo.port = <mongoport>;
config.mongo.host = <mongohost>;
config.mongo.database = <mongodatabase>;

config.redis.uri = process.env.DUOSTACK_DB_REDIS;
config.redis.host = <redithost>;
config.redis.port = <redisport>;

config.web.port = process.env.PORT || <webport>;

config.set = function ( setting )
	{
		var i;
		for ( i in setting )
		{
			if ( setting.hasOwnProperty(i) )
			{
				config[i] = setting[i];
			}
		}
	};
	
module.exports = config;