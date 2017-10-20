requirejs.config({baseUrl:"./scripts"});
requirejs(["infinite-canvas"], function(infiniteCanvas){
	var canvas = infiniteCanvas(document.getElementById("theCanvas"));
	
	canvas.onDraw(function(ctx){
		ctx.save();
		 ctx.scale(10, 3);
		 ctx.fillRect(1, 10, 10, 10);
		 ctx.restore();

		 // mirror horizontally
		 ctx.scale(-1, 1);
		 ctx.font = '48px serif';
		 ctx.fillText('MDN', -135, 120);
	});
})
