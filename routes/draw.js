/*
 * /routes/draw.js
 */
exports.View = function( req, res )
	{
		res.render(
			'draw'
		  , {
				title: 'Socket Drawing'
			}
		)
	};
