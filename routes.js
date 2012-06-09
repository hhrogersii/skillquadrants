/*
 * /routes.js
 */
var route = 
{
    site: require( './routes/site' )
  , blog: require( './routes/blog' )
  , chat: require( './routes/chat' )
  , user: require( './routes/user' )
  , draw: require( './routes/draw' )
  , quad: require( './routes/quad' )
};

exports.set = function( app, model, sio ) 
{
	// site
	app.get(
		'/'
				, route.site.index 
	);
	app.get(
		'/about'
				, route.site.about 
	);
	
	app.get(
		'/contact'
				, route.site.contact 
	);
	
	// blog
	app.get(
		'/blog'
			, model.blog.all
				, route.blog.list 
	);
	app.get(
		'/blog/new'
				, route.blog.create 
	);
	app.post( 
		'/blog/new'
			, model.blog.save
				, route.blog.save 
	);
	app.get(  
		'/blog/:id'
			, model.blog.load
				, route.blog.view 
	);
	app.get(
		'/blog/:id/edit'
			, model.blog.load
				, route.blog.edit 
	);
	app.post( 
		'/blog/:id/edit'
			, model.blog.update
				, route.blog.update 
	);
	app.get(  
		'/blog/:id/delete'
			, model.blog.remove
				, route.blog.remove 
	);
	app.post( 
		'/blog/comment'
			, model.blog.comment
				, route.blog.comment 
	);
	
	// chat
	app.get( 
		'/chat'
				, route.chat.view 
);
	
	// user
	app.get(
		'/user/login'
				, route.user.login 
	);
	app.get(
		'/user/session'
				, route.user.authenticated
	);
	app.post(
		'/user/authenticate'
			, model.user.logout
			, model.user.password
				, route.user.authenticated 
	);
	app.get(
		'/user/logout'
			, model.user.logout
				, route.user.logout 
	);
	app.get(
		'/user/create'
				, route.user.create  
	);
	app.post(
		'/user/create'
			, model.user.logout
			, model.user.password
			, model.user.create
				, route.user.created 
	);
	app.get(
		'/user/:id/delete'
			, model.user.load
			, model.user.authorize()
			, model.user.remove
				, route.user.remove 
	);
	
	
	// draw
	app.get(
		'/draw'
				, route.draw.view
	);
	
	app.get(
		'/emit'
			, sio.send( 'asdfaadsfadsfasdf' )
				, route.chat.view
	);
	
	// chart
	app.get(
		'/quad'
				, route.quad.view
	);
	
	app.post(//del
		'/quad/:id/delete'
			, model.quad.remove
				, route.quad.remove
	);
};
