define(["infinitecanvas/transform"],function(transform){
	return function(context, w, h){
		var coordinateTransform = new transform(1,0,0,1,0,0),
			zoom = function(factor, centerX, centerY){
				var p = coordinateTransform.inverse().apply(centerX, centerY);
				coordinateTransform = coordinateTransform.translate(p.x,p.y).scale(factor,factor).translate(-p.x,-p.y);
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
				};
				var applyZoomAndDrag = function(){
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
			screenPositionToPoint = function(mX,mY){
				return coordinateTransform.inverse().apply(mX,mY);
			},
			positionToMousePosition = function(p){
				return coordinateTransform.apply(p.x,p.y);
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
				var t = coordinateTransform.add(currentTransform);
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
				currentTransform = currentTransform.add(t);
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
			};
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
				getViewBox:getViewBox
			};

	};
})