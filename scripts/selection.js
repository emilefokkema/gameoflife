define(["menu","coordinates","snapshots","rle","input","tree/hashlife"],function(menu,coordinates,snapshots,rle,input, hashLife){
	var present = false, removeMenuOption = null, removeSelectOption = null, minX, minY, maxX, maxY, dragger;
	var makeDraggerMaker = function(mX, mY, howToDrag){
		var draw = function(context){
			context.save();
			context.fillStyle = '#00f';
			context.beginPath();
			context.arc(mX, mY, 0.25, 0, 2*Math.PI);
			context.fill();
			context.restore();
		};
		var make = function(){
			var drag = function(x,y){
				var pos = {x:x,y:y};
				howToDrag(pos);
				coordinates.drawAll();
			};
			return {
				drag:drag
			};
		};
		return {
			draw:draw,
			make:make,
			x:mX,
			y:mY
		};
	};
	var getDraggerMakers = function(){
		var result = [];
		result.push(makeDraggerMaker(
			(minX + maxX + 1)/2,
			minY,
			function(pos){
				minY = Math.min(maxY, pos.y);
			}
		));
		result.push(makeDraggerMaker(
			minX,
			(minY + maxY + 1) / 2,
			function(pos){
				minX = Math.min(maxX, pos.x);
			}
		));
		result.push(makeDraggerMaker(
			(minX + maxX + 1) / 2,
			maxY + 1,
			function(pos){
				maxY = Math.max(minY, pos.y);
			}
		));
		result.push(makeDraggerMaker(
			maxX + 1,
			(minY + maxY + 1) / 2,
			function(pos){
				maxX = Math.max(minX, pos.x);
			}
		));
		result.push(makeDraggerMaker(
			minX,
			minY,
			function(pos){
				minX = Math.min(maxX, pos.x);
				minY = Math.min(maxY, pos.y);
			}
		));
		result.push(makeDraggerMaker(
			minX,
			maxY + 1,
			function(pos){
				minX = Math.min(maxX, pos.x);
				maxY = Math.max(minY, pos.y);
			}
		));
		result.push(makeDraggerMaker(
			maxX + 1,
			minY,
			function(pos){
				maxX = Math.max(minX, pos.x);
				minY = Math.min(maxY, pos.y);
			}
		));
		result.push(makeDraggerMaker(
			maxX + 1,
			maxY + 1,
			function(pos){
				maxX = Math.max(minX, pos.x);
				maxY = Math.max(minY, pos.y);
			}
		));
		return result;
	};
	var makeMover = function(x, y){
		x = Math.floor(x);
		y = Math.floor(y);
		var positions = getPositions();
		var relativePositions = positions.map(function(p){return {x:p.x - minX,y:p.y-minY};});
		var startPos = {x:x,y:y};
		var relativePositionX = startPos.x - minX;
		var relativePositionY = startPos.y - minY;
		var width = maxX - minX;
		var height = maxY - minY;
		var drag = function(xx,yy){
			minX = xx - relativePositionX;
			maxX = minX + width;
			minY = yy - relativePositionY;
			maxY = minY + height;
		};
		var getNewPositions = function(){
			return relativePositions.map(function(p){return {x:minX + p.x,y:minY + p.y};});
		};
		var draw = function(context){
			context.save();
			context.fillStyle = 'rgba(0,0,0,0.5)';
			getNewPositions().map(function(p){
				context.fillRect(p.x,p.y,1,1);
			});
		};
		var end = function(){
			positions.map(function(p){hashLife.remove(p.x, p.y);});
			getNewPositions().map(function(p){hashLife.add(p.x,p.y);});
			coordinates.drawAll();
		};
		return {
			drag:drag,
			end:end,
			draw:draw
		};
	};
	var makeDragger = function(x, y){
		var draggerMakers = getDraggerMakers();
		for(var i=0;i<draggerMakers.length;i++){
			var draggerMaker = draggerMakers[i];
			if(coordinates.areClose(draggerMakers[i].x, draggerMakers[i].y, x, y)){
				return draggerMaker.make();
			}
		}
		if(containsPosition(x, y)){
			return makeMover(x, y);
		}
	};
	var direction = {UP:0,DOWN:1,LEFT:2,RIGHT:3};
	var getPositions = function(){
		return hashLife.getAllInBox({
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
			coordinates.drawAll();
		}));
		remove.push(menu.addOption('cut',function(){
			var positions = getPositions();
			copyPositions(positions);
			positions.map(function(p){hashLife.remove(p.x, p.y);});
			coordinates.drawAll();
		}));
		remove.push(menu.addOption('alive', function(){
			for(var x=minX;x<=maxX;x++){
				for(var y=minY;y<=maxY;y++){
					hashLife.add(x,y);
				}
			}
			coordinates.drawAll();
		}));
		remove.push(menu.addOption('dead', function(){
			getPositions().map(function(p){hashLife.remove(p.x, p.y);});
			coordinates.drawAll();
		}));
		remove.push(menu.addOption('random', function(){
			for(var x=minX;x<=maxX;x++){
				for(var y=minY;y<=maxY;y++){
					if(Math.random()<0.5){
						hashLife.add(x,y);
					}
				}
			}
			coordinates.drawAll();
		}));
		return function(){
			remove.map(function(f){f();});
			remove = [];
		};
	};
	var select = function(x,y){
		x = Math.floor(x);
		y = Math.floor(y);
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
	var clear = function(){
		present = false;
		dragger = null;
		removeMenuOption && removeMenuOption();
		removeMenuOption = null;
		addSelectingOption();
	};
	
	var addSelectingOption = function(){
		removeSelectOption = menu.addOption('select', function(x,y,remove){
			select(x,y);
			select(x + 5, y + 5);
			coordinates.drawAll();
			remove();
		});
	};
	var containsPosition = function(x, y){
		return x >= minX && x <= maxX && y >= minY && y <= maxY;
	};
	addSelectingOption();
	var draw = function(context){
		if(!present){return;}
		context.save();
		context.strokeStyle = '#00f';
		context.lineWidth = 2;
		context.strokeRect(minX, minY, maxX - minX + 1, maxY - minY + 1);
		getDraggerMakers().map(function(d){d.draw(context);});
		if(dragger && dragger.draw){
			dragger.draw(context);
		}
		context.restore();
	};
	
	coordinates.onDragMove(function(toX, toY){
		if(dragger){

			dragger.drag(Math.floor(toX), Math.floor(toY));
		}
	});
	
	coordinates.onDragEnd(function(){
		dragger && dragger.end && dragger.end();
		dragger = null;
	});
	return {
		select:select,
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
		draw:draw,
		isPresent:function(){return present;},
		containsPosition:containsPosition,
		handleDragStart:function(x, y){
			dragger = makeDragger(x, y);
			return !!dragger;
		}
	};
})