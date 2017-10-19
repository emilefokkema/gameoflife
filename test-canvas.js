requirejs.config({baseUrl:"./scripts"});
requirejs(["infinite-canvas"], function(infiniteCanvas){
	var canvas = infiniteCanvas(document.getElementById("theCanvas"));
	
	canvas.onDraw(function(ctx){
		ctx.rect(10, 10, 100, 100);
		ctx.stroke();
		console.log(ctx.isPointInPath(10, 10)); // true
	});
})
