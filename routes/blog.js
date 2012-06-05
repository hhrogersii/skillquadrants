/*
 * /routes/blog.js
 */

exports.view = function(req, res ) 
	{
  		res.render(
  			'blog_show'
  		  , { 
  	  			locals: {
        			title: req.article.title
        		  , article: req.article
    			}
    		}
    	);
	};

exports.create = function(req, res) 
	{
	    res.render(
	    	'blog_new'
	      , { 
	      		locals: 
	      		{
	        		title: 'New Post'
	    		}
    		}
    	)
    };

exports.edit = function(req, res) 
	{
	    res.render(
	    	'blog_edit'
	      , { 
	      		locals: 
	      		{
        			title: req.article.title
        		  , article: req.article
	    		}
    		}
    	)
    };
    
exports.save = function(req, res)
	{
		res.redirect('/');
	};

exports.update = function(req, res)
	{
		res.redirect('/');
	};
	
exports.remove = function(req, res)
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
	
exports.comment = function(req, res) 
	{
		res.redirect('/');
	};


