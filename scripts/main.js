requirejs(["topRightButtons","menu","coordinates","c","selection","position","snapshots","body","input","settings","rle"], function(topRightButtons, menu, coordinates, c, selection, position, snapshots, body, input, settings, rle){
	var interpolation = function(y0, x1, c){
		var a = y0 / (1 - Math.exp(-c*x1)), b = y0 - a;
		return function(x){
			return a * Math.exp(-c*x) + b;
		};
	};
	
	
	var alert = function(text){
			input(function(){
				clear();
				c.drawAll();
			},text);
		},
		controls = requireElement(document.getElementById("controls").innerHTML, function(container, buttonDiv){
			document.body.appendChild(container);
			var addButton = function(className, action){
				buttonDiv(function(div){
					div.addEventListener('click',function(){
						action(function(newClassName){
							if(newClassName){
								div.setAttribute('class','button fa '+newClassName);
							}
						});
					});
				},{className:className});
			};
			addButton("fa-play",function(setNewClassName){
				if(going){
					stop();
					setNewClassName("fa-play");
				}else{
					go();
					setNewClassName("fa-pause");
				}
			});
			addButton("fa-eraser",function(){
				reset();
			});
			addButton("fa-step-forward",function(){
				doStep();
				c.drawAll();
				setCounter();
			});
			addButton("fa-clipboard",function(){
				snapshots.add(position.getAllAlive());
			});
		}),
		speedRange = requireElement("<input id=\"1\" type=\"range\" class=\"speed-range\"/>", function(range){
			var getLength = interpolation(1000,100,0.05);
			document.body.appendChild(range);
			range.addEventListener('input',function(){
				var newLength = getLength(range.value);
				intervalLength = Math.max(1, newLength); 
			});
		}),
		setCounter = requireElement("<a id=\"1\" class=\"step-count\"></a>", function(a){
		    document.body.appendChild(a);
		    return function(){
		            a.innerHTML = stepCount;
		    };
		}),
		context = c.context,
		clear = c.clear,
		stepCount = 0,
		timeCount = 0,
		doStep = function(done){
			position.doStep();
			stepCount += 1 << position.getTimePerStepLog();
			done && done();
		},
		going = false,
		setCounterInterval,
		stop = function(){
			going = false;
			body.removeClass('going');
			var timeDiff = +new Date() - timeCount;
			console.log("time diff:", timeDiff);
			window.clearInterval(setCounterInterval);
			setCounter();
		},
		intervalLength = 75,
		go = function(){
			going = true;
			body.addClass('going');
			timeCount = +new Date();
			var afterStep = function(){
				c.drawAll();
				window.setTimeout(function(){
					if(going){
						doStep(afterStep);
					}
				},intervalLength);
			};
			afterStep();
			setCounterInterval = window.setInterval(setCounter, 250);
		},
		reset = function(){
			position.vacateAll();
			stepCount = 0;
			setCounter();
			c.drawAll();
		},
		parsePlaintext = function(text, occupy){
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
			parseRLEBody(hash.substr(1), function(x,y){
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
	setCounter();
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
	window.alive = function(x,y){
		position.add(x,y);
	};

	var shortcuts = [
		{
			key:"s",
			action:function(){
				doStep();
				c.drawAll();
				setCounter();
			}
		},{
			key: "r",
			action:function(){
				snapshots.add(position.getAllAlive());
			}
		},{
			key:"c",
			action:reset
		},{
			key:" ",
			action:function(){
				if(going){
					stop();
				}else{
					go();
				}
			}
		}
	];
	window.addEventListener('keydown',function(e){
		shortcuts.map(function(s){
			if(e.key == s.key){
				s.action();
			}
		});
	});
	window.addEventListener('wheel',function(e){
		if(snapshots.isShowing()){
			return;
		}
		coordinates.zoom(Math.pow(2, -e.deltaY / 200), e.clientX, e.clientY);
		c.drawAll();
	});
});