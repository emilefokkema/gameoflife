define(["tree/hashlife","coordinates"],function(hashLife, coordinates){

	var fillRect = function(p, context){
		var rect = coordinates.getScreenRect(p.x,p.y,1,1);
		context.fillRect(rect.x, rect.y, rect.width, rect.height);
	};

	coordinates.onDraw(function(context){
		hashLife.draw(function(p){
			fillRect(p, context);
		});
	});
	return {
		fillRect:fillRect,
		mousePositionToPositionLocation:function(x,y){
			var loc = coordinates.mousePositionToPositionLocation(x,y);
			return {
				x:Math.floor(loc.x),
				y:Math.floor(loc.y)
			};
		}
	};
});