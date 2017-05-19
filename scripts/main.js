requirejs(["topRightButtons","menu","coordinates","c"], function(topRightButtons, menu, coordinates, c){
	var interpolation = function(y0, x1, c){
		var a = y0 / (1 - Math.exp(-c*x1)), b = y0 - a;
		return function(x){
			return a * Math.exp(-c*x) + b;
		};
	};
	var addClass = function(el, className){
		var oldName = el.getAttribute('class') || "";
		var oldClassNames = oldName.match(/[^\s]+/g);
		oldClassNames = oldClassNames || [];
		el.setAttribute('class', oldClassNames.concat([className]).join(" "));
	};
	var removeClass = function(el, className){
		var oldName = el.getAttribute('class') || "";
		var oldClassNames = oldName.match(/[^\s]+/g);
		oldClassNames = oldClassNames || [];
		el.setAttribute('class', oldClassNames.filter(function(n){return n != className;}).join(" "));
	};
	
	var selection = (function(){
			var present = false, removeMenuOption = null, removeSelectOption = null, minX, minY, maxX, maxY, dragger;
			var getMinLoc = function(){
				return positionToMousePosition({x:minX,y:minY});
			};
			var getMaxLoc = function(){
				return positionToMousePosition({x:maxX + 1,y:maxY + 1});
			};
			var makeDraggerMaker = function(mX, mY, howToDrag){
				var isClose = function(x,y){
					var d = Math.sqrt(Math.pow(mX - x, 2) + Math.pow(mY - y, 2));
					return d < 10;
				};
				var draw = function(){
					context.save();
					context.fillStyle = '#00f';
					context.beginPath();
					context.arc(mX, mY, 4, 0, 2*Math.PI);
					context.fill();
					context.restore();
				};
				var make = function(){
					var drag = function(x,y){
						var pos = mousePositionToPositionLocation(x,y);
						howToDrag(pos);
						drawAll();
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
				var startPos = mousePositionToPositionLocation(mouseX, mouseY);
				var relativePositionX = startPos.x - minX;
				var relativePositionY = startPos.y - minY;
				var width = maxX - minX;
				var height = maxY - minY;
				var drag = function(x,y){
					var toPos = mousePositionToPositionLocation(x, y);
					minX = toPos.x - relativePositionX;
					maxX = minX + width;
					minY = toPos.y - relativePositionY;
					maxY = minY + height;
					drawAll();
					draw();
				};
				var getNewPositions = function(){
					return relativePositions.map(function(p){return {x:minX + p.x,y:minY + p.y};});
				};
				var draw = function(){
					context.save();
					context.fillStyle = 'rgba(0,0,0,0.5)';
					getNewPositions().map(function(p){
						var pos = positionToMousePosition(p);
						context.fillRect(pos.x, pos.y,size,size);
					});
				};
				var end = function(){
					positions.map(function(p){position.remove(p.x, p.y);});
					getNewPositions().map(function(p){position.add(p.x,p.y);});
					drawAll();
				};
				return {
					drag:drag,
					end:end
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
				clipboard.copy(positions.map(function(p){return {
						x: p.x - minX,
						y: p.y - minY
					};}), true);
			};
			var addMenuOptions = function(){
				var remove = [];
				remove.push(menu.addOption('make RLE',
					function(){
						alert(makeRLE(getPositions()));
					}));
				remove.push(menu.addOption('copy',function(x,y){
					var positions = getPositions();
					copyPositions(positions);
					clear();
					drawAll();
				}));
				remove.push(menu.addOption('cut',function(){
					var positions = getPositions();
					copyPositions(positions);
					positions.map(function(p){position.remove(p.x, p.y);});
					clear();
					drawAll();
				}));
				remove.push(menu.addOption('alive', function(){
					for(var x=minX;x<=maxX;x++){
						for(var y=minY;y<=maxY;y++){
							position.add(x,y);
						}
					}
					clear();
					drawAll();
				}));
				remove.push(menu.addOption('dead', function(){
					getPositions().map(function(p){position.remove(p.x, p.y);});
					clear();
					drawAll();
				}));
				remove.push(menu.addOption('random', function(){
					for(var x=minX;x<=maxX;x++){
						for(var y=minY;y<=maxY;y++){
							if(Math.random()<0.5){
								position.add(x,y);
							}
						}
					}
					clear();
					drawAll();
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
			var draw = function(){
				if(!present){return;}
				context.save();
				context.strokeStyle = '#00f';
				context.lineWidth = 2;
				var minLoc = getMinLoc();
				var maxLoc = getMaxLoc();
				context.strokeRect(minLoc.x, minLoc.y, maxLoc.x - minLoc.x, maxLoc.y - minLoc.y);
				getDraggerMakers(minLoc, maxLoc).map(function(d){d.draw();});
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
					var width = Math.floor(w / (5 * size));
					var height = Math.floor(h / (5 * size));
					select(x,y);
					select(x + width, y + height);
					drawAll();
					remove();
				});
			};
			var containsMousePosition = function(mouseX, mouseY){
				var pos = mousePositionToPositionLocation(mouseX, mouseY);
				return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
			};
			addSelectingOption();
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
		})(),
		input = requireElement(document.getElementById("input").innerHTML, function(div, text, button){
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
				drawAll();
			},text);
		},
		clipboard = (function(){
			var relativePositions, removeMenuOption;
			var paste = function(x, y){
				relativePositions.map(function(p){
					position.add(x + p.x,y + p.y);
				});
				drawAll();
			};
			var copy = function(_relativePositions, makeSnapshot){
				relativePositions = _relativePositions;
				!removeMenuOption && (removeMenuOption = menu.addOption('paste', paste));
				if(makeSnapshot){
					snapshots.add(_relativePositions);
				}
			};
			
			return {copy:copy};
		})(),
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
				drawAll();
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
		fillRect = function(screenX, screenY){
			context.fillRect(screenX, screenY, size, size);
		},
		
		position = hashLifeMaker(),
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
				addClass(document.body,'settings-open');
			};
			var hide = function(){
				open = false;
				removeClass(document.body, 'settings-open');
			};
			document.body.appendChild(div);
			hide();
			topRightButtons.add("settings-button fa fa-gear",function(button){
					button.addEventListener('click',function(){
						show();
					});
			});
		}),
		snapshots = requireElement(document.getElementById("snapshots").innerHTML, function(container, closeButton, snapshotElement){
			var showing = false, count = 0;
			var snapshotWidth = 120, snapshotHeight = 120;
			var makeSnapshot = function(positions, forget){
				var setPositions = function(){
					minX = Math.min.apply(null, positions.map(function(p){return p.x;}));
					maxX = Math.max.apply(null, positions.map(function(p){return p.x;}));
					minY = Math.min.apply(null, positions.map(function(p){return p.y;}));
					maxY = Math.max.apply(null, positions.map(function(p){return p.y;}));
					positions = positions.map(function(p){
						return {x:p.x-minX,y:p.y-minY};
					});
				};
				var minX, maxX, minY, maxY, origMinX, origMinY;
				setPositions();
				origMinX = minX;
				origMinY = minY;
				var draw = function(canvas){
					var ctx = canvas.getContext("2d");
					ctx.fillStyle = '#fff';
					ctx.fillRect(0,0,snapshotWidth,snapshotHeight);
					ctx.fillStyle = '#000';
					var cellSize = Math.min(snapshotWidth / (maxX - minX + 1), snapshotHeight / (maxY - minY + 1));
					positions.map(function(p){
						ctx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
					});
				};
				var flipHorizontal = function(){
					positions = positions.map(function(p){
						return {x:-p.x,y:p.y};
					});
					setPositions();
				};
				var turnClockwise = function(){
					positions = positions.map(function(p){
						return {x:-p.y,y:p.x};
					});
					setPositions();
				};
				var flipVertical = function(){
					positions = positions.map(function(p){
						return {x:p.x,y:-p.y};
					});
					setPositions();
				};
				var restore = function(){
					position.vacateAll();
					stepCount = 0;
					setCounter();
					positions.map(function(p){
						position.add(origMinX + p.x,origMinY + p.y);
					});
					drawAll();
				};
				var copyToClipboard = function(){
					clipboard.copy(positions);
				};
				return {
					draw:draw,
					restore:restore,
					turnClockwise:turnClockwise,
					forget:forget,
					flipHorizontal:flipHorizontal,
					flipVertical:flipVertical,
					copyToClipboard:copyToClipboard
				};
			};
			var show = function(){
				addClass(document.body,'show-snapshots');
				showing = true;
			};
			var hide = function(){
				removeClass(document.body,'show-snapshots');
				showing = false;
			};
			closeButton.addEventListener('click',hide);
			var attach = function(){
				document.body.appendChild(container);
			};
			
			var add = function(positions){
				positions = positions.map(function(p){return {x:p.x,y:p.y};});
				snapshotElement(function(s, s1, optionElement){
						var getSnapshotOption = function(name, toDo){
							optionElement(function(option){
									option.addEventListener('click',toDo);
							},{name:name});
						};
						var canvas = document.createElement('canvas');
						canvas.setAttribute('width',snapshotWidth);
						canvas.setAttribute('height',snapshotHeight);
						s1.appendChild(canvas);
						var newSnapshot = makeSnapshot(positions, function(){
							container.removeChild(s);
							count--;
							if(count == 0){
								removeClass(document.body,'show-snapshots');
								removeClass(document.body,'has-snapshots');
							}
						});
						newSnapshot.draw(canvas);
						getSnapshotOption('fa-folder-open',function(){
											newSnapshot.restore();
										});
						getSnapshotOption('fa-copy',function(){
											newSnapshot.copyToClipboard();
										});
						getSnapshotOption('fa-trash',function(){
											newSnapshot.forget();
										});
						getSnapshotOption('fa-file-code-o',function(){
											alert(makeRLE(positions));
										});
						getSnapshotOption('fa-arrows-h',function(){
											newSnapshot.flipHorizontal();
											canvas.width = snapshotWidth;
											newSnapshot.draw(canvas);
										});
						getSnapshotOption('fa-arrows-v',function(){
											newSnapshot.flipVertical();
											canvas.width = snapshotWidth;
											newSnapshot.draw(canvas);
										});
						getSnapshotOption('fa-refresh',function(){
											newSnapshot.turnClockwise();
											canvas.width = snapshotWidth;
											newSnapshot.draw(canvas);
										});
				});

				addClass(document.body, 'has-snapshots');
				count++;
			};
			topRightButtons.add("snapshot-button fa fa-clipboard",function(button){
					button.addEventListener('click',function(){
						if(showing){
							hide();
						}else{
							show();
						}
					});
			});
			
			return {
				add:add,
				isShowing:function(){return showing;},
				hide:hide,
				attach:attach
			};
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
			removeClass(document.body,'going');
			var timeDiff = +new Date() - timeCount;
			console.log("time diff:", timeDiff);
			window.clearInterval(setCounterInterval);
			setCounter();
		},
		intervalLength = 75,
		go = function(){
			going = true;
			addClass(document.body,'going');
			timeCount = +new Date();
			var afterStep = function(){
				drawAll();
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
			drawAll();
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
		},
		drawAll = function(){
			clear();
			context.save();
			context.strokeStyle = '#ddd';
			context.strokeWidth = 0.2;
			coordinates.drawLines(context);
			context.restore();
			selection.draw();
			position.draw(function(p){
				var mousePosition = positionToMousePosition(p);
				fillRect(mousePosition.x,mousePosition.y);
			});
		};
	c.addEventListener('positiondragstart',function(e){
		if(!selection.isPresent() || !selection.handleDragStart(e.detail.x, e.detail.y)){
			coordinates.beginDrag(e.detail.x, e.detail.y);
		}
	});
	c.addEventListener('positiondragmove',function(e){
		coordinates.moveDrag(e.detail.toX, e.detail.toY);
		drawAll();
	});
	c.addEventListener('positiondragend',function(){
		coordinates.endDrag();
	});
	c.addEventListener('startzoom',function(e){
		coordinates.startZoom(e.detail.r);
	});
	c.addEventListener('changezoom',function(e){
		coordinates.changeZoom(e.detail.r);
	});
	c.addEventListener('endzoom',function(e){
		coordinates.endZoom();
	});
	menu.addOption('parse RLE',function(x,y){
		input(function(v){
			if(!v){return;}
			position.vacateAll();
			parseRLEBody(v, function(xx,yy){position.add(xx+x,yy+y);});
			drawAll();
		});
	});
	menu.addOption('parse plaintext',function(x,y){
		input(function(v){
			if(!v){return;}
			position.vacateAll();
			parsePlaintext(v, function(xx,yy){position.add(xx+x,yy+y);});
			drawAll();
		});
	});
	menu.addOption('save image',function(){
		c.save();
	});
	topRightButtons.attach();
	snapshots.attach();
	input(function(){},"Click on a cell to bring it to life. Hit the space bar to get things moving, or to pause them if they already are. Adjust the slider to make them move faster or slower. Shift-click on a cell to make a selection, and then right-click on the selection to find some options.");
	readHash();
	drawAll();
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
				drawAll();
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
		drawAll();
	});
});