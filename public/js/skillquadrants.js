/*jslint browser: true, bitwise: true, nomen: true, undef: true, sloppy: true, white: true */
/*globals _, Kinetic, Stage, Chart, Skill, Legend, Editor, Alert, Session */

( function($){

	var socket
	  , rootURL = window.location.protocol +'//'+ window.location.host
	  , mongoURL = 'https://www.mongolab.com/api/1/databases/heroku_app3222703/collections';

	/* ------------------------------- INIT ------------------------------- */

	var init = function ( canvasId, canvasWidth, canvasHeight )
		{
	/*
			socket = io.connect( rootURL );
			socket.on( 'quad',   function(d) { return quad(d);   } );
			socket.on( 'skill',  function(d) { return chart(d); } );
			socket.on( 'move',   function(d) { return move(d);   } );
			socket.on( 'tggl', function(d) { return tggl(d); } );
			socket.on( 'halo',   function(d) { return halo(d);   } );
	*/
			Session.init( function() {
				Stage.init( canvasId, canvasWidth, canvasHeight );
				Stage.list( function() {
					Chart.load( '{"_id":{"$oid":"'+ Stage.first() +'"}}' );
				} );		
			} );		

			//(canvasStage.onFrame(function(frame){
			//	animate();
			//} ));
			//canvasStage.start();
		};

	/* ------------------------------- STAGE ------------------------------- */

	var Stage = ( function ( )
		{
			var canvasStage = {}
			  , canvasLayers = {}
			  , layerQueue = {}
			  , stageData = {}
			  , ready = false
			  , modifiable = false;

			/*--------------------------------------*/
			$('#modify button').click( function() {
				Stage.modifiable( ( this.value === 'unlock' ) );
			} );
			/*--------------------------------------*/
			$('button#save').click( function() {
				Chart.save();
				Stage.drawQueue();
			} );
			$('button#reset').click( function() {
				Chart.reset();
				Stage.drawQueue();
			} );
			$('button#share').click( function() {
				Chart.share();
				Stage.drawQueue();
			} );
			/*--------------------------------------*/
			$('#access button').click( function() {
				Chart.access(this.value);
				Stage.drawQueue();
			} );
			/*--------------------------------------*/
			$('button#new').click( function() {
				Chart.create();
				Stage.drawQueue();
			} );
			$('button#copy').click( function() {
				Chart.copy();
				Stage.drawQueue();
			} );
			$('button#delete').click( function() {
				Chart.remove();
				Chart.create();
				Stage.drawQueue();
			} );
			/*--------------------------------------*/
			
			return {
				init: function ( canvasId, canvasWidth, canvasHeight )
				{
					canvasStage = new Kinetic.Stage( { container: canvasId, width: canvasWidth, height: canvasHeight } );
				}
			  , load: function ( query )
				{
					$.ajax( {
						url: mongoURL + '/Quad/' + query
					  , data: { 'apiKey': '4f5c06c6e4b0ab4364f0987d' }
					  , dataType: 'json'
					  , success: function( data )
						{
							if ( data )
							{
								stageData = data;
								ready = true;
								Stage.draw();
							}
							else
							{
								Alert.msg( 'Error', 'load quad error - L149' );
							}
						}
					  , failure: function()
						{
							Alert.msg( 'Error', 'load quad error - L154' );
						}
					} );
				}
			  , isReady: function ( b )
				{
					if ( typeof b !== 'undefined' )
					{
						ready = b;
					}
					return ready;
				}
			  , get: function ( )
				{
					return stageData;
				}
			  , draw: function ( )	
				{
					var n;
					canvasLayers = {};
					if ( this.isReady() && Chart.isReady() )
					{
						this.background();
						this.quad();

						Chart.draw();
						Legend.draw();
						Editor.draw();

						canvasStage.removeChildren();
						for ( n in canvasLayers )
						{
							if ( canvasLayers.hasOwnProperty(n) )
							{
								canvasStage.add( canvasLayers[n] );
							}
						}
					}
				}
			  , drawQueue: function ( )
				{
					var n;
					for ( n in layerQueue )
					{
						if ( layerQueue.hasOwnProperty(n) )
						{
							layerQueue[n].draw();
						}
					}
					layerQueue = {};
				}
			  , enqueue: function ( n )
				{
					canvasLayers[n].enqueue();
				}
			  , createLayer: function ( n )
				{
					if ( typeof canvasLayers[n] !== 'object' )
					{
						var layer = new Kinetic.Layer( {name:n} );
						layer.enqueue = function ( )
							{
								layerQueue[this.getName()] = this;
							};
						canvasLayers[n] = layer;
					}
				}
			  , addLayer: function ( l )
				{
					canvasStage.add(l);
				}
			  , getLayer: function ( n )
				{
					return canvasLayers[n];
				}
			  , drawLayer: function ( n )
				{
					if ( canvasLayers.hasOwnProperty(n) )
					{
						canvasLayers[n].draw();
					}
					else
					{
						alert(n);
					}
				}
			  , getTitle: function ( t )
				{
					return canvasLayers.quad.getChild('quad').getChild( t );
				}
			  , setAccess: function ( l )
				{
					$('#access button').each( function() {
						$(this).removeClass('active').addClass(
							( this.value===l ) ? 'active' : ''
						);
					} );
				}
			  , restricted: function ( r )
				{
					$('#restricted').toggle(!r);
					if (r)
					{
						this.modifiable(!r);
					}
				}
			  , modifiable: function ( m )
				{
					modifiable = m;
					if ( Stage.isReady() )
					{
						Stage.list();
						if ( Chart.isReady() )
						{
							Chart.listen(m);
						}
					}
					$('#modifiable').toggle(m);
					$('#unlock').toggleClass('active',m);
					$('#relock').toggleClass('active',!m);
				}
			  , getModifiable: function ( )
				{
					return modifiable;
				}
			  , list: function ( callback )
				{
					var q = '{$and:[{"active":true},' + ( 
							Session.isLoggedIn() 
								? '{$or:[{"access":"public"},{"userid":"'+ Session.getUserid() +'"}]}' 
								: '{"access":"public"}' 
						) + ']}';
					$.ajax( {
						url: mongoURL + '/Charts?q='+q+'&f={"_id":1,"label":1,"date":1}&s={"updated_at":-1,"label":1}'
					  , data: {
							'apiKey': '4f5c06c6e4b0ab4364f0987d'
						}
					  , dataType: 'json'
					  , success: function(data)
						{
							$('#chart ul.dropdown-menu').children().remove();
							$(data).each(
								function()
								{
									$('#chart ul.dropdown-menu').append( '<li><a href="#" id="sq_'+ this._id.$oid +'">'+ this.label +' - '+ this.date +'</a></li>' );
								}
							);

							$('#chart ul.dropdown-menu li a').click( function () {
								Chart.load( '{"_id":{"$oid":"'+ this.id.replace('sq_','') +'"}}' );
								Alert.msg( 'Info', 'Chart loaded.' );
							} );
							
							if ( callback )
							{
								callback();
							}
						}
					} );
				}
			  , first: function ( )
				{
					return $('#chart ul.dropdown-menu li a').first().attr('id').replace('sq_','');
				}
			  , background: function ( )
				{
					this.createLayer('background');
					var _backplane = new Kinetic.Rect( {
						x: 0
					  , y: 0
					  , width: canvasStage.width
					  , height: canvasStage.height
					  , fill: '#FFF'
					  , name: 'backplane'
					} );
					_backplane.on(
						'click'
					  , function()
						{
							Editor.delo();
							Chart.activeSkill(false);
							Stage.drawQueue();
						}
					);
					canvasLayers.background.add(_backplane);
				}
			  , quad: function ( )
				{
					this.createLayer('quad');
					var cx = canvasLayers.quad.getContext('2d')
					  , x = stageData.x
					  , y = stageData.y
					  , r = stageData.r
					  , w = stageData.w
					  , o = stageData.o
					  , c = stageData.c
					  , l = stageData.l
					  , _quad = new Kinetic.Group( { name: 'quad' } )
					  , chartData = Chart.get()
					  , quadText = function ( x, y, a, b, l, c )
						{
							return new Kinetic.Text( {
								x: x
							  , y: y
							  , text: l
							  , fill: '#FFF'
							  , fontSize: 14
							  , fontFamily: 'Arial'
							  , textFill: c
							  , align: a
							  , verticalAlign: b
							} );
						}
					  , quadTitle = function ( x, y, a, b, l, c, n )
						{
							var title = quadText( x, y, a, b, l, c );
							title.setFontSize( 16 );
							title.setTextFill( '#999' );
							title.setFontStyle( 'italic' );
							title.name = n;

							title.on(
								'dblclick'
							  , function()
								{
									Editor.inputTitle( this, x, y );
									//socket.emit( 'input', d );
									//not jquery
									//e.preventDefault();
									//e.stopPropagation();
								}
							);

							return title;
						}
					  , arrowHead = function ( x, y, a, c, cx )
						{
							return new Kinetic.Shape( {
								drawFunc: function() {
									cx.beginPath();
										cx.lineTo( -20,  0 );
										cx.lineTo( -20,  ((a===0)?1:-1)*10 );
										cx.lineTo(   0,  0 );
									cx.closePath();
									this.fillStroke();
								}
							  , x: x
							  , y: y
							  , rotation: a
							  , fill: c
							  , stroke: c
							  , strokeWidth: 2
							} );
						}
					  , arrowText = function ( x, y, a, c, cx, t, b )
						{
							var _text = new Kinetic.Group( {} );
							_text.add(
								new Kinetic.Text( {
									x: x
								  , y: y
								  , rotation: a
								  , text: t
								  , fill: b
								  , padding: 5
								  , fontSize: 16
								  , fontFamily: 'Arial'
								  , textFill: c
								  , align: 'center'
								  , verticalAlign: 'middle'
								  , name: 'arrowText'
								} )
							);
							_text.add(
								new Kinetic.Shape( {
									drawFunc: function() {
										var w = _text.getChild('arrowText').getTextWidth()/2+5
										  , h = _text.getChild('arrowText').getTextHeight()/2+5;
										cx.beginPath();
										cx.moveTo( -w, -h );
										cx.lineTo( -w,  h );
										cx.moveTo(  w, -h );
										cx.lineTo(  w,  h );
										this.fillStroke();
									}
								  , x: x
								  , y: y
								  , rotation: a
								  , stroke: c
								  , strokeWidth: 2
								} )
							);
							return _text;
						};
					_quad.add(
						new Kinetic.Shape( {
							drawFunc: function() {
								cx.beginPath();
									cx.moveTo( x+r, y );
									cx.lineTo( x+w-r, y );
									cx.arc( x+w-r, y+r, r, 3*Math.PI/2, 0, false );
									cx.lineTo( x+w, y+w-r);
									cx.arc( x+w-r, y+w-r, r, 0, Math.PI/2, false );
									cx.lineTo( x+r, y+w);
									cx.arc( x+r, y+w-r, r, Math.PI/2, Math.PI, false );
									cx.lineTo( x, y+r );
									cx.arc( x+r, y+r, r, Math.PI, 3*Math.PI/2, false );
								cx.closePath();
								this.fillStroke();
							}
						  , fill: gradient( 300, c.b[0], c.b[1], cx )
						  , stroke: c.q
						  , strokeWidth: 4
						} )
					);
					_quad.add(
						new Kinetic.Shape( {
							drawFunc: function() {
								cx.beginPath();
								cx.moveTo( x, y+w/2 );
								cx.lineTo( x+w, y+w/2 );
								cx.moveTo( x+w/2, y );
								cx.lineTo( x+w/2, y+w );
								this.fillStroke();
							}
						  , stroke: c.q
						  , strokeWidth: 2
						} )
					);
					_quad.add(
						quadTitle( x+w/2, y-32, 'center', 'top', chartData.label, c.t, 'label' )
					);
					_quad.add(
						quadText( x+r/2, y+w+5, 'left', 'top', l.III, c.t )
					);
					_quad.add(
						quadText( x+w-r/2, y+w+5, 'right', 'top', l.IV, c.t )
					);
					_quad.add(
						quadText( x+r/2, y-5, 'left', 'bottom', l.II, c.t )
					);
					_quad.add(
						quadText( x+w-r/2, y-5, 'right', 'bottom', l.I, c.t )
					);
					_quad.add(
						quadTitle( x+w/2, y+w+14, 'center', 'top', chartData.date, c.t , 'date' )
					);
					_quad.add(
						new Kinetic.Shape( {
							drawFunc: function() {
								cx.beginPath();
								cx.moveTo( x-o, y+r );
								cx.lineTo( x-o, y+w+o );
								cx.arc( x-o+r, y+w+o, r, Math.PI, Math.PI/2, true );
								cx.lineTo( x+w-r, y+w+o+r );
								this.fillStroke();
							}
						  , stroke: c.t
						  , strokeWidth: 2
						} )
					);
					_quad.add(
						arrowText( x+w/2, y+o+w+r, 0, c.t, cx, l.h, c.b[0] )
					);
					_quad.add(
						arrowHead( x+w-r, y+o+w+r, 0, c.t, cx )
					);
					_quad.add(
						arrowText( x-o, y+w/2, Math.PI*3/2, c.t, cx, l.v, c.b[0] )
					);
					_quad.add(
						arrowHead( x-o, y+r, Math.PI*3/2, c.t, cx )
					);

					canvasLayers.quad.add( _quad );
				}
			};
		}() );

	/* ------------------------------- CHART ------------------------------- */

	var Chart = ( function ( )
		{
			var ready = false
			  , chartData = {}
			  , activeSkill = false;

			/*--------------------------------------*/
			$('button#skillnew').click( function() {
				Skill.create();
				Stage.drawQueue();
			} );
			$('button#skilldelete').click( function() {
				Skill.remove();
				Stage.drawQueue();
			} );
			$('button#skillcopy').click( function() {
				Skill.copy();
				Stage.drawQueue();
			} );
			/*--------------------------------------*/
			
			return {
				load: function ( query )
				{
					ready = false;
					$.ajax( {
						url: mongoURL + '/Charts?q=' + query
					  , data: {
							'apiKey': '4f5c06c6e4b0ab4364f0987d'
						}
					  , dataType: 'json'
					  , success: function( data )
						{
							if ( data )
							{
								chartData = data[0];
								ready = true;
			
								if ( !Stage.isReady() )
								{
									Stage.load( chartData.theme );
								}
								else
								{
									Stage.draw();
								}
							}
							else
							{
								Alert.msg( 'Error', 'Chart did not load.' );
							}
						}
					  , failure: function ( )
						{
							Alert.msg( 'Error', 'Chart did not load.' );
						}
					} );
				}
			  , isReady: function ( )
				{
					return ready;
				}
			  , get: function ( )
				{
					return chartData;
				}
			  , draw: function ( )
				{
					var types = chartData.types
					  , type = {}
					  , listen = ( this.isOwner( Session.getUserid() ) && Stage.getModifiable() ) 
					  , t
					  , s;

					for ( t=0; t<types.length; t+=1 )
					{
						type = types[t];

						Stage.createLayer(type.n);

						for ( s=0; s<type.skills.length; s+=1 )
						{
							Stage.getLayer(type.n).add( Skill.draw( type, type.skills[s] ) );
							Stage.getLayer(types[t].n).listen(listen);
						}
					}
					Stage.setAccess( chartData.access );
					Stage.restricted( !Chart.isOwner( Session.getUserid() ) );
				}
			  , listen: function ( b )
				{
					var types = chartData.types
					  , t;

					for ( t=0; t<types.length; t+=1 )
					{
						Stage.getLayer(types[t].n).listen(b);
					}
				}
			  , isOwner: function ( o )
			    {
				    return ( o === chartData.userid );
			    }
			  , activeSkill: function ( s )
				{
					if ( typeof s !== 'undefined' )
					{
						if ( activeSkill )
						{
							activeSkill.halo(0);
						}
						activeSkill = s;
					}
					else
					{
						return activeSkill;
					}
				}
			  , save: function ( )
				{
					var data = {}
					  , _canvas = []
					  , t
					  , s;
					data.active = true;
					data.date = Stage.getTitle('date').getText();
					data.label = Stage.getTitle('label').getText();
					data.access = chartData.access;
					data.types = chartData.types;
					data.theme = ( typeof chartData.theme !== 'undefined' ) ? chartData.theme : '4f8134c5e4b08a2eed5f36c0';
					data.updated_at = new Date();
					for ( t=0; t<data.types.length; t+=1 )
					{
						_canvas = Stage.getLayer(data.types[t].n).getChildren();
						data.types[t].skills = [];

						for ( s=0; s<_canvas.length; s+=1 )
						{
							data.types[t].skills[s] = {
								x: _canvas[s].x
							  , y: _canvas[s].y
							  , r: _canvas[s].data.r
							  , l: _canvas[s].data.l
							  , n: _canvas[s].data.s
							};
						}
					}

					Stage.isReady(false);

					if ( chartData.hasOwnProperty('_id') )
					{
						$.ajax( {
							url: mongoURL +'/Charts/'+ chartData._id.$oid +'?apiKey=4f5c06c6e4b0ab4364f0987d'
						  , data: JSON.stringify( { "$set" : data } )
						  , type: 'PUT'
						  , contentType: 'application/json'
						  , success: function () {
								Chart.load( '{"_id":{"$oid":"'+ chartData._id.$oid +'"}}' );
								Stage.list();
								Alert.msg( 'Success', 'Chart saved.');
							}
						} );
					}
					else
					{
						data.created_at = data.updated_at;
						data.userid = Session.getUserid();
						$.ajax( {
							url: mongoURL + '/Charts?apiKey=4f5c06c6e4b0ab4364f0987d'
						  , data: JSON.stringify( data )
						  , type: 'POST'
						  , contentType: 'application/json'
						  , success: function () {
								Stage.list( function() {
									Chart.load( '{"_id":{"$oid":"'+ Stage.first() +'"}}' );
								} );
								Alert.msg( 'Success', 'Chart created.');
							}
						} );
					}
				}
			  , share: function ( )
				{

				}
			  , access: function ( level )
				{
					if ( chartData.hasOwnProperty('_id') )
					{
						var data = {
							"access": level
						};
	
						$.ajax( {
							url: mongoURL + '/Charts/'+ chartData._id.$oid +'?apiKey=4f5c06c6e4b0ab4364f0987d'
						  ,	data: JSON.stringify( { "$set" : data } )
						  , type: 'PUT'
						  ,	contentType: 'application/json'
						  , success: function () {
								Alert.msg('Success','Chart access changed.');
							}
						} );
					}
				}
			  , reset: function ( )
				{
					Stage.draw();
				}
			  , create: function ( )
				{
					var types = chartData.types
					  , date = new Date()
					  , newLabel = 'New Chart'
					  , newDate = fmtMonth( date.getMonth() ) +' '+ date.getFullYear()
					  , t;

					for ( t=0; t<types.length; t+=1 )
					{
						types[t].skills = [];
						Stage.getLayer( types[t].n ).removeChildren();
						Stage.enqueue( types[t].n );
					}

					delete chartData._id;
					chartData.access = 'private';
					chartData.active = true;
					chartData.label = newLabel;
					chartData.date = newDate;

					Stage.setAccess( 'private' );
					Stage.getTitle('label').setText( newLabel );
					Stage.getTitle('date').setText( newDate );
					Stage.enqueue('quad');

					Skill.create();
					//Alert.msg('Info','Chart created.');
				}
			  , copy: function ( )
				{
					var date = new Date()
					  , newLabel = Stage.getTitle('label').getText() + ' - Copy'
					  , newDate = fmtMonth( date.getMonth() ) +' '+ date.getFullYear();

					delete chartData._id;
					chartData.active = true;
					chartData.label = newLabel;
					chartData.date = newDate;

					Stage.getTitle('label').setText( newLabel );
					Stage.getTitle('date').setText( newDate );

					Stage.enqueue('quad');
					Alert.msg('Info','Chart copied.');
				}
			  , remove: function ( )
				{
					if ( chartData.hasOwnProperty('_id') )
					{
						$.ajax( {
							url: rootURL + '/quad/'+ chartData._id.$oid +'/delete'
						  , type: 'POST'
						  ,	contentType: 'application/json'
						  , success: function () {
								Alert.msg('Success','Chart removed.');
								Stage.list();
								Chart.create();
								Skill.create();
							}
						} );
					}
					else
					{
						this.create();
						Skill.create();
					}
				}
			};
		}() );

	/* ------------------------------- SKILL ------------------------------- */

	var Skill = ( function ( )
		{
			var stageData = {}
			  , chartData = {};

			return {
				draw: function ( t, s )
				{
					//var color = relative to size
					//detect edges, collision
					stageData = Stage.get();
					chartData = Chart.get();

					var a = 'start'
					  , b = 'middle'
					  , c = stageData.c
					  , _skill = new Kinetic.Group( {
							name: s.n
						  , x: s.x
						  , y: s.y
						  , data: { l:s.l, r:s.r, s:s.n, t:t.n }
						  , draggable: true
						} );
					_skill.add(
						new Kinetic.Circle( {
							x: 0
						  , y: 0
						  , radius: s.r
						  , fill: c.p
						  , stroke: t.c
						  , strokeWidth: 1
						  , name: 'circle'
						} )
					);
					_skill.add(
						new Kinetic.Circle( {
							x: 0
						  , y: 0
						  , radius: s.r+1
						  , stroke: t.c
						  , alpha: 0.5
						  , strokeWidth: 2
						  , visible: false
						  , name: 'halo'
						} )
					);
					_skill.add(
						new Kinetic.Text( {
							x: s.r+3
						  , y: 1
						  , text: s.l
						  , textFill: t.c
						  , padding: 2
						  , fontSize: 12
						  , fontFamily: 'Arial'
						  , align: a
						  , verticalAlign: b
						  , name: 'label'
						} )
					);
					_skill.on( 'mouseover', function() {
						document.body.style.cursor = 'pointer';
					} );
					_skill.on( 'mouseout', function() {
						document.body.style.cursor = 'default';
					} );
					_skill.on(
						'dblclick'
					  , function()
						{
							var d = _.extend(
								this.data
							  , {
									h: this.getChild('label').getTextHeight()+8
								  , w: this.getChild('label').getTextWidth()+4
								  , x: this.x+9
								  , y: this.y-12
								}
							);

							this.setActive(true);

							this.halo(-1);

							Editor.mindSelect().setActive( d.r );
							Editor.typeSelect().setActive( d.t );

							Editor.get().setPosition( d.x-37, d.y-14 );
							Editor.get().show();
							Editor.get().listen(true);

							Editor.inputSkill( d );

							Editor.activate( true );

							Stage.enqueue('editor');
							this.getParent().enqueue();
							Stage.drawQueue();
							//socket.emit( 'input', d );
							//not jquery
							//e.preventDefault();
							//e.stopPropagation();
						}
					);
					_skill.on(
						'dragend'
					  , function()
						{
							var m = this.getAbsolutePosition();
							this.setActive(true);
							Stage.drawQueue();
							//socket.emit( 'move', { s: this.data.s, t: this.data.t, x: m.x, y: m.y } );
						}
					);
					_skill.on(
						'click'
					  , function()
						{
							this.setActive(true);
							Stage.drawQueue();
						}
					);
					_skill.move = function ( x, y )
						{
							this.setPosition( x, y );
						};
					_skill.halo = function ( state )
						{
							if ( state === -1 )
							{
								this.getChild('halo').hide();
								this.getChild('circle').hide();
								this.getChild('label').hide();
							}
							else if ( state === 1 )
							{
								this.getChild('halo').show();
								this.getChild('circle').show();
								this.getChild('label').show();
							}
							else
							{
								this.getChild('halo').hide();
								this.getChild('circle').show();
								this.getChild('label').show();
							}
							this.getParent().enqueue();

							//socket.emit( 'halo', this.data );
						};
					_skill.setActive = function ( state )
						{
							Editor.delo();

							Chart.activeSkill(false);
							if ( state )
							{
								Chart.activeSkill( this );
								this.halo(1);
							}
						};
					return _skill;
				}
			  , create: function ( )
				{
					var t = Chart.get().types[0]
					  , s = {
							x: stageData.x+stageData.w/2
						  , y: stageData.y+stageData.w/2
						  , l: 'New Skill'
						  , n: uuid()
						  , r: 6
						}
					  , skill = Skill.draw( t, s );

					Stage.getLayer(t.n).add( skill );
					skill.setActive(true);
					Stage.enqueue(t.n);
				}
			  , copy: function ( )
				{
					var s = Chart.activeSkill()
					  , t
					  , d
					  , skill = {};
					if ( s )
					{
						t = {
							c: s.getChild('label').getTextFill()
						  , n: s.data.t
						};
						d = {
							x: stageData.x+stageData.w/2
						  , y: stageData.y+stageData.w/2
						  , l: s.data.l + ' - Copy'
						  , n: uuid()
						  , r: s.data.r
						};
						skill = Skill.draw( t, d );

						Stage.getLayer(t.n).add( skill );
						skill.setActive(true);
						Stage.enqueue(t.n);
					}
				}
			  , remove: function ( )
				{
					var s = Chart.activeSkill();
					if ( s )
					{
						s.setActive(false);
						s.getParent().remove(s);
					}
				}
			};
		}() );

	/* ------------------------------- LEGEND ------------------------------- */

	var Legend = ( function ( )
		{
			var stageData = {}
			  , chartData = {};

			return {
				draw: function ( )
				{
					stageData = Stage.get();
					chartData = Chart.get();

					Stage.createLayer('legend');

					var _legend = Stage.getLayer('legend');

					_legend.add( this.mind( stageData.p ) );
					_legend.add( this.type( chartData.types ) );

					Stage.addLayer( _legend ); //need to add to stage before being able to calculate size and position

					this.mind().adjust();
					this.type().adjust();
				}
			  , mind: function ( minds )
				{
					if ( typeof minds !== 'object' )
					{
						return Stage.getLayer('legend').getChild('mindLegend');
					}
					var c = stageData.c
					  , _mindLegend = new Kinetic.Group( {
							name: 'mindLegend'
						  , x: stageData.x+stageData.w+10
						  , y: stageData.y+stageData.w/2
						  , rotation: 3*Math.PI/2
						} )
					  , i
					  , m;
					for ( i=0; i<minds.length; i+=1 )
					{
						m = minds[i];
						_mindLegend.add(
							new Kinetic.Circle( {
								x: 0
							  , y: (12-m.radius)/2-1
							  , name: 'c' + m.label
							  , radius: m.radius
							  , fill: c.p
							  , stroke: c.t
							  , strokeWidth: 1
							} )
						);
						_mindLegend.add(
							new Kinetic.Text( {
								x: 0
							  , y: 0
							  , text: m.label
							  , name: m.label
							  , fill: '#FFF'
							  , fontSize: 12
							  , fontStyle: 'italic'
							  , fontFamily: 'Verdana'
							  , textFill: c.t
							  , align: 'left'
							  , verticalAlign: 'top'
							} )
						);
					}
					_mindLegend.adjust = function ( )
						{
							var o = 0
							  , i
							  , m
							  , c
							  , l;
							for ( i=0; i<minds.length; i+=1 )
							{
								m = minds[i];
								c = this.getChild( 'c'+m.label );
								c.move( o, m.radius/2 );
								l = this.getChild( m.label );
								l.move( o + m.radius + 3, -1 );
								o += l.getTextWidth() + 20 + m.radius + 3;
							}
							this.move( 5, o/2 );
						};
					return _mindLegend;
				}
			  , type: function ( types )
				{
					if ( typeof types !== 'object' )
					{
						return Stage.getLayer('legend').getChild('typeLegend');
					}
					var _typeLegend = new Kinetic.Group( {
							name: 'typeLegend'
						  , x: stageData.x+stageData.w+10
						  , y: stageData.y+stageData.w/2
						  , rotation: 3*Math.PI/2
						} )
					  , i
					  , t
					  , _legend
					  , clickLegend = function ()
							{
								var l = Stage.getLayer(this.name);
								l.visible = ( l.visible ) ? false : true;
								Editor.delo();
								l.enqueue();
								Stage.drawQueue();
								//socket.emit( 'tggl', this.name );
							}
					  , overLegend = function() {
							document.body.style.cursor = 'pointer';
						}
					  , outLegend = function() {
							document.body.style.cursor = 'default';
						};
					for ( i=0; i<types.length; i+=1 )
					{
						t = types[i];
						_legend = new Kinetic.Text( {
								x: 0
							  , y: 0
							  , text: t.l
							  , name: t.n
							  , fill: '#FFF'
							  , fontSize: 12
							  , fontStyle: 'italic'
							  , chartIndex: i
							  , fontFamily: 'Verdana'
							  , textFill: t.c
							  , align: 'left'
							  , verticalAlign: 'top'
							} );
						_legend.on( 'click',  clickLegend );
						_legend.on( 'mouseover', overLegend );
						_legend.on( 'mouseout', outLegend );
						_typeLegend.add( _legend );
						//offset += cx.measureText(iLegend.name).width;
						//offset += legend.getChild(iLegend.name).getTextWidth();
					}
					_typeLegend.adjust = function ( )
						{
							var o = 0
							  , i
							  , l;
							for ( i=0; i<types.length; i+=1 )
							{
								l = this.getChild( types[i].n );
								l.move( o, 0 );
								o += l.getTextWidth() + 20;
							}
							this.move( 30, o/2 );
						};
					return _typeLegend;
				}
			};
		}() );

	/* ------------------------------- EDITOR ------------------------------- */

	var Editor = ( function ( )
		{
			var stageData = {}
			  , chartData = {}
			  , active = false
			  , activeTitle = false;
			  
			/*--------------------------------------*/
			$('div#inputSkill').storage( {
				storageKey: 'input'
			  , onExit: function( elem, text )
				{
					var $this = $(this)
					  , s = Chart.activeSkill();
					s.getChild('label').setText(text);
					s.getChild('label').show();
					s.data.l = text;
					s.getParent().enqueue();
					Stage.drawQueue();
					elem.hide();
				}
			  , store: false
			} );
			/*--------------------------------------*/
			$('div#inputTitle').storage( {
				storageKey: 'input'
			  , onExit: function( elem, text )
				{
					var $this = $(this)
					  , t = activeTitle;
					t.setText(text);
					t.show();
					Stage.enqueue('quad');
					Stage.drawQueue();
					elem.hide();
					activeTitle = false;
				}
			  , store: false
			} );
			/*--------------------------------------*/
			
			return {
				get: function ( )
				{
					return Stage.getLayer('editor').getChild('skillEditor');
				}
			  , activate: function ( b )
				{
					active = b;
				}
			  , draw: function ( )
				{
					stageData = Stage.get();
					chartData = Chart.get();

					Stage.createLayer('editor');

					var _editor = new Kinetic.Group( {
							x: 300
						  , y: 300
						  , t: 0
						  , s: 0
						  , width: 16
						  , height: 24
						  , name: 'skillEditor'
						  , visible: false
						} );

					_editor.add( this.mindSelect( stageData.p ) );
					_editor.add( this.typeSelect( chartData.types ) );

					Stage.getLayer('editor').add( _editor );
				}
			  , mindSelect: function ( minds )
				{
					if ( typeof minds !== 'object' )
					{
						return Stage.getLayer('editor').getChild('skillEditor').getChild('mindSelect');
					}
					var _mindSelect = new Kinetic.Group( {
							x: 28
						  , y: 8
						  , t: 0
						  , s: 0
						  , width: 8
						  , height: 24
						  , name: 'mindSelect'
						  , visible: true
						} )
					  , i
					  , r
					  , _mind
					  , clickMind = function ( )
							{
								if ( !active )
								{
									return false;
								}

								var s = Chart.activeSkill()
								  , r = this.getRadius();
								s.data.r = r;

								s.getChild('circle').setRadius( r );
								s.getChild('halo').setRadius( r+1 );
								s.getChild('label').setPosition( r+3, 0 );

								this.setActive();

								s.getParent().enqueue();
								Stage.enqueue('editor');
								Stage.drawQueue();
							}
					  , overMind = function ( ) 
							{
								document.body.style.cursor = 'pointer';
								this.fill = stageData.c.h;
								Stage.drawLayer('editor');
							}
					  , outMind = function ( ) {
								document.body.style.cursor = 'default';
								this.fill = (this.active) ? stageData.c.a : stageData.c.p;
								Stage.drawLayer('editor');
							}
					  , activeMind = function ( )
							{
								this.getParent().clearActive();
								this.active = true;
								this.setFill(stageData.c.a);
							};

					for ( i=0; i<minds.length; i+=1 )
					{
						r = minds[i].radius;
						_mind = new Kinetic.Circle(
							_.extend(
								{
									x: 0
								  , y: 0
								  , radius: 0
								  , fill: stageData.c.p
								  , stroke: stageData.c.t
								  , strokeWidth: 1
								  , alpha: 0.7
								  , name: 'mind0'
								}
							  , {
									y: (2-i)*18
								  , radius: r
								  , name: 'mindOption'+r
								}
							)
						);
						_mind.on( 'click', clickMind );
						_mind.on( 'mouseover', overMind );
						_mind.on( 'mouseout', outMind );
						_mind.setActive = activeMind;
						_mindSelect.add(_mind);
					}
					_mindSelect.setActive = function ( t )
					{
						//this.clearActive();
						this.getChild('mindOption'+t).setActive();
					};
					_mindSelect.clearActive = function ( )
					{
						var minds = this.getChildren()
						  , i;
						for ( i=0; i<minds.length; i+=1 )
						{
							minds[i].setFill(stageData.c.p);
							minds[i].active = false;
						}
					};
					return _mindSelect;
				}
			  , typeSelect: function ( types ) 
				{
					if ( typeof types !== 'object' )
					{
						return Stage.getLayer('editor').getChild('skillEditor').getChild('typeSelect');
					}
					var _typeSelect = new Kinetic.Group( {
							x: 0
						  , y: 0
						  , t: 0
						  , width: 8
						  , height: 24
						  , name: 'typeSelect'
						  , visible: true
						} )
					  , i
					  , _type
					  , _typeData = {
							x: 0
						  , y: 0
						  , t: 0
						  , height: 16
						  , width: 16
						  , fill: '#000'
						  , stroke: stageData.c.t
						  , strokeWidth: 1
						  , alpha: 0.7
						  , name: ''
						}
					  , clickType = function ( ) 
							{
								if ( !active )
								{
									return false;
								}

								var s = Chart.activeSkill()
								  , c = this.getFill();
								s.data.t = this.t;

								s.getChild('circle').setStroke(c);
								s.getChild('halo').setStroke(c);
								s.getChild('label').setTextFill(c);

								this.setActive();

								s.getParent().enqueue();
								s.moveTo( Stage.getLayer(this.t) );
								s.setActive();

								s.getParent().enqueue();
								Stage.enqueue('editor');
								Stage.drawQueue();
							}
					  , overType = function ( ) 
							{
								document.body.style.cursor = 'pointer';
								this.stroke = stageData.c.h;
								Stage.drawLayer('editor');
							}
					  , outType = function ( ) 
							{
								document.body.style.cursor = 'default';
								this.stroke = (this.active) ? stageData.c.a : stageData.c.t;
								Stage.drawLayer('editor');
							}
					  , activeType = function ( ) 
							{
								this.getParent().clearActive();
								this.active = true;
								this.setStroke(stageData.c.a);
							};
					for ( i=0; i<types.length; i+=1 )
					{
						_type = new Kinetic.Rect(
							_.extend(
								_typeData
							  , {
									y:i*18
								  , t:types[i].n
								  , fill:types[i].c
								  , name:'typeOption'+types[i].n
								}
							)
						);
						_type.on(
							'click'
						  , clickType
						);
						_type.on(
							'mouseover'
						  ,  overType
						);
						_type.on(
							'mouseout'
						  ,  outType
						);
						_type.setActive = activeType;

						_typeSelect.add( _type );
					}
					_typeSelect.setActive = function ( t )
						{
							//this.clearActive();
							this.getChild('typeOption'+t).setActive();
						};
					_typeSelect.clearActive = function ( )
						{
							var types = this.getChildren()
							  , i;
							for ( i=0; i<types.length; i+=1 )
							{
								types[i].setStroke(stageData.c.t);
								types[i].active = false;
							}
						};
					return _typeSelect;
				}
			  , delo: function ( )
				{
					if ( active )
					{
						this.get().hide();
						this.get().listen(false);
						Stage.getLayer('editor').enqueue();
					}
					active = false;
				}
			  , inputSkill: function ( d )
				{
					$('div#inputSkill').css(
							{
								"left": d.x + 4
							  , "top": d.y
							//, "width": d.w
							  , "height": d.h
							  , "font-size": "16px"
							  , "font-style": "normal"
							}
						).html(d.l).show().focus();
				}
			  , inputTitle: function ( d, x, y )
				{
					activeTitle = d;

					var h = d.getTextHeight()+8
					  , w = d.getTextWidth()+4;

					$('div#inputTitle').css(
							{
								"left": x-w/2
							  , "top": y+h/2-16
							//, "width": w
							  , "height": h
							  , "font-size": "20px"
							  , "font-style": "italic"
							}
						).html(d.getText()).show().focus();

					d.hide();
					Stage.enqueue('quad');
					Stage.drawQueue();
				}
			};
		}() );

	/* ------------------------------- ALERT ------------------------------- */

	var Alert = ( function ( )
		{
			var timeout;
			$('.alert').alert();

			return {
				msg: function ( s, m )
				{
					clearTimeout( timeout );		
					$('#alert').html(
		'<div class="alert alert-block alert-' + s.toLowerCase() + ' fade in">' +
			'<a class="close" data-dismiss="alert" href="#">×</a>' + 
			'<h4 class="alert-heading">' + s+((s!=='Info')?'!':'') + '</h4>' + 
			m + 
		'</div>'
					);
					timeout = setTimeout( this.close, 3000 );
				}
			  , close: function ( )
				{
					$('.alert').alert('close');
				}
			};
		}() );

	/* ------------------------------- SESSION ------------------------------- */

	var Session = ( function ( )
		{
			var hasSession = false
			  , sesionData = {'_id': 0};
			
			/*--------------------------------------*/
			$('#login').click( function() {
				if ( !$(this).hasClass('active') )
				{
					Session.login();
				}
			} );
			$('#logout').click( function() {
				if ( !$(this).hasClass('active') )
				{
					Session.logout();
				}
			} );
			$('#session-modal .modal-body').on( 'click', '#session-authenticate', function() { Session.authenticate(); } );
			$('#session-modal .modal-body').on( 'click', '#session-create', function() { Session.create(); });
			$('#session-modal .modal-body').on( 'click', '#session-login', function() { Session.login(); } );
			$('#session-modal .modal-body').on( 'click', '#session-logout', function() { Session.logout(); } );
			$('#session-modal .modal-body').on( 'click', '#session-save', function() { Session.save(); } );
			$('#session-modal .modal-body').on( 'submit', '#session-form-auth', function(e) { Session.authenticate(); e.preventDefault(); } );
			$('#session-modal .modal-body').on( 'submit', '#session-form-create', function(e) { Session.save(); e.preventDefault(); } );
			/*--------------------------------------*/
			
			return {
				init: function ( callback )
				{
					$.ajax( {
						url: rootURL + '/user/session'
					  , dataType: 'json'
					  , success: function( data )
						{
							Session.set( data );
							Stage.modifiable(false);
							callback();
						}
					  , failure: function ( )
						{
							Alert.msg( 'Error', 'Online login not available.' );
							callback();
						}
					} );
				}
			  , login: function ( )
				{
					$.ajax( {
						url: rootURL + '/user/login'
					  , dataType: 'html'
					  , success: function( data )
						{
							$('#session-modal .modal-body').html(data);
							$('#session-modal').modal('show');
							$('#password').focus();
						}
					  , failure: function ( )
						{
							Alert.msg( 'Error', 'Online login not available.' );
						}
					} );
				}
			  , logout: function ( )
				{
					$.ajax( {
						url: rootURL + '/user/logout'
					  , dataType: 'json'
					  , success: function( data )
						{
							Session.set( data );
							Stage.restricted(true);
							$('#session-modal').modal('hide');
							Alert.msg( 'Success', 'You are logged out.' );
						}
					  , failure: function ( )
						{
							Alert.msg( 'Error', 'Online login not available.' );
						}
					} );
				}
			  , authenticate: function ( )
				{
					var post = {
						"password": $('#password').val()
					};
					$.ajax( {
						url: rootURL + '/user/authenticate'
					  , type: 'POST'
					  , data: JSON.stringify( post )
					  ,	contentType: 'application/json'
					  , dataType: 'json'
					  , success: function ( data ) 
						{
							Session.set( data );
							Stage.restricted( !data.hasSession || !Chart.isOwner(Session.getUserid()) );
						}
					  , failure: function ( )
						{
							Alert.msg( 'Error', 'Online login not available.' );
						}
					} );			
				}
			  , create: function ( )
				{
					$.ajax( {
						url: rootURL + '/user/create'
					  , dataType: 'html'
					  , success: function( data )
						{
							$('#session-modal .modal-body').html(data);
							$('#session-modal').modal('show');
							$('#name').focus();
						}
					  , failure: function ( )
						{
							Alert.msg( 'Error', 'Online login not available.' );
						}
					} );
				}
			  , save: function ( )
				{
					var post = {
						"name": $('#name').val()
					  , "email": $('#email').val()
					  , "password": $('#password').val()
					};
					$.ajax( {
						url: rootURL + '/user/create'
					  , type: 'POST'
					  , data: JSON.stringify( post )
					  ,	contentType: 'application/json'
					  , dataType: 'json'
					  , success: function ( data ) {
							Session.set( data );
						}
					  , failure: function ( )
						{
							Alert.msg( 'Error', 'Online login not available.' );
						}
					} );			
				}
			  , isLoggedIn: function ( )
				{
					return ( hasSession !== false );
				}
			  , set: function ( data )
				{
					hasSession = data.hasSession;
					sessionData = data.session;
					$('#userid').val(data.session._id);
					if ( data.html )
					{
						$('#session-modal .modal-body').html(data.html);
					}
					$('#login').toggleClass('active',hasSession);
					$('#logout').toggleClass('active',!hasSession);
				}
			  , getUserid: function ( )
				{
					return ( hasSession !== false ) ? sessionData._id : '0';
				}
			};
		}() );
		
	/* ------------------------------- UTILITY ------------------------------- */

	var f = [];
	var factorial = function ( n )
		{
			return ( n===0 || n===1 )
				? 1
				: (f[n]>0)
					? f[n]
					: f[n]=factorial(n-1)*n;
		};

	var calc = function ( a, b )
		{
			return (a>b)?0:a+calc(a+1,b);
		};

	var fmtMonth = function ( m )
		{
			return ['January','February','March','April','May','June','July','August','September','October','November','December'][m];
		};

	//http://blog.snowfinch.net/post/3254029029/uuid-v4-js
	var uuid = function ( )
		{
			var uuid = ''
			  , i
			  , random;
			for ( i=0; i<32; i+=1 )
			{
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20)
				{
					uuid += '-';
				}
				uuid += ( i === 12 ? 4 : ( i === 16 ? (random & 3 | 8) : random ) ).toString(16);
			}
			return uuid;
		};

	var gradient = function ( r, colourOne, colourTwo, canvasContext )
		{
			var gradient = canvasContext.createRadialGradient( r, r, 0, r, r, r );
				gradient.addColorStop( 0, colourOne );
				gradient.addColorStop( 1, colourTwo );
			return gradient;
		};

//	var animate = function () {
//
//	};

	init( 'canvas', 640, 640 );

}(jQuery) );
