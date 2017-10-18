define(["wrap-canvas","sender","contextWrapper"],function(wrapCanvas, sender, contextWrapper){
	var factory = function(c){
		var w = c.w,
			h = c.h,
			context = c.context,
			size = 1,
			xShift = 0,
			yShift = 0,
			onDraw = sender(),
			onClick = sender(),
			onDragEnd = sender(),
			onContextMenu = sender(function(a,b){return a && b}, true),
			onDragStart = sender(function(a,b){return a && b}, true),
			zoom = function(factor, centerX, centerY){
				var pCenterX = centerX / size - xShift;
				var pCenterY = centerY / size - yShift;
				var newSize = size * factor;
				if(newSize != size){
					size = newSize;
					xShift = centerX/size - pCenterX;
					yShift = centerY/size - pCenterY;
				}
			},
			makeDrag = function(startMouseX, startMouseY){
				var origXShift, origYShift, currentMouseX, currentMouseY, origSize;
				var resetTo = function(x,y){
					origXShift = xShift;
					origYShift = yShift;
					origSize = size;
					currentMouseX = x;
					currentMouseY = y;
					startMouseX = x;
					startMouseY = y;
				};
				resetTo(startMouseX, startMouseY);
				var origR, currentR;
				var applyDrag = function(){
					xShift = origXShift + (currentMouseX - startMouseX) / size;
					yShift = origYShift + (currentMouseY - startMouseY) / size;
				};
				var applyZoomAndDrag = function(){
					size = origSize;
					applyDrag();
					zoom(currentR / origR, currentMouseX, currentMouseY);
				};
				return {
					drag:function(toX, toY){
						currentMouseX = toX;
						currentMouseY = toY;
						if(currentR == undefined){
							applyDrag();
						}else{
							applyZoomAndDrag();
						}
					},
					startZoom:function(r){
						origR = r;
						currentR = r;
					},
					changeZoom:function(r){
						currentR = r;
						applyZoomAndDrag();
					},
					endZoom:function(){
						origR = undefined;
						currentR = undefined;
						resetTo(currentMouseX, currentMouseY);
					}
				};
			},
			currentDrag = null,
			screenPositionToPoint = function(mX,mY){
				return {
					x:mX / size - xShift,
					y:mY / size - yShift
				};
			},
			positionToMousePosition = function(p){
				return {
					x:(p.x + xShift) * size,
					y:(p.y + yShift) * size
				};
			},
			beginDrag = function(x,y){
				currentDrag = makeDrag(x, y);
			},
			moveDrag = function(x, y){
				if(currentDrag){
					currentDrag.drag(x, y);
				}
			},
			endDrag = function(){
				currentDrag = null;
			},
			startZoom = function(r){
				if(currentDrag){
					currentDrag.startZoom(r);
				}
			},
			changeZoom = function(r){
				if(currentDrag){
					currentDrag.changeZoom(r);
				}
			},
			endZoom = function(){
				if(currentDrag){
					currentDrag.endZoom();
				}
			},
			getViewBox = function(){
				var p1 = screenPositionToPoint(0,0);
				var p2 = screenPositionToPoint(w,h);
				return {
					x:p1.x,
					y:p1.y,
					width:p2.x - p1.x,
					height:p2.y - p1.y
				};
			},
			getScreenRect = function(x,y,width,height){
				var p = positionToMousePosition({x:x,y:y});
				return {
					x:p.x,
					y:p.y,
					width:width * size,
					height:height * size
				};
			},
			setTransform = function(){
				context.setTransform(size, 0, 0, size, xShift * size, yShift * size);
			},
			resetTransform = function(){
				context.setTransform(1,0,0,1,0,0);
			},
			cWrapper = contextWrapper(context, getViewBox, setTransform, resetTransform),
			getSet = function(){
				var firstArgument = arguments[0];
				var map;
				if(typeof firstArgument === "function"){
					map = function(mapper, getViewBox){
						return firstArgument(getViewBox()).map(mapper);
					};
				}else if(typeof firstArgument === "object"){

				}else{
					throw 'unrecognized argument to getSet'
				}
				
				return {
					map:map
				};
			};
		c.addEventListener('click',function(e){
			var pos = screenPositionToPoint(e.clientX, e.clientY);
			pos.shiftKey = e.shiftKey;
			onClick(pos);
		});
		c.addEventListener('positiondragmove',function(e){
			moveDrag(e.detail.toX, e.detail.toY);
			c.drawAll();
		});
		c.addEventListener('positiondragend',function(){
			endDrag();
			onDragEnd();
			c.drawAll();
		});
		c.addEventListener('positiondragstart',function(e){
			var pos = screenPositionToPoint(e.detail.x, e.detail.y);
			if(onDragStart(pos.x, pos.y)){
				beginDrag(e.detail.x, e.detail.y);
			}
		});
		c.addEventListener('startzoom',function(e){
			startZoom(e.detail.r);
		});
		c.addEventListener('changezoom',function(e){
			changeZoom(e.detail.r);
			c.drawAll();
		});
		c.addEventListener('endzoom',function(e){
			endZoom();
		});
		c.onDraw(function(){
			onDraw(cWrapper);
		});
		c.addEventListener('contextmenu',function(e){
			var pos = screenPositionToPoint(e.clientX, e.clientY);
			return onContextMenu(e.clientX, e.clientY, pos.x, pos.y);
		});
		c.addEventListener('wheel',function(e){
			zoom(Math.pow(2, -e.deltaY / 200), e.clientX, e.clientY);
			c.drawAll();
		});
		var areClose = function(x1, y1, x2, y2){
			var screenPoint1 = positionToMousePosition({x:x1,y:y1});
			var screenPoint2 = positionToMousePosition({x:x2,y:y2});
			var d = Math.sqrt(Math.pow(screenPoint1.x - screenPoint2.x,2) + Math.pow(screenPoint1.y - screenPoint2.y,2));
			return d < 15;
		};
		return {
			getSet:getSet,
			onDragMove:function(f){
				c.addEventListener('positiondragmove', function(e){
					var pos = screenPositionToPoint(e.detail.toX, e.detail.toY);
					f(pos.x, pos.y);
				});
			},
			zoom:zoom,
			drawAll:function(){c.drawAll();},
			onDraw:function(f){
				onDraw.add(f);
				c.drawAll();
			},
			onClick:function(f){onClick.add(f);},
			onContextMenu:function(f){onContextMenu.add(f);},
			onDragStart:function(f){onDragStart.add(f);},
			onDragEnd:function(f){onDragEnd.add(f);},
			positionToMousePosition:positionToMousePosition,
			areClose:areClose,
			toDataURL:function(){return c.toDataURL.apply(null,arguments);}
		};
	};
	return function(canvas){
		return factory(wrapCanvas(canvas));
	};
});