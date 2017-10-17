requirejs.config({baseUrl:"./scripts"});
requirejs(["infinite-canvas"], function(infiniteCanvas){
	var canvas = infiniteCanvas(document.getElementById("theCanvas"));
	canvas.onDraw(function(context){
		context.fillStyle = '#f00';
		context.beginPath();
		context.arc(0,0,30,0,2*Math.PI);
		context.fill();
		context.fillStyle = '#0f0';
		context.beginPath();
		context.arc(-10,-10,20,0,2*Math.PI);
		context.fill();
	});
});