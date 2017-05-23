define(["menu","coordinates","c","position","snapshots","rle","input"],function(menu,coordinates,c,position,snapshots,rle,input){
	var present = false, removeMenuOption = null, removeSelectOption = null, minX, minY, maxX, maxY, dragger;
	var getMinLoc = function(){
		return coordinates.positionToMousePosition({x:minX,y:minY});
	};
	var getMaxLoc = function(){
		return coordinates.positionToMousePosition({x:maxX + 1,y:maxY + 1});
	};
	var makeDraggerMaker = function(mX, mY, howToDrag){
		var isClose = function(x,y){
			var d = Math.sqrt(Math.pow(mX - x, 2) + Math.pow(mY - y, 2));
			return d < 10;
		};
		var draw = function(context){
			context.save();
			context.fillStyle = '#00f';
			context.beginPath();
			context.arc(mX, mY, 4, 0, 2*Math.PI);
			context.fill();
			context.restore();
		};
		var make = function(){
			var drag = function(x,y){
				var pos = coordinates.mousePositionToPositionLocation(x,y);
				howToDrag(pos);
				c.drawAll();
			};
			return {
				drag:drag
			};
		};
		return {
			isClose:isClose,
			draw:draw,
			make:make
		};
	};
	var getDraggerMakers = function(minLoc, maxLoc){
		var result = [];
		result.push(makeDraggerMaker(
			(minLoc.x + maxLoc.x)/2,
			minLoc.y,
			function(pos){
				minY = Math.min(maxY, pos.y);
			}
		));
		result.push(makeDraggerMaker(
			minLoc.x,
			(minLoc.y + maxLoc.y) / 2,
			function(pos){
				minX = Math.min(maxX, pos.x);
			}
		));
		result.push(makeDraggerMaker(
			(minLoc.x + maxLoc.x)/2,
			maxLoc.y,
			function(pos){
				maxY = Math.max(minY, pos.y);
			}
		));
		result.push(makeDraggerMaker(
			maxLoc.x,
			(minLoc.y + maxLoc.y) / 2,
			function(pos){
				maxX = Math.max(minX, pos.x);
			}
		));
		result.push(makeDraggerMaker(
			minLoc.x,
			minLoc.y,
			function(pos){
				minX = Math.min(maxX, pos.x);
				minY = Math.min(maxY, pos.y);
			}
		));
		result.push(makeDraggerMaker(
			minLoc.x,
			maxLoc.y,
			function(pos){
				minX = Math.min(maxX, pos.x);
				maxY = Math.max(minY, pos.y);
			}
		));
		result.push(makeDraggerMaker(
			maxLoc.x,
			minLoc.y,
			function(pos){
				maxX = Math.max(minX, pos.x);
				minY = Math.min(maxY, pos.y);
			}
		));
		result.push(makeDraggerMaker(
			maxLoc.x,
			maxLoc.y,
			function(pos){
				maxX = Math.max(minX, pos.x);
				maxY = Math.max(minY, pos.y);
			}
		));
		return result;
	};
	var makeMover = function(mouseX, mouseY){
		var positions = getPositions();
		var relativePositions = positions.map(function(p){return {x:p.x - minX,y:p.y-minY};});
		var startPos = coordinates.mousePositionToPositionLocation(mouseX, mouseY);
		var relativePositionX = startPos.x - minX;
		var relativePositionY = startPos.y - minY;
		var width = maxX - minX;
		var height = maxY - minY;
		var drag = function(x,y){
			var toPos = coordinates.mousePositionToPositionLocation(x, y);
			minX = toPos.x - relativePositionX;
			maxX = minX + width;
			minY = toPos.y - relativePositionY;
			maxY = minY + height;
		};
		var getNewPositions = function(){
			return relativePositions.map(function(p){return {x:minX + p.x,y:minY + p.y};});
		};
		var draw = function(context){
			context.save();
			context.fillStyle = 'rgba(0,0,0,0.5)';
			getNewPositions().map(function(p){
				
				coordinates.fillRect(p, context);
			});
		};
		var end = function(){
			positions.map(function(p){position.remove(p.x, p.y);});
			getNewPositions().map(function(p){position.add(p.x,p.y);});
			c.drawAll();
		};
		return {
			drag:drag,
			end:end,
			draw:draw
		};
	};
	var makeDragger = function(mouseX, mouseY){
		var draggerMakers = getDraggerMakers(getMinLoc(), getMaxLoc());
		for(var i=0;i<draggerMakers.length;i++){
			var draggerMaker = draggerMakers[i];
			if(draggerMaker.isClose(mouseX, mouseY)){
				return draggerMaker.make();
			}
		}
		if(containsMousePosition(mouseX, mouseY)){
			return makeMover(mouseX, mouseY);
		}
	};
	var direction = {UP:0,DOWN:1,LEFT:2,RIGHT:3};
	var getPositions = function(){
		return position.getAllInBox({
					minX:minX,
					maxX:maxX,
					minY:minY,
					maxY:maxY
				});
	};
	var copyPositions = function(positions){
		snapshots.copy(positions.map(function(p){return {
				x: p.x - minX,
				y: p.y - minY
			};}), true);
	};
	var addMenuOptions = function(){
		var remove = [];
		remove.push(menu.addOption('make RLE',
			function(){
				input.alert(rle.make(getPositions()));
			}));
		remove.push(menu.addOption('copy',function(x,y){
			var positions = getPositions();
			copyPositions(positions);
			c.drawAll();
		}));
		remove.push(menu.addOption('cut',function(){
			var positions = getPositions();
			copyPositions(positions);
			positions.map(function(p){position.remove(p.x, p.y);});
			c.drawAll();
		}));
		remove.push(menu.addOption('alive', function(){
			for(var x=minX;x<=maxX;x++){
				for(var y=minY;y<=maxY;y++){
					position.add(x,y);
				}
			}
			c.drawAll();
		}));
		remove.push(menu.addOption('dead', function(){
			getPositions().map(function(p){position.remove(p.x, p.y);});
			c.drawAll();
		}));
		remove.push(menu.addOption('random', function(){
			for(var x=minX;x<=maxX;x++){
				for(var y=minY;y<=maxY;y++){
					if(Math.random()<0.5){
						position.add(x,y);
					}
				}
			}
			c.drawAll();
		}));
		return function(){
			remove.map(function(f){f();});
			remove = [];
		};
	};
	var select = function(x,y){
		if(!present){
			minX = maxX = x;
			minY = maxY = y;
			present = true;
			removeSelectOption && removeSelectOption();
		}else{
			if(x > minX){
				maxX = x;
			}else{
				maxX = minX;
				minX = x;
			}
			if(y > minY){
				maxY = y;
			}else{
				maxY = minY;
				minY = y;
			}
		}
		!removeMenuOption && (removeMenuOption = addMenuOptions());
	};
	var draw = function(context){
		if(!present){return;}
		context.save();
		context.strokeStyle = '#00f';
		context.lineWidth = 2;
		var minLoc = getMinLoc();
		var maxLoc = getMaxLoc();
		context.strokeRect(minLoc.x, minLoc.y, maxLoc.x - minLoc.x, maxLoc.y - minLoc.y);
		getDraggerMakers(minLoc, maxLoc).map(function(d){d.draw(context);});
		if(dragger && dragger.draw){
			dragger.draw(context);
		}
		context.restore();
	};
	var clear = function(){
		present = false;
		dragger = null;
		removeMenuOption && removeMenuOption();
		removeMenuOption = null;
		addSelectingOption();
	};
	
	var addSelectingOption = function(){
		removeSelectOption = menu.addOption('select', function(x,y,remove){
			var width = Math.floor(coordinates.getNx() / 5);
			var height = Math.floor(coordinates.getNy() / 5);
			select(x,y);
			select(x + width, y + height);
			c.drawAll();
			remove();
		});
	};
	var containsMousePosition = function(mouseX, mouseY){
		var pos = coordinates.mousePositionToPositionLocation(mouseX, mouseY);
		return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
	};
	addSelectingOption();
	c.onDraw(draw);
	c.addEventListener('positiondragmove',function(e){
		if(dragger){
			dragger.drag(e.detail.toX, e.detail.toY);
		}
	});
	c.addEventListener('positiondragend',function(){
		dragger && dragger.end && dragger.end();
		dragger = null;
	});
	return {
		select:select,
		draw:draw,
		clear:clear,
		moveLeft:function(){
			moveInDirection(direction.LEFT);
		},
		moveRight:function(){
			moveInDirection(direction.RIGHT);
		},
		moveUp:function(){
			moveInDirection(direction.UP);
		},
		moveDown:function(){
			moveInDirection(direction.DOWN);
		},
		isPresent:function(){return present;},
		containsMousePosition:containsMousePosition,
		handleDragStart:function(mouseX, mouseY){
			dragger = makeDragger(mouseX, mouseY);
			return !!dragger;
		}
	};
})