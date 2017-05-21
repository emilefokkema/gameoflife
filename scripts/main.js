requirejs(["topRightButtons","menu","coordinates","c","selection","position","snapshots","body"], function(topRightButtons, menu, coordinates, c, selection, position, snapshots, body){
	var interpolation = function(y0, x1, c){
		var a = y0 / (1 - Math.exp(-c*x1)), b = y0 - a;
		return function(x){
			return a * Math.exp(-c*x) + b;
		};
	};
	
	
	var input = requireElement(document.getElementById("input").innerHTML, function(div, text, button){
			var open = false;

			var show = function(initialText){
				open = true;
				div.style.display = 'initial';
				if(initialText){
					text.value = initialText;
				}
			};
			var hide = function(){
				open = false;
				div.style.display = 'none';
			};
			var handler = function(v){};
			document.body.appendChild(div);
			button.addEventListener('click',function(){
				handler(text.value);
				text.value = '';
			});
			hide();
			var f = function(resultHandler, initialText){
				show(initialText);
				handler = function(v){
					hide();
					resultHandler(v);
				};
			};
			f.isOpen = function(){return open;};
			return f;
		}),
		alert = function(text){
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
		settings = requireElement(document.getElementById("settings").innerHTML, function(div, number, closeButton){
			var open = false;

			number.value = 0;
			number.addEventListener('blur',function(){
				number.value = Math.floor(number.value);
				number.value = Math.max(0,number.value);
			});
			
			
			closeButton.addEventListener('click',function(){
				position.setTimePerStepLog(number.value);
				hide();
			});
			
			var show = function(initialText){
				open = true;
				body.addClass('settings-open');
			};
			var hide = function(){
				open = false;
				body.removeClass('settings-open');
			};
			document.body.appendChild(div);
			hide();
			topRightButtons.add("settings-button fa fa-gear",function(button){
					button.addEventListener('click',function(){
						show();
					});
			});
		}),
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
		parseRLEBody = function(body, occupy){
			var parts = body.replace(/\s*/g,"").match(/\d*[bo\$]/g);
			var x = 0, y = 0;
			parts.map(function(p){
				var match = p.match(/^(\d*)([bo\$])$/);
				var number = match[1] ? parseInt(match[1]) : 1;
				for(var i=0;i<number;i++){
					if(match[2] == "$"){
						x = 0;
						y++;
					}else{
						if(match[2] == "o"){
							occupy(x,y);
						}
						x++;
					} 
				}
			});
		},
		makeRLE = function(positions){
			var lines = [];
			var getLineForY = function(y){
				var result = null;
				for(var i=0;i<lines.length;i++){
					if(lines[i].y == y){
						result = lines[i];
					}
				}
				return result;
			};
			var findLineForPosition = function(p){
				var result = getLineForY(p.y);
				if(!result){
					result = {y:p.y,positions:[]};
					lines.push(result);
				}
				return result;
			};
			positions.map(function(p){
				findLineForPosition(p).positions.push(p.x);
			});
			lines.sort(function(l1,l2){return l1.y - l2.y;});
			var ys = lines.map(function(l){return l.y;});
			var minY = Math.min.apply(null, ys);
			var maxY = Math.max.apply(null, ys);
			var lineMinX = function(l){return Math.min.apply(null, l.positions);};
			var lineMaxX = function(l){return Math.max.apply(null, l.positions);};
			var minX = Math.min.apply(null, lines.map(lineMinX));
			var maxX = Math.max.apply(null, lines.map(lineMaxX));
			var result = (function(){
				var kind = {ALIVE:0,DEAD:1,NEWLINE:2};
				var symbol = [];
				symbol[kind.ALIVE] = "o";
				symbol[kind.DEAD] = "b";
				symbol[kind.NEWLINE] = "$";
				var currentKind = -1;
				var all = [];
				var latest = null;
				var pushKind = function(k){
					if(k != currentKind){
						latest = {kind:k,count:0};
						all.push(latest);
					}
					currentKind = k;
					latest.count++;
				};
				var toString = function(){
					return all.map(function(k){return ""+(k.count > 1 ? k.count : "")+symbol[k.kind];}).join("");
				};
				return {
					alive:function(){pushKind(kind.ALIVE);},
					dead:function(){pushKind(kind.DEAD);},
					newLine:function(){pushKind(kind.NEWLINE);},
					toString:toString
				};
			})();

			for(var y=minY;y<=maxY;y++){
				var line = getLineForY(y);
				if(line){
					for(var x=minX;x<=maxX;x++){
						if(line.positions.indexOf(x) > -1){
							result.alive();
						}else{
							result.dead();
						}
					}
				}
				result.newLine();
			}
			return result.toString();
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
	c.addEventListener('positiondragmove',function(e){
		coordinates.moveDrag(e.detail.toX, e.detail.toY);
		c.drawAll();
	});
	c.addEventListener('positiondragend',function(){
		coordinates.endDrag();
		c.drawAll();
	});
	c.addEventListener('startzoom',function(e){
		coordinates.startZoom(e.detail.r);
	});
	c.addEventListener('changezoom',function(e){
		coordinates.changeZoom(e.detail.r);
		c.drawAll();
	});
	c.addEventListener('endzoom',function(e){
		coordinates.endZoom();
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
			parseRLEBody(v, function(xx,yy){position.add(xx+x,yy+y);});
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