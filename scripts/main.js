requirejs([
	"topRightButtons",
	"menu",
	"coordinates",
	"c",
	"selection",
	"position",
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
		c, 
		selection, 
		position, 
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
				position.add(x,y);
			});
		}
	c.addEventListener('positiondragstart',function(e){
		if(!selection.isPresent() || !selection.handleDragStart(e.detail.x, e.detail.y)){
			coordinates.beginDrag(e.detail.x, e.detail.y);
		}
	});
	
	c.addEventListener('click',function(e){
		if(e.shiftKey){
			var loc = coordinates.mousePositionToPositionLocation(e.clientX, e.clientY);
			selection.select(loc.x, loc.y);
			c.drawAll();
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
			var p = coordinates.mousePositionToPositionLocation(e.clientX, e.clientY);
			
			if(position.contains(p.x,p.y)){
				position.remove(p.x,p.y);
			}else{
				position.add(p.x,p.y);
			}
		}
		c.drawAll();
	});
	c.addEventListener('contextmenu',function(e){
		menu.show(e.clientX, e.clientY);
		return false;
	});
	menu.addOption('parse RLE',function(x,y){
		input(function(v){
			if(!v){return;}
			position.vacateAll();
			rle.parse(v, function(xx,yy){position.add(xx+x,yy+y);});
			c.drawAll();
		});
	});
	menu.addOption('parse plaintext',function(x,y){
		input(function(v){
			if(!v){return;}
			position.vacateAll();
			parsePlaintext(v, function(xx,yy){position.add(xx+x,yy+y);});
			c.drawAll();
		});
	});
	menu.addOption('save image',function(){
		c.save();
	});
	
	topRightButtons.attach();
	snapshots.attach();
	input(function(){},"Click on a cell to bring it to life. Hit the space bar to get things moving, or to pause them if they already are. Adjust the slider to make them move faster or slower. Shift-click on a cell to make a selection, and then right-click on the selection to find some options.");
	readHash();
	c.drawAll();
	window.health = function(){
		var all = position.countAll();
		var alive = position.countAlive();
		var treeSize = position.getCurrentTreeSize();
		return {
			all:all,
			alive:alive,
			ratio:all/alive,
			treeSize: treeSize
		};
	};
	
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
				snapshots.add(position.getAllAlive());
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
		c.drawAll();
	});
});