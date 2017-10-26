define(["infinitecanvas/wrap-canvas","sender","infinitecanvas/contextWrapper","infinitecanvas/transform","infinitecanvas/context-transform"],function(wrapCanvas, sender, contextWrapper, transform, contextTransform){
	var factory = function(c){
		var w = c.w,
			h = c.h,
			context = c.context,
			coordinateTransform = new transform(1,0,0,1,0,0),
			size = 1,
			xShift = 0,
			yShift = 0,
			onDraw = sender(),
			onClick = sender(),
			onDragEnd = sender(),
			onContextMenu = sender(function(a,b){return a && b}, true),
			onDragStart = sender(function(a,b){return a && b}, true),
			zoom = function(factor, centerX, centerY){
				var pCenterX = centerX / size - xShift / size;
				var pCenterY = centerY / size - yShift / size;
				var newSize = size * factor;
				size = newSize;
				xShift = centerX - pCenterX * size;
				yShift = centerY - pCenterY * size;
				coordinateTransform = coordinateTransform.translate(pCenterX,pCenterY).scale(factor,factor).translate(-pCenterX,-pCenterY);
			},
			makeDrag = function(startMouseX, startMouseY){
				var origXShift, origYShift, currentMouseX, currentMouseY, origSize, origTransform;
				var resetTo = function(x,y){
					origTransform = coordinateTransform;
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
					xShift = origXShift + (currentMouseX - startMouseX);
					yShift = origYShift + (currentMouseY - startMouseY);
					coordinateTransform = transform.translation(currentMouseX - startMouseX, currentMouseY - startMouseY).add(origTransform);

				};
				var applyZoomAndDrag = function(){
					size = origSize;
					xShift = origXShift + (currentMouseX - startMouseX);
					yShift = origYShift + (currentMouseY - startMouseY);
					coordinateTransform = transform.translation(currentMouseX - startMouseX, currentMouseY - startMouseY).add(origTransform);
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
				return coordinateTransform.inverse().apply(mX,mY);
				// return {
				// 	x:mX / size - xShift / size,
				// 	y:mY / size - yShift / size
				// };
			},
			positionToMousePosition = function(p){
				return coordinateTransform.apply(p.x,p.y);
				// return {
				// 	x:(p.x ) * size + xShift,
				// 	y:(p.y ) * size + yShift
				// };
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
			currentTransform,
			currentTransformStack,
			removeTransform = function(){
				currentTransform = new transform(1,0,0,1,0,0);
				currentTransformStack = [];
			},
			saveTransform = function(){
				currentTransformStack.push(currentTransform);
			},
			restoreTransform = function(){
				if(currentTransformStack.length){
					currentTransform = currentTransformStack.pop();
				}
			},
			setTransform = function(){
				var t = currentTransform.before(coordinateTransform);
				context.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
			},
			resetTransform = function(){
				var t = currentTransform;
				context.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
			},
			setCurrentTransform = function(t){
				currentTransform = t;
			},
			addToCurrentTransform = function(t){
				currentTransform = t.before(currentTransform);
			},
			cWrapper = contextWrapper(context, getViewBox, setTransform, resetTransform, setCurrentTransform, addToCurrentTransform, saveTransform, restoreTransform),
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
		c.onClick(function(x,y,shift){
			var pos = screenPositionToPoint(x, y);
			pos.shiftKey = shift;
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
			removeTransform();
			onDraw(cWrapper);
		});
		c.onContextMenu(function(clientX, clientY, preventDefault){
			var pos = screenPositionToPoint(clientX, clientY);
			return onContextMenu(clientX, clientY, pos.x, pos.y, preventDefault);
		});
		c.onWheel(function(x, y, delta){
			zoom(Math.pow(2, -delta / 200), x, y);
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
			areClose:areClose,
			toDataURL:function(){return c.toDataURL.apply(null,arguments);}
		};
	};
	return function(canvas){
		return factory(wrapCanvas(canvas));
	};
});