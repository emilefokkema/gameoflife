requirejs.config({baseUrl:"./scripts"});
requirejs(["infinite-canvas"], function(infiniteCanvas){
	var canvas = infiniteCanvas(document.getElementById("theCanvas"));
	var integerY = canvas.getSet(function(viewBox){
		var result = [];
		for(var y = Math.floor(viewBox.y);y<viewBox.y + viewBox.height + 1;y++){
			if(y % 5 == 0){
				result.push(y);
			}
			
		}
		return result;
	});
	canvas.onDraw(function(context){
		context.fillStyle = '#f00';
		context.beginPath();
		context.arc(0,0,30,0,2*Math.PI);
		context.fill();
		context.fillStyle = '#0f0';
		context.beginPath();
		context.arc(-10,-10,20,0,2*Math.PI);
		context.fill();
		context.fillStyle = '#00f';
		context.mapSet(integerY, function(y){
			context.beginPath();
			context.arc(30,y,1,0,2*Math.PI);
			context.fill();
		});
	});
});