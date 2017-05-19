define(["c"],function(c){
	var w = c.w,
		h = c.h,
		size, nx, ny,
		setSize = function(s){
			size = s;
			nx = Math.ceil(w / size);
			ny = Math.ceil(h / size);
		},
		zoom = function(factor, centerX, centerY){
			c.clear();
			var pCenter = mousePositionToPositionLocation(centerX, centerY);
			var newSize = size * factor;
			if(newSize != size){
				setSize(newSize);
				setXShift(centerX/size - pCenter.x);
				setYShift(centerY/size - pCenter.y);
			}
		},
		xShift = 0,
		yShift = 0,
		xShiftOffset = 0,
		yShiftOffset = 0,
		getOffset = function(v){
			if(v >= 0){
				return v  - Math.floor(v);
			}
			return 1 - getOffset(-v);
		},
		setXShift = function(v){
			xShift = v;
			xShiftOffset = getOffset(v);
		},
		setYShift = function(v){
			yShift = v;
			yShiftOffset = getOffset(v);
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
					//drawAll();
				},
				startZoom:function(r){
					origR = r;
					currentR = r;
				},
				changeZoom:function(r){
					currentR = r;
					applyZoomAndDrag();
					drawAll();
				},
				endZoom:function(){
					origR = undefined;
					currentR = undefined;
					resetTo(currentMouseX, currentMouseY);
				}
			};
		},
		currentDrag = null,
		mousePositionToPositionLocation = function(mX,mY){
			return {
				x:Math.floor(mX / size - xShift),
				y:Math.floor(mY / size - yShift)
			};
		},
		positionToMousePosition = function(p){
			return {
				x:(p.x + xShift) * size,
				y:(p.y + yShift) * size
			};
		},
		drawHorizontalLine = function(context, y){
			context.beginPath();
			context.moveTo(0,y);
			context.lineTo(w,y);
			context.stroke();
		},
		drawVerticalLine = function(context, x){
			context.beginPath();
			context.moveTo(x,0);
			context.lineTo(x,h);
			context.stroke();
		},
		drawLines = function(context){
			for(var i = 0;i<nx;i++){
				drawVerticalLine(context, i * size + xShiftOffset * size);
			}
			for(var i = 0;i<ny;i++){
				drawHorizontalLine(context, i * size + yShiftOffset * size);
			}
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
				currentDrag.changeZoom(e.detail.r);
			}
		},
		endZoom = function(){
			if(currentDrag){
				currentDrag.endZoom();
			}
		};
	setSize(15);

	return {
		w:w,
		h:h,
		setSize:setSize,
		beginDrag:beginDrag,
		startZoom:startZoom,
		changeZoom:changeZoom,
		endZoom:endZoom,
		endDrag:endDrag,
		moveDrag:moveDrag,
		drawLines:drawLines,
		zoom:zoom,
		mousePositionToPositionLocation:mousePositionToPositionLocation,
		positionToMousePosition:positionToMousePosition
	};
})