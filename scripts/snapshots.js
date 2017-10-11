define(["topRightButtons","body","c","menu","rle","input","animation","requireElement","tree/hashlife"],function(topRightButtons, body, c, menu, rle, input, animation, requireElement, hashLife){
	var clipboard = (function(){
		var relativePositions, removeMenuOption;
		var paste = function(x, y){
			relativePositions.map(function(p){
				hashLife.add(x + p.x,y + p.y);
			});
			c.drawAll();
		};
		var copy = function(_relativePositions, makeSnapshot){
			relativePositions = _relativePositions;
			!removeMenuOption && (removeMenuOption = menu.addOption('paste', paste));
			if(makeSnapshot){
				snapshots.add(_relativePositions);
			}
		};
		
		return {copy:copy};
	})();

	var snapshots = requireElement(document.getElementById("snapshots"), function(closeButton, snapshotElement){
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
					animation.reset();
					positions.map(function(p){
						hashLife.add(origMinX + p.x,origMinY + p.y);
					});
					c.drawAll();
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
				body.addClass('show-snapshots');
				showing = true;
			};
			var hide = function(){
				body.removeClass('show-snapshots');
				showing = false;
			};
			closeButton.addEventListener('click',hide);
			
			var add = function(positions){
				positions = positions.map(function(p){return {x:p.x,y:p.y};});
				snapshotElement(function(canvas, optionElement){
						var remove = this.remove;
						var getSnapshotOption = function(name, toDo){
							optionElement(function(option){
									option.addEventListener('click',toDo);
							},{name:name});
						};
						canvas.setAttribute('width',snapshotWidth);
						canvas.setAttribute('height',snapshotHeight);
						var newSnapshot = makeSnapshot(positions, function(){
							remove();
							count--;
							if(count == 0){
								body.removeClass('show-snapshots');
								body.removeClass('has-snapshots');
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
											input.alert(rle.make(positions));
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

				body.addClass('has-snapshots');
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
				copy:clipboard.copy
			};
		});

	return snapshots;
});