define(["tree/hashlife","coordinates","selection"],function(hashLife, coordinates, selection){
	
	
	var alongIntegerX = coordinates.createMultipleTransformation({
		minIndex: function(viewBox){return Math.floor(viewBox.x);},
		maxIndex : function(viewBox){return Math.ceil(viewBox.x + viewBox.width);},
		transform: function(index, context){context.translate(index, 0);}
	});
	var alongIntegerY = coordinates.createMultipleTransformation({
		minIndex: function(viewBox){return Math.floor(viewBox.y);},
		maxIndex : function(viewBox){return Math.ceil(viewBox.y + viewBox.height);},
		transform: function(index, context){context.translate(0, index);}
	});
	var drawLines = function(context){
		context.save();
		context.strokeStyle = '#ddd';
		context.lineWidth = context.getRelativeSize(1);
		
		var screenPoint;
		alongIntegerX.each(function(){
			context.beginPath();
			context.rect(0, -Infinity, Infinity,Infinity);
			context.stroke();
		});
		alongIntegerY.each(function(){
			context.beginPath();
			context.rect(-Infinity, 0, Infinity, Infinity);
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