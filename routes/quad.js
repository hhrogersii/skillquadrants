/*
 * /routes/quad.js
 */

exports.view = function( req, res )
	{
		res.render(
			'quad'
		  , {
				title: 'Skill Quadrants'
			  , session: req.session
			}
		)
	};

exports.remove = function( req, res )
	{
		// Respond according to the request format
		switch (req.params.format) 
		{
			case 'json':
				res.send(d.__doc);
			break;
		
			default:
				res.redirect('/');
		}
	};