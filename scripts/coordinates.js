define(["c","sender"],function(c, sender){
	var w = c.w,
		h = c.h,
		size, nx, ny,
		xShift = 0,
		yShift = 0,
		onDraw = sender(),
		onClick = sender(),
		onContextMenu = sender(function(a,b){return a && b}, true),
		onDragStart = sender(function(a,b){return a && b}, true),
		setSize = function(s){
			size = s;
			nx = w / size;
			ny = h / size;
		},
		zoom = function(factor, centerX, centerY){
			var pCenterX = centerX / size - xShift;
			var pCenterY = centerY / size - yShift;
			var newSize = size * factor;
			if(newSize != size){
				setSize(newSize);
				setXShift(centerX/size - pCenterX);
				setYShift(centerY/size - pCenterY);
			}
		},
		setXShift = function(v){
			xShift = v;
		},
		setYShift = function(v){
			yShift = v;
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
				setXShift(origXShift + (currentMouseX - startMouseX) / size);
				setYShift(origYShift + (currentMouseY - startMouseY) / size);
			};
			var applyZoomAndDrag = function(){
				setSize(origSize);
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
	c.onDraw(function(context){
		onDraw(context);
	});
	c.addEventListener('contextmenu',function(e){
		var pos = screenPositionToPoint(e.clientX, e.clientY);
		return onContextMenu(e.clientX, e.clientY, pos.x, pos.y);
	});
	setSize(15);
	var areClose = function(x1, y1, x2, y2){
		var screenPoint1 = positionToMousePosition({x:x1,y:y1});
		var screenPoint2 = positionToMousePosition({x:x2,y:y2});
		var d = Math.sqrt(Math.pow(screenPoint1.x - screenPoint2.x,2) + Math.pow(screenPoint1.y - screenPoint2.y,2));
		return d < 15;
	};
	return {
		w:w,
		h:h,
		getNx:function(){return nx;},
		getScreenRect:getScreenRect,
		getViewBox:getViewBox,
		getNy:function(){return ny;},
		beginDrag:beginDrag,
		onDragMove:function(f){
			c.addEventListener('positiondragmove', function(e){
				var pos = screenPositionToPoint(e.detail.toX, e.detail.toY);
				f(pos.x, pos.y);
			});
		},
		zoom:zoom,
		onDraw:function(f){onDraw.add(f);},
		onClick:function(f){onClick.add(f);},
		onContextMenu:function(f){onContextMenu.add(f);},
		onDragStart:function(f){onDragStart.add(f);},
		screenPositionToPoint:screenPositionToPoint,
		positionToMousePosition:positionToMousePosition,
		areClose:areClose
	};
})