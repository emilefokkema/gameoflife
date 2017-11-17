define(["infinitecanvas/transform"],function(transform){
	return function(context, w, h){
		var coordinateTransform = new transform(1,0,0,1,0,0),
			currentTransform = new transform(1,0,0,1,0,0),
			currentTransformStack = [],
			currentTotalTransform,
			currentTotalTransformInverse,
			coordinateTransformInverse,
			currentTransformedViewBox,
			setCache = function(){
				coordinateTransformInverse = coordinateTransform.inverse();
				currentTotalTransform = coordinateTransform.add(currentTransform);
				currentTotalTransformInverse = currentTotalTransform.inverse();
				currentTransformedViewBox = getTransformedViewBox();
			},
			zoom = function(factor, centerX, centerY){
				var p = coordinateTransformInverse.apply(centerX, centerY);
				coordinateTransform = coordinateTransform.translate(p.x,p.y).scale(factor,factor).translate(-p.x,-p.y);
				setCache();
			},
			makeDrag = function(startMouseX, startMouseY){
				var currentMouseX, currentMouseY, origTransform;
				var resetTo = function(x,y){
					origTransform = coordinateTransform;
					currentMouseX = x;
					currentMouseY = y;
					startMouseX = x;
					startMouseY = y;
				};
				resetTo(startMouseX, startMouseY);
				var origR, currentR;
				var applyDrag = function(){
					coordinateTransform = transform.translation(currentMouseX - startMouseX, currentMouseY - startMouseY).add(origTransform);
					setCache();
				};
				var applyZoomAndDrag = function(){
					coordinateTransform = transform.translation(currentMouseX - startMouseX, currentMouseY - startMouseY).add(origTransform);
					setCache();
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
			screenPositionToPoint = function(mX,mY){
				return coordinateTransformInverse.apply(mX,mY);
			},
			positionToMousePosition = function(p){
				return coordinateTransform.apply(p.x,p.y);
			},
			removeTransform = function(){
				currentTransform = new transform(1,0,0,1,0,0);
				setCache();
				currentTransformStack = [];
			},
			saveTransform = function(){
				currentTransformStack.push(currentTransform);
			},
			restoreTransform = function(){
				if(currentTransformStack.length){
					currentTransform = currentTransformStack.pop();
					setCache();
					setTransform();
				}
			},
			setTransform = function(){
				var t = currentTotalTransform;
				context.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
			},
			resetTransform = function(){
				var t = currentTransform;
				context.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
			},
			setCurrentTransform = function(t){
				currentTransform = t;
				setCache();
				setTransform();
			},
			addToCurrentTransform = function(t){
				currentTransform = currentTransform.add(t);
				setCache();
				setTransform();
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
			getTransformedViewBox = function(){
				var transformInverse = currentTotalTransformInverse;
				var leftTop = transformInverse.apply(0,0);
				var leftBottom = transformInverse.apply(0,h);
				var rightBottom = transformInverse.apply(w,h);
				var rightTop = transformInverse.apply(w,0);
				var minX = Math.min(leftTop.x,leftBottom.x,rightBottom.x,rightTop.x);
				var maxX = Math.max(leftTop.x,leftBottom.x,rightBottom.x,rightTop.x);
				var minY = Math.min(leftTop.y,leftBottom.y,rightBottom.y,rightTop.y);
				var maxY = Math.max(leftTop.y,leftBottom.y,rightBottom.y,rightTop.y);
				return {
					x:minX,
					y:minY,
					width:maxX - minX,
					height:maxY - minY
				};
			};
			setCache();
			return {
				zoom:zoom,
				makeDrag:makeDrag,
				screenPositionToPoint:screenPositionToPoint,
				positionToMousePosition:positionToMousePosition,
				removeTransform:removeTransform,
				saveTransform:saveTransform,
				restoreTransform:restoreTransform,
				setTransform:setTransform,
				resetTransform:resetTransform,
				setCurrentTransform:setCurrentTransform,
				addToCurrentTransform:addToCurrentTransform,
				getViewBox:getViewBox,
				getTransformedViewBox:function(){return currentTransformedViewBox;}
			};

	};
})