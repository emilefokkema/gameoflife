requirejs.config({baseUrl:"./scripts"});
requirejs(["infinitecanvas/infinite-canvas","requireElement"], function(infiniteCanvas, requireElement){
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
		},
		{
			code:function(ctx){
				for (var i = 0; i < 3; i++) {
				    for (var j = 0; j < 3; j++) {
				      ctx.save();
				      ctx.fillStyle = 'rgb(' + (51 * i) + ', ' + (255 - 51 * i) + ', 255)';
				      ctx.translate(10 + j * 50, 10 + i * 50);
				      ctx.fillRect(0, 0, 25, 25);
				      ctx.restore();
				    }
				  }
			}
		},
		{
			code:function(ctx){
				// left rectangles, rotate from canvas origin
				  ctx.save();
				  // blue rect
				  ctx.fillStyle = '#0095DD';
				  ctx.fillRect(30, 30, 100, 100); 
				  ctx.rotate((Math.PI / 180) * 25);
				  // grey rect
				  ctx.fillStyle = '#4D4E53';
				  ctx.fillRect(30, 30, 100, 100);
				  ctx.restore();

				  // right rectangles, rotate from rectangle center
				  // draw blue rect
				  ctx.fillStyle = '#0095DD';
				  ctx.fillRect(150, 30, 100, 100);  
				  
				  ctx.translate(200, 80); // translate to rectangle center 
				                          // x = x + 0.5 * width
				                          // y = y + 0.5 * height
				  ctx.rotate((Math.PI / 180) * 25); // rotate
				  ctx.translate(-200, -80); // translate back
				  
				  // draw grey rect
				  ctx.fillStyle = '#4D4E53';
				  ctx.fillRect(150, 30, 100, 100);
			}
		},
		{
			code:function(ctx){
				var sin = Math.sin(Math.PI / 6);
				  var cos = Math.cos(Math.PI / 6);
				  ctx.translate(100, 100);
				  var c = 0;
				  for (var i = 0; i <= 12; i++) {
				    c = Math.floor(255 / 12 * i);
				    ctx.fillStyle = 'rgb(' + c + ', ' + c + ', ' + c + ')';
				    ctx.fillRect(0, 0, 100, 10);
				    ctx.transform(cos, sin, -sin, cos, 0, 0);
				  }
				  
				  ctx.setTransform(-1, 0, 0, 1, 100, 100);
				  ctx.fillStyle = 'rgba(255, 128, 255, 0.5)';
				  ctx.fillRect(0, 50, 100, 100);
			}
		}
	];
	var getBody = function(f){
		return f.toString().match(/\s*function\s*\([^)]*\)\s*\{([\s\S]*?)\}\s*/)[1];
	};
	
	examples.map(function(e){
		requireElement(document.getElementById("example"), function(canvas1, canvas2, code){
			code.innerHTML = getBody(e.code).replace(/\n/g,"<br/>");
			infiniteCanvas(canvas1).onDraw(e.code);
			var ctx = canvas2.getContext("2d");
			e.code(ctx);
		});
	})
})
