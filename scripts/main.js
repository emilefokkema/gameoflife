requirejs([
	"topRightButtons",
	"menu",
	"coordinates",
	"selection",
	"position",
	"tree/hashlife",
	"snapshots",
	"body",
	"input",
	"settings",
	"rle",
	"counter",
	"speedRange",
	"animation",
	"controls",
	"lifescript",
	"script-editor",
	"run-script"], function(
		topRightButtons, 
		menu, 
		coordinates, 
		selection, 
		position,
		hashLife, 
		snapshots, 
		body, 
		input, 
		settings, 
		rle, 
		counter, 
		speedRange, 
		animation, 
		controls, 
		lifescript, 
		scriptEditor,
		runScript){
	
	var parsePlaintext = function(text, occupy){
			var lines = text.match(/[\.O]+/g);
			for(var y = 0;y<lines.length;y++){
				for(var x=0;x<lines[y].length;x++){
					if(lines[y][x] == "O"){
						occupy(x,y);
					}
				}
			}
		},
		readHash = function(){
			var hash = window.location.hash;
			if(!hash){
				return;
			}
			rle.parse(hash.substr(1), function(x,y){
				hashLife.add(x,y);
			});
		}
	
	coordinates.onDragStart(function(x, y){
		if(!selection.isPresent() || !selection.handleDragStart(x, y)){
			return true;
		}
		return false;
	});
	coordinates.onClick(function(pos){
		if(pos.shiftKey){
			selection.select(pos.x, pos.y);
			coordinates.drawAll();
			return;
		}
		if(menu.isOpen()){
			menu.hide();
			return;
		}
		if(snapshots.isShowing()){
			snapshots.hide();
			return;
		}
		if(selection.isPresent()){
			selection.clear();
		}else{
			if(hashLife.contains(pos.x, pos.y)){
				hashLife.remove(pos.x, pos.y);
			}else{
				hashLife.add(pos.x, pos.y);
			}
		}
		coordinates.drawAll();
	});
	coordinates.onContextMenu(function(screenX, screenY, posX, posY){
		menu.show(screenX, screenY, {x:posX,y:posY});
		return false;
	});
	
	menu.addOption('parse RLE',function(x,y){
		input(function(v){
			if(!v){return;}
			hashLife.vacateAll();
			rle.parse(v, function(xx,yy){hashLife.add(xx+x,yy+y);});
			coordinates.drawAll();
		});
	});
	menu.addOption('parse plaintext',function(x,y){
		input(function(v){
			if(!v){return;}
			hashLife.vacateAll();
			parsePlaintext(v, function(xx,yy){hashLife.add(xx+x,yy+y);});
			coordinates.drawAll();
		});
	});
	menu.addOption('save image',function(){
		coordinates.save();
	});
	
	input(function(){},"Click on a cell to bring it to life. Hit the space bar to get things moving, or to pause them if they already are. Adjust the slider to make them move faster or slower. Shift-click on a cell to make a selection, and then right-click on the selection to find some options.");
	readHash();
	coordinates.drawAll();
	
	
	var reactToKeys = function(){
		return !snapshots.isShowing() && !input.isOpen() && !scriptEditor.isOpen() && !runScript.isOpen();
	};
	var shortcuts = [
		{
			key:"s",
			action:function(){
				animation.doStep();
			}
		},{
			key: "r",
			action:function(){
				snapshots.add(hashLife.getAllAlive());
			}
		},{
			key:"c",
			action:function(){
				animation.reset();
			}
		},{
			key:" ",
			action:function(){
				if(animation.isGoing()){
					animation.stop();
				}else{
					animation.go();
				}
			}
		}
	];
	window.addEventListener('keydown',function(e){
		if(!reactToKeys()){
			return;
		}
		shortcuts.map(function(s){
			if(e.key == s.key){
				s.action();
			}
		});
	});
	window.addEventListener('wheel',function(e){
		if(!reactToKeys()){
			return;
		}
		coordinates.zoom(Math.pow(2, -e.deltaY / 200), e.clientX, e.clientY);
		coordinates.drawAll();
	});
});