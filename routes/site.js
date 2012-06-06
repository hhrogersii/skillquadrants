/*
 * /routes/site.js
 */

exports.blog = function(req, res)
	{
        res.render(
	    	'blog'
	  	  , { 
	      		locals: 
	      		{
	            	title: 'Skill Quadrants'
	              ,	articles: req.articles
	        	}
	    	}
	    );
	};

exports.index = function( req, res )
	{
		res.render(
			'index' 
		  , {
				title: 'Skill Quadrants'
			  , descr: 'An interactive resume based on the quadrant chart.'
			  , artic: '<div style="text-align:center"><img src="/img/sqhenryrogers201205.png" width="620" height="620" alt="SQ: Henry Rogers, 2012-5" /><div style="width:620px;text-align:center;margin:6px auto;">Understanding a job applicant\'s skill level and experience within a business domain is complicated by rapid changes in technology and the market. Technology lists on a resume can&rsquo;t adequately convey this dynamic set of competing demands. A quadrant chart can encode not just the what, but also the how well and the how long &mdash; key attributes in evaluating the suitability of a potential candidate.</div><h3>&ldquo;It\'s not just where you&rsquo;ve been, its where you&rsquo;re going.&rdquo;</h3></div>'
			}
		)

	};
	
exports.about = function( req, res )
	{
		res.render(
			'about' 
		  , {
				title: 'Skill Quadrants'
			  , descr: 'An interactive resume based on the quadrant chart.'
			  , artic: '<object id="scPlayer" width="640" height="480" type="application/x-shockwave-flash" data="http://content.screencast.com/users/SkillQuadrants/folders/Camtasia/media/6384a660-1c9c-4f9a-894e-244406a3b1b3/scplayer.swf" > <param name="movie" value="http://content.screencast.com/users/SkillQuadrants/folders/Camtasia/media/6384a660-1c9c-4f9a-894e-244406a3b1b3/scplayer.swf" /> <param name="quality" value="high" /> <param name="bgcolor" value="#FFFFFF" /> <param name="flashVars" value="thumb=http://content.screencast.com/users/SkillQuadrants/folders/Camtasia/media/6384a660-1c9c-4f9a-894e-244406a3b1b3/FirstFrame.jpg&containerwidth=640&containerheight=480&xmp=sc.xmp&content=http://content.screencast.com/users/SkillQuadrants/folders/Camtasia/media/6384a660-1c9c-4f9a-894e-244406a3b1b3/Overview.mp4&blurover=false" /> <param name="allowFullScreen" value="true" /> <param name="scale" value="showall" /> <param name="allowScriptAccess" value="always" /> <param name="base" value="http://content.screencast.com/users/SkillQuadrants/folders/Camtasia/media/6384a660-1c9c-4f9a-894e-244406a3b1b3/" /> <iframe type="text/html" frameborder="0" scrolling="no" style="overflow:hidden;" src="http://www.screencast.com/users/SkillQuadrants/folders/Camtasia/media/6384a660-1c9c-4f9a-894e-244406a3b1b3/embed" height="480" width="640" ></iframe> </object><div><h3>Built With</h3><ul><li><a href="http://http://nodejs.org/">Node.js</a></li><li><a href="http://jquery.com/">jQuery</a></li><li><a href="http://www.mongodb.org/">MongoDB</a></li><li><a href="http://www.kineticjs.com/">KineticJS</a></li><li><a href="http://twitter.github.com/bootstrap/">Twitter Bootstrap</a></li><li><a href="http://expressjs.com/">express</a></li><li><a href="http://www.heroku.com/">Heroku</a></li><li><a href="http://jade-lang.com/">Jade</a></li><li><a href="http://learnboost.github.com/stylus/">Stylus</a></li><li>HTML5 Video coming soon.</li></ul></div>'
			}
		)
	};

exports.abouthtm5 = function( req, res )
	{
		res.render(
			'about' 
		  , {
				title: 'Skill Quadrants'
			  , descr: 'An interactive resume based on the quadrant chart.'
			  , artic: '<script type="text/javascript">$(function(){$("video").osmplayer({width:"100%",height:"600px"});});</script><video src="http://www.screencast.com/t/t1cJXWiug"></video>'
			}
		)
	};

exports.contact = function( req, res )
	{
		res.render(
			'contact'
		  , {
				title: 'Contact SQ'
			}
		)
	};
