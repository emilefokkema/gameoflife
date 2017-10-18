requirejs.config({baseUrl:"./scripts"});
requirejs(["infinite-canvas"], function(infiniteCanvas){
	var canvas = infiniteCanvas(document.getElementById("theCanvas"));
	var manyY = canvas.getSet(function(viewBox){
		var result = [];
		var maxR = viewBox.y + viewBox.height;
		if(maxR <= 0){return result;}
		var minR = Math.max(viewBox.y, 0);
		var maxLog = Math.ceil(Math.log(maxR));
		var minLog = Math.floor(minR == 0 ? -20 : Math.log(minR));
		for(var l = minLog; l <= maxLog; l++){
			result.push(Math.exp(l));
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
		context.mapSet(manyY, function(y){
			context.beginPath();
			context.arc(30,y,Math.abs(y*0.1),0,2*Math.PI);
			context.fill();
		});
	});
});