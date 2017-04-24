(function(){
	var positionFactory = function(){
		var direction = {
			NORTHEAST:0,
			NORTHWEST:1,
			SOUTHWEST:2,
			SOUTHEAST:3
		};
		var pointInDirection = [];
		pointInDirection[direction.NORTHEAST] = {x:1,y:-1};
		pointInDirection[direction.NORTHWEST] = {x:-1,y:-1};
		pointInDirection[direction.SOUTHWEST] = {x:-1,y:1};
		pointInDirection[direction.SOUTHEAST] = {x:1,y:1};
		var currentTree = null;
		var getDirection = function(x, y){
			if(x >= 0){
				if(y >= 0){
					return direction.SOUTHEAST;
				}else{
					return direction.NORTHEAST;
				}
			}else{
				if(y >= 0){
					return direction.SOUTHWEST;
				}else{
					return direction.NORTHWEST;
				}
			}
		};
		var tree = function(x, y, size, getParentTree, forgetTree){
			forgetTree = forgetTree || function(){};
			var minX = x - size, maxX = x + size - 1, minY = y - size, maxY = y + size - 1;
			var subTrees = [];
			var environmentChanged = false;
			var self;
			subTrees[direction.NORTHEAST] = null;
			subTrees[direction.NORTHWEST] = null;
			subTrees[direction.SOUTHWEST] = null;
			subTrees[direction.SOUTHEAST] = null;
			var contains = function(xx,yy){return xx >= minX && xx <= maxX && yy >= minY && yy <= maxY;};
			var isOutsideBox = function(box){
				return box.maxX < minX || box.minX > maxX || box.maxY < minY || box.minY > maxY;
			};
			var containsNoNeighborOf = function(xx,yy){
				return xx < minX - 1 || xx > maxX + 1 || yy < minY - 1 || yy > maxY + 1;
			};
			var getTreeInDirection = function(dir){
				var result;
				if(result = subTrees[dir]){return result;}
				var point = pointInDirection[dir];
				var forgetSubTree = function(){
					subTrees[dir] = null;
					checkContent();
				};
				if(size == 1){
					result = makeNewPosition(x-1/2+point.x/2, y-1/2+point.y/2, forgetSubTree);
				}else{
					result = tree(x + point.x * size / 2, y + point.y * size /2, size / 2, function(){return self;}, forgetSubTree);
				}
				return subTrees[dir] = result;
			};
			var checkContent = function(){
				if(!subTrees.some(function(t){return t!=null;})){
					forgetTree();
				}
			};
			var findNeighborsOf = function(x,y,soFar){
				if(containsNoNeighborOf(x,y)){return;}
				if(size == 1){
					for(var i=0;i<4;i++){
						var p = subTrees[i];
						if(p != null&&Math.abs(x - p.x) < 2 && Math.abs(y - p.y) < 2){
							soFar.push(p);
						}
					}
				}else{
					for(var i=0;i<4;i++){
						var t = subTrees[i];
						if(t != null){
							t.findNeighborsOf(x,y,soFar);
						}
					}
				}
			};
			var findNeighborsOfForChildTree = function(x,y,soFar,childTree){
				if(size > 1){
					for(var i=0;i<4;i++){
						var t = subTrees[i];
						if(t != childTree && t != null){
							t.findNeighborsOf(x,y,soFar);
						}
					}
				}else{
					for(var i=0;i<4;i++){
						var p = subTrees[i];
						if(p != childTree && p != null &&Math.abs(x - p.x) < 2 && Math.abs(y - p.y) < 2){
							soFar.push(p);
						}
					}
				}
				if(getParentTree){
					getParentTree().findNeighborsOfForChildTree(x,y,soFar,self);
				}
			};
			var makeNewPosition = function(x,y,forgetPosition){
				var neighbors = [];
				var occupied = false;
				var newOne = {
					x:x,
					y:y,
					occupy:function(){
						occupied = true;
						createNeighborsOf(x,y);
						this.change();
					},
					notifyEnvironmentChanged:function(){
						notifyEnvironmentChanged();
					},
					change:function(){
						for(var i=0;i<this.neighbors.length;i++){
							this.neighbors[i].notifyEnvironmentChanged();
						}
					},
					makeBiggerTreeInDirection:function(dir, getParent, forgetBiggerTree){
						var point = pointInDirection[dir];
						var biggerTree = tree(x + (1 + point.x)/2, y + (1+ point.y)/2, 1, getParent, forgetBiggerTree);
						biggerTree.subTrees[(dir + 2)%4] = this;
						forgetPosition = function(){
							biggerTree.subTrees[(dir + 2)%4] = null;
							biggerTree.checkContent();
						};
						return biggerTree;
					},
					draw:function(drawer){
						if(!occupied){return;}
						drawer(this);
					},
					isOccupied:function(){return occupied;},
					vacate:function(){
						this.change();
						occupied = false;
						var neighborWithoutOccupiedNeighbors;
						while(neighborWithoutOccupiedNeighbors = this.neighbors.find(function(p){return !p.isOccupied() && p.hasNoOccupiedNeighbors();})){
							neighborWithoutOccupiedNeighbors.forget();
						}
						if(this.hasNoOccupiedNeighbors()){
							this.forget();
						}
					},
					numberOfLiveNeighbors:function(){
						var n = 0;
						for(var i=0;i<this.neighbors.length;i++){
							if(this.neighbors[i].isOccupied()){
								n++;
							}
						}
						return n;
					},
					forgetNeighbor:function(p){
						var index = this.neighbors.indexOf(p);
						if(index > -1){
							this.neighbors.splice(this.neighbors.indexOf(p), 1);
						}else{
							throw new Error("forgetting neighbor that has already been forgotten");
						}
						
					},
					beForgottenByNeighbors:function(){
						var self = this;
						this.neighbors.map(function(pp){pp.forgetNeighbor(self);});
					},
					hasNoOccupiedNeighbors:function(){
						return !this.neighbors.some(function(pp){return pp.isOccupied();});
					},
					forget:function(){
						this.beForgottenByNeighbors();
						forgetPosition();
					}
				};
				findNeighborsOfForChildTree(x,y,neighbors,newOne);
				newOne.neighbors = neighbors;
				neighbors.map(function(p){p.neighbors.push(newOne);});
				return newOne;
			};
			var makeBiggerTreeInDirection = function(dir, getParent, forgetBiggerTree){
				var point = pointInDirection[dir];
				var biggerTree = tree(x + point.x * size, y + point.y * size, 2*size, getParent, forgetBiggerTree);
				biggerTree.subTrees[(dir + 2)%4] = self;
				forgetTree = function(){
					biggerTree.subTrees[(dir + 2)%4] = null;
					biggerTree.checkContent();
				};
				getParentTree = function(){return biggerTree;};
				biggerTree.notifyEnvironmentChanged();
				return biggerTree;
			};
			var draw = function(drawer){
				for(var i=0;i<4;i++){
					var t = subTrees[i];
					if(t != null){
						t.draw(drawer);
					}
				}
			};
			var getDiagnosis = function(positionsToVacate, positionsToOccupy){
				if(!environmentChanged){return;}
				for(var i=0;i<4;i++){
					var t = subTrees[i];
					if(t != null){
						if(size == 1){
							var liveNeighbors = t.numberOfLiveNeighbors();
							if(t.isOccupied()){
								if(liveNeighbors < 2 || liveNeighbors > 3){
									positionsToVacate.push(t);
								}
							}else{
								if(liveNeighbors == 3){
									positionsToOccupy.push(t);
								}
							}
						}else{
							t.getDiagnosis(positionsToVacate, positionsToOccupy);
						}
					}
				}
			};
			var countAll = function(){
				var result = 0;
				subTrees.map(function(t){
					if(t != null){
						if(size == 1){
							result++;
						}else{
							result += t.countAll();
						}
					}
				});
				return result;
			};
			var getAllOccupiedPositions = function(){
				var all = [];
				subTrees.map(function(t){
					if(t != null){
						if(size == 1){
							if(t.isOccupied()){
								all.push(t);
							}
						}else{
							t.getAllOccupiedPositions().map(function(p){
								all.push(p);
							});
						}
					}
				});
				return all;
			};
			var add = function(xx,yy){
				var dir = getDirection(xx - x, yy - y);
				var subTree = getTreeInDirection(dir);
				if(size == 1){
					return subTree;
				}
				return subTree.add(xx,yy);
			};
			var find = function(xx,yy){
				var dir = getDirection(xx - x, yy - y);

				var subTree = subTrees[dir];
				if(subTree){
					if(size == 1){
						return subTree;
					}
					return subTree.find(xx,yy);
				}
			};
			var getIfExistsOnXY = function(xx,yy){
				if(!contains(xx,yy)){
					return null;
				}
				var dir = getDirection(xx - x, yy - y);
				var subTree = subTrees[dir];
				if(!subTree){
					return null;
				}
				if(size == 1){
					return subTree;
				}
				return subTree.getIfExistsOnXY(xx,yy);
			};
			var getAllInBox = function(box){
				var all = [];
				if(isOutsideBox(box)){
					return all;
				}
				subTrees.map(function(t){
					if(t != null){
						if(size == 1){
							if(t.isOccupied() && t.x >= box.minX && t.x <= box.maxX && t.y >= box.minY && t.y <= box.maxY){
								all.push(t);
							}
						}else{
							t.getAllInBox(box).map(function(p){
								all.push(p);
							});
						}
					}
				});
				return all;
			};
			var setEnvironmentUnchanged = function(){
				environmentChanged = false;
				if(size == 1){return;}
				for(var i=0;i<4;i++){
					var t = subTrees[i];
					if(t != null){
						t.setEnvironmentUnchanged();
					}
				}
			};
			var notifyEnvironmentChanged = function(){
				if(environmentChanged){return;}
				environmentChanged = true;
				var parent = getParentTree && getParentTree();
				parent && parent.notifyEnvironmentChanged();
			};
			self = {
				size:size,
				subTrees:subTrees,
				contains:contains,
				find:find,
				getAllOccupiedPositions:getAllOccupiedPositions,
				checkContent:checkContent,
				countAll:countAll,
				getIfExistsOnXY:getIfExistsOnXY,
				isOutsideBox:isOutsideBox,
				setEnvironmentUnchanged:setEnvironmentUnchanged,
				notifyEnvironmentChanged:notifyEnvironmentChanged,
				getAllInBox:getAllInBox,
				getDiagnosis:getDiagnosis,
				add:add,
				draw:draw,
				makeBiggerTreeInDirection:makeBiggerTreeInDirection,
				findNeighborsOfForChildTree:findNeighborsOfForChildTree,
				findNeighborsOf:findNeighborsOf
			};
			return self;
		};
		var createNeighborsOf = function(x,y){
			add(x-1,y-1);
			add(x-1,y);
			add(x-1,y+1);
			add(x,y-1);
			add(x,y+1);
			add(x+1,y-1);
			add(x+1,y);
			add(x+1,y+1);
		};
		var makeBiggerTree = function(t, forgetBiggerTree){
			var newT = tree(0,0,2 * t.size, null, forgetBiggerTree);
			var getParent = function(){return newT;};
			t.subTrees.map(function(st,i){
				if(st){
					newT.subTrees[i] = st.makeBiggerTreeInDirection(i, getParent, function(){
						newT.subTrees[i] = null;
						newT.checkContent();
					});
				}
			});
			return newT;
		};
		var add = function(x,y){
			if(currentTree == null){
				currentTree = tree(0,0,1);
			};
			while(!currentTree.contains(x,y)){
				currentTree = makeBiggerTree(currentTree, function(){
					currentTree = null;
				});
			}
			return currentTree.add(x,y);
		};
		var obj = {};
		obj.add = function(x,y){
			var newOne = add(x,y);
			newOne.occupy();
		};
		obj.contains = function(x,y){
			var found = currentTree ? currentTree.find(x,y) : null;
			if(found && found.isOccupied()){
				return true;
			}
			return false;
		};
		obj.remove = function(x,y){
			var found = currentTree ? currentTree.find(x,y) : null;
			if(found && found.isOccupied()){
				found.vacate();
			}
		};
		obj.countAll = function(){return currentTree ? currentTree.countAll() : 0;};
		obj.getAllAlive = function(){return currentTree ? currentTree.getAllOccupiedPositions() : [];};
		obj.countAlive = function(){return currentTree ? currentTree.getAllOccupiedPositions().length : 0;};
		obj.getIfExistsOnXY = function(x,y){return currentTree ? currentTree.getIfExistsOnXY(x,y) : null;};
		obj.getAllInBox = function(box){return currentTree ? currentTree.getAllInBox(box) : [];};
		obj.draw = function(draw){
			currentTree && currentTree.draw(draw);
		};
		obj.vacateAll = function(){
			currentTree && currentTree.getAllOccupiedPositions().map(function(p){p.vacate();});
		};
		var getDiagnosis = function(){
			var positionsToVacate = [];
			var positionsToOccupy = [];
			if(currentTree){
				currentTree.getDiagnosis(positionsToVacate, positionsToOccupy);
				currentTree.setEnvironmentUnchanged();
			}
			return {
				positionsToVacate:positionsToVacate,
				positionsToOccupy:positionsToOccupy
			};
		};
		obj.doStep = function(stop, done){
			try{
				var diagnosis = getDiagnosis();
				var positionsToVacate = diagnosis.positionsToVacate;
				var positionsToOccupy = diagnosis.positionsToOccupy;
				if(positionsToVacate.length == 0 && positionsToOccupy.length == 0){
					stop && stop();
				}
				for(var i=0;i<positionsToVacate.length;i++){
					positionsToVacate[i].vacate();
				}
				positionsToOccupy.map(function(p){add(p.x,p.y).occupy();});
				done && done();
			}catch(e){
				stop && stop();
				throw e;
			}
		};
		obj.getCurrentTreeSize = function(){
			return currentTree ? currentTree.size : 0;
		};
		return obj;
	};
	window.quadTreePositionFactory = positionFactory;
	
	
})();

