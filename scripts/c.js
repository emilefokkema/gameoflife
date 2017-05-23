define(["sender"],function(sender){
	var dragger = null;
	var onDraw = sender();
	var onClick = function(){};
	var zoomer = null;
	var dragHappened = false;
	var w = document.body.offsetWidth,
		h = document.body.offsetHeight;
	var canvas = document.createElement("canvas");
	canvas.setAttribute("width", w);
	canvas.setAttribute("height", h);
	document.body.appendChild(canvas);
	var context = canvas.getContext("2d");
	var initializeContext = function(){
		context.strokeStyle = '#000';
		context.fillStyle = '#000';
	};
	var draggerFactory = (function(){
		var dispatchDragStart = function(x,y){
			var event = new CustomEvent('positiondragstart',{'detail':{x:x,y:y}});
			canvas.dispatchEvent(event);
		};
		var dispatchDragMove = function(toX, toY){
			var event = new CustomEvent('positiondragmove',{
				'detail':{
					toX:toX,
					toY:toY
				}
			});
			canvas.dispatchEvent(event);
		};
		var dispatchDragEnd = function(){
			var event = new CustomEvent('positiondragend');
			canvas.dispatchEvent(event);
		};
		var dispatchStartZoom = function(r){
			var event = new CustomEvent('startzoom', {'detail':{r:r}});
			canvas.dispatchEvent(event);
		};
		var dispatchEndZoom = function(){
			var event = new CustomEvent('endzoom');
			canvas.dispatchEvent(event);
		};
		var dispatchChangeZoom = function(r){
			var event = new CustomEvent('changezoom', {'detail':{r:r}});
			canvas.dispatchEvent(event);
		};
		var make = function(startX, startY, startId){
			dispatchDragStart(startX, startY);
			var firstTouch = {x:startX,y:startY,id:startId};
			var secondTouch;
			var getDistance = function(){
				return Math.sqrt(Math.pow(firstTouch.x - secondTouch.x,2) + Math.pow(firstTouch.y - secondTouch.y,2));
			};
			var moveTo = function(x, y, id){
				if(id == undefined || id == firstTouch.id){
					dispatchDragMove(x, y);
					if(id != undefined && id == firstTouch.id){
						firstTouch.x = x;
						firstTouch.y = y;
					}
				}else if(secondTouch && id == secondTouch.id){
					secondTouch.x = x;
					secondTouch.y = y;
					dispatchChangeZoom(getDistance());
				}
			};
			var end = function(id){
				if(id == undefined || id == firstTouch.id){
					dispatchDragEnd();
				}else if(secondTouch && id == secondTouch.id){
					dispatchEndZoom();
					secondTouch = null;
				}
			};
			var add = function(x, y, id){
				if(id != firstTouch.id && !secondTouch){
					secondTouch = {x:x,y:y,id:id};
					dispatchStartZoom(getDistance());
				}
			};
			return {
				moveTo:moveTo,
				end:end,
				add:add
			};
		};
		return {
			make:make
		};
	})();
	
	initializeContext();
	var mapTouchList = function(touchList, mapper){
		for(var i=0;i<touchList.length;i++){
			mapper(touchList.item(i));
		}
	};
	var save = function(){
		var url = canvas.toDataURL("image/png");
		var a = document.createElement('a');
		var event = new MouseEvent('click',{});
		a.setAttribute('href',url);
		a.setAttribute('download','gameoflife.png');
		document.body.appendChild(a);
		a.dispatchEvent(event);
		document.body.removeChild(a);
	};
	var whiteBackground = function(){
		context.save();
		context.fillStyle = '#fff';
		context.fillRect(0,0,w,h);
		context.restore();
	};
	var clear = function(){
		canvas.width = w;
		initializeContext();
		whiteBackground();
	};
	var drawAll = function(){
		clear();
		onDraw(context);
	};
	canvas.addEventListener('click',function(e){
		if(dragHappened){
			dragHappened = false;
			e.stopPropagation();
			return false;
		}else{
			onClick(e);
		}
		
	});
	canvas.addEventListener('touchstart',function(e){
		mapTouchList(e.changedTouches, function(touch){
			if(!dragger){
				dragger = draggerFactory.make(touch.clientX, touch.clientY, touch.identifier);
			}else{
				dragger.add(touch.clientX, touch.clientY, touch.identifier);
			}
		});
	});
	canvas.addEventListener('touchend',function(e){
		if(!dragger){return;}
		mapTouchList(e.changedTouches, function(touch){
			dragger.end(touch.identifier);
		});
		if(e.touches.length == 0){
			dragger = null;
		}
	});
	canvas.addEventListener('touchmove',function(e){
		mapTouchList(e.changedTouches,function(touch){
			dragger.moveTo(touch.clientX, touch.clientY, touch.identifier);
		});
		dragHappened = true;
	});
	canvas.addEventListener('mousedown',function(e){
		e.preventDefault();
		dragger = draggerFactory.make(e.clientX, e.clientY);
	});
	canvas.addEventListener('mousemove',function(e){
		if(dragger && (e.movementX != 0 || e.movementY != 0) ){
			dragger.moveTo(e.clientX, e.clientY);
			dragHappened = true;
		}
		return true;
	});
	canvas.addEventListener('mouseup',function(){
		if(dragger){
			dragger.end();
			dragger = null;
		}
	});
	canvas.addEventListener('contextmenu',function(e){
		if(dragger){
			dragger.end();
			dragger = null;
		}
		e.preventDefault();
	});
	return {
		w:w,
		h:h,
		context:context,
		clear:clear,
		onDraw:function(f){
			onDraw.add(f);
		},
		drawAll:drawAll,
		addEventListener:function(name, handler){
			if(name == 'click'){
				onClick = handler;
			}else{
				canvas.addEventListener(name, handler);
			}
		},
		save:save
	};
});