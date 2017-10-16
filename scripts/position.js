define(["tree/hashlife","coordinates","selection"],function(hashLife, coordinates, selection){
	
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
		context.mapPointSet(integerXPoints, function(p){
			context.makeVerticalLine(p.x);
			context.stroke();
		});
		context.mapPointSet(integerYPoints,function(p){
			context.makeHorizontalLine(p.y);
			context.stroke();
		});
		
		context.restore();
	};
	coordinates.onDraw(function(context){
		hashLife.draw(function(p){
			context.fillRect(p.x,p.y,1,1);
		});
		drawLines(context);
		selection.draw(context);
	});
});