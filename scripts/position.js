define(["tree/hashlife","c","coordinates"],function(hashLife, c, coordinates){
	var position = hashLife;
	c.onDraw(function(context){
		position.draw(function(p){
			coordinates.fillRect(p, context);
		});
	});
	return position;
});