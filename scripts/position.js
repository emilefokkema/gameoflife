define(["tree/hashlife","coordinates"],function(hashLife, coordinates){
	var drawHorizontalLine = function(context, y, w){
		context.beginPath();
		context.moveTo(0,y);
		context.lineTo(w,y);
		context.stroke();
	};
	var drawVerticalLine = function(context, x, h){
		context.beginPath();
		context.moveTo(x,0);
		context.lineTo(x,h);
		context.stroke();
	};
	var drawLines = function(context){
		var viewBox = coordinates.getViewBox();
		if(viewBox.width > 100){
			return;
		}
		context.save();
		context.strokeStyle = '#ddd';
		context.strokeWidth = 0.2;
		var minX = Math.floor(viewBox.x);
		var maxX = Math.ceil(minX + viewBox.width);
		var minY = Math.floor(viewBox.y);
		var maxY = Math.ceil(minY + viewBox.height);
		var screenPoint;
		for(var x = minX; x <= maxX; x++){
			screenPoint = coordinates.positionToMousePosition({x:x,y:0});
			drawVerticalLine(context, screenPoint.x, coordinates.h);
		}
		for(var y = minY; y <= maxY; y++){
			screenPoint = coordinates.positionToMousePosition({x:0,y:y});
			drawHorizontalLine(context, screenPoint.y, coordinates.w);
		}
		context.restore();
	};
	coordinates.onDraw(function(context){
		hashLife.draw(function(p){
			var rect = coordinates.getScreenRect(p.x,p.y,1,1);
			context.fillRect(rect.x, rect.y, rect.width, rect.height);
		});
		drawLines(context);
	});
	return {
		mousePositionToPositionLocation:function(x,y){
			var loc = coordinates.screenPositionToPoint(x,y);
			return {
				x:Math.floor(loc.x),
				y:Math.floor(loc.y)
			};
		}
	};
});