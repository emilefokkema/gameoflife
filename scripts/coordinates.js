define(["c","sender"],function(c, sender){
	var w = c.w,
		h = c.h,
		size, nx, ny,
		xShift = 0,
		yShift = 0,
		onDraw = sender(),
		onChange = sender(),
		sendOnChange = function(){
			onChange({
				xShift:xShift,
				yShift:yShift,
				size:size,
				nx:nx,
				ny:ny
			});
		},
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
		mousePositionToPositionLocation = function(mX,mY){
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
			if(size < 5){
				return;
			}
			context.save();
			context.strokeStyle = '#ddd';
			context.strokeWidth = 0.2;
			for(var i = 0;i<nx;i++){
				drawVerticalLine(context, i * size + xShiftOffset * size);
			}
			for(var i = 0;i<ny;i++){
				drawHorizontalLine(context, i * size + yShiftOffset * size);
			}
			context.restore();
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
		getScreenRect = function(x,y,width,height){
			var p = positionToMousePosition({x:x,y:y});
			return {
				x:p.x,
				y:p.y,
				width:width * size,
				height:height * size
			};
		};
	c.addEventListener('positiondragmove',function(e){
		moveDrag(e.detail.toX, e.detail.toY);
		c.drawAll();
	});
	c.addEventListener('positiondragend',function(){
		endDrag();
		c.drawAll();
	});
	c.addEventListener('positiondragstart',function(e){
		if(onDragStart(e)){
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
		drawLines(context);
		onDraw(context);
	});
	setSize(15);

	return {
		w:w,
		h:h,
		getNx:function(){return nx;},
		getScreenRect:getScreenRect,
		getNy:function(){return ny;},
		onChange:function(f){onChange.add(f);},
		beginDrag:beginDrag,
		zoom:zoom,
		onDraw:function(f){onDraw.add(f);},
		onDragStart:function(f){onDragStart.add(f);},
		mousePositionToPositionLocation:mousePositionToPositionLocation,
		positionToMousePosition:positionToMousePosition
	};
})