/*
 * /routes/chat.js
 */
exports.View = function( req, res )
	{
		res.render(
			'chat'
		  , {
				title: 'Socket Chat'
			}
		)
	};

