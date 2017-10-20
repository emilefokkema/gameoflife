requirejs.config({baseUrl:"./scripts"});
requirejs(["infinite-canvas","requireElement"], function(infiniteCanvas, requireElement){
	var examples = [
		{
			code:function(ctx){
				ctx.save();
				 ctx.scale(10, 3);
				 ctx.fillRect(1, 10, 10, 10);
				 ctx.restore();

				 // mirror horizontally
				 ctx.scale(-1, 1);
				 ctx.font = '48px serif';
				 ctx.fillText('MDN', -135, 120);
			}
		},
		{
			code:function(ctx){
				ctx.fillRect(0, 0, 150, 150);   // Draw a rectangle with default settings
				  ctx.save();                  // Save the default state
				 
				  ctx.fillStyle = '#09F';      // Make changes to the settings
				  ctx.fillRect(15, 15, 120, 120); // Draw a rectangle with new settings

				  ctx.save();                  // Save the current state
				  ctx.fillStyle = '#FFF';      // Make changes to the settings
				  ctx.globalAlpha = 0.5; 
				  ctx.fillRect(30, 30, 90, 90);   // Draw a rectangle with new settings

				  ctx.restore();               // Restore previous state
				  ctx.fillRect(45, 45, 60, 60);   // Draw a rectangle with restored settings

				  ctx.restore();               // Restore original state
				  ctx.fillRect(60, 60, 30, 30);   // Draw a rectangle with restored settings
			}
		}
	];
	var getBody = function(f){
		return f.toString().match(/\s*function\s*\([^)]*\)\s*\{([\s\S]*?)\}\s*/)[1];
	};
	
	examples.map(function(e){
		requireElement(document.getElementById("example"), function(canvas, code){
			code.innerHTML = getBody(e.code).replace(/\n/g,"<br/>");
			infiniteCanvas(canvas).onDraw(e.code);
		});
	})
})
