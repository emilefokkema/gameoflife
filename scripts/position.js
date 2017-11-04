define(["tree/hashlife","coordinates","selection"],function(hashLife, coordinates, selection){
	
	var integerYPoints = coordinates.getSet(function(viewBox){
		var minY = Math.floor(viewBox.y);
		var maxY = Math.ceil(minY + viewBox.height);
		var result = [];
		for(var y = minY; y <= maxY; y++){
			result.push(y);
		}
		return result;
	});
	var integerXPoints = coordinates.getSet(function(viewBox){
		var minX = Math.floor(viewBox.x);
		var maxX = Math.ceil(minX + viewBox.width);
		var result = [];
		for(var x = minX; x <= maxX; x++){
			result.push(x);
		}
		return result;
	});
	var drawLines = function(context){
		context.save();
		context.strokeStyle = '#ddd';
		context.lineWidth = 1;
		
		var screenPoint;
		context.mapSet(integerXPoints, function(x){
			context.rect(x, -Infinity, Infinity,Infinity);
			context.stroke();
		});
		context.mapSet(integerYPoints,function(y){
			context.rect(-Infinity,y,Infinity,Infinity);
			context.stroke();
		});
		
		context.restore();
	};
	coordinates.onDraw(function(context){
		context.fillStyle = '#fff';
		context.fillRect(-Infinity, -Infinity, Infinity, Infinity);
		context.strokeStyle = '#000';
		context.fillStyle = '#000';
		hashLife.draw(function(p){
			context.fillRect(p.x,p.y,1,1);
		});
		drawLines(context);
		selection.draw(context);
	});
});