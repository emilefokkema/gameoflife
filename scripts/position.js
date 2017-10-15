define(["tree/hashlife","coordinates","selection"],function(hashLife, coordinates, selection){
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
	var integerYPoints = coordinates.getPointSet(function(viewBox){
		var minY = Math.floor(viewBox.y);
		var maxY = Math.ceil(minY + viewBox.height);
		var result = [];
		for(var y = minY; y <= maxY; y++){
			result.push({x:0,y:y});
		}
		return result;
	});
	var integerXPoints = coordinates.getPointSet(function(viewBox){
		var minX = Math.floor(viewBox.x);
		var maxX = Math.ceil(minX + viewBox.width);
		var result = [];
		for(var x = minX; x <= maxX; x++){
			result.push({x:x,y:0});
		}
		return result;
	});
	var drawLines = function(context){
		context.save();
		context.strokeStyle = '#ddd';
		context.strokeWidth = 0.2;
		
		var screenPoint;
		integerXPoints.map(function(p){
			screenPoint = coordinates.positionToMousePosition(p);
			drawVerticalLine(context, screenPoint.x, coordinates.h);
		});
		integerYPoints.map(function(p){
			screenPoint = coordinates.positionToMousePosition(p);
			drawHorizontalLine(context, screenPoint.y, coordinates.w);
		});
		context.restore();
	};
	coordinates.onDraw(function(context, contextWrapper){
		hashLife.draw(function(p){
			contextWrapper.fillRect(p.x,p.y,1,1);
		});
		drawLines(context);
		selection.draw(contextWrapper);
	});
});