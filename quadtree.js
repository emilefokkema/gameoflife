(function(){
	var positionFactory = function(positionToMousePosition, fillRect){
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
					subTrees.map(function(p){
						if(p!=null&&Math.abs(x - p.x) < 2 && Math.abs(y - p.y) < 2){
							soFar.push(p);
						}
					});
				}else{
					subTrees.map(function(t){
						if(t != null){
							t.findNeighborsOf(x,y,soFar);
						}
					});
				}
			};
			var findNeighborsOfForChildTree = function(x,y,soFar,childTree){
				if(size > 1){
					subTrees.map(function(t){
						if(t != childTree && t != null){
							t.findNeighborsOf(x,y,soFar);
						}
					});
				}else{
					subTrees.map(function(p){
						if(p!=childTree && p!=null&&Math.abs(x - p.x) < 2 && Math.abs(y - p.y) < 2){
							soFar.push(p);
						}
					});
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
					draw:function(){
						if(!occupied){return;}
						var mousePosition = positionToMousePosition(this);
						fillRect(mousePosition.x,mousePosition.y);
					},
					isOccupied:function(){return occupied;},
					vacate:function(){
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
				return biggerTree;
			};
			var draw = function(){
				subTrees.map(function(t){
					if(t != null){t.draw();}
				});
			};
			var getDiagnosis = function(positionsToVacate, positionsToOccupy){
				subTrees.map(function(t){
					if(t!=null){
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
				});
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
			self = {
				size:size,
				subTrees:subTrees,
				contains:contains,
				getAllOccupiedPositions:getAllOccupiedPositions,
				checkContent:checkContent,
				countAll:countAll,
				getIfExistsOnXY:getIfExistsOnXY,
				isOutsideBox:isOutsideBox,
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
		add.countAll = function(){return currentTree ? currentTree.countAll() : 0;};
		add.getAllAlive = function(){return currentTree ? currentTree.getAllOccupiedPositions() : [];};
		add.countAlive = function(){return currentTree ? currentTree.getAllOccupiedPositions().length : 0;};
		add.getIfExistsOnXY = function(x,y){return currentTree ? currentTree.getIfExistsOnXY(x,y) : null;};
		add.getAllInBox = function(box){return currentTree ? currentTree.getAllInBox(box) : [];};
		add.draw = function(){
			currentTree && currentTree.draw();
		};
		add.vacateAll = function(){
			currentTree && currentTree.getAllOccupiedPositions().map(function(p){p.vacate();});
		};
		add.getDiagnosis = function(){
			var positionsToVacate = [];
			var positionsToOccupy = [];
			if(currentTree){
				currentTree.getDiagnosis(positionsToVacate, positionsToOccupy);
			}
			return {
				positionsToVacate:positionsToVacate,
				positionsToOccupy:positionsToOccupy
			};
		};
		add.getCurrentTreeSize = function(){
			return currentTree ? currentTree.size : 0;
		};
		return add;
	};
	window.quadTreePositionFactory = positionFactory;
	var test = function(name, t){
		var fail = function(msg, e){
			console.error(name+" failed: "+msg);
			if(e){console.trace(e);}
		}
		try{
			t.apply({
				assert:function(b, msg){
					if(!b){fail(msg);}
				}
			},[]);
		}catch(e){
			fail(e.message, e);
		}
	};
	test('test1',function(){
		var position = positionFactory();
		var oneOne = position(1,1);
		this.assert(position(1, 1) === oneOne);
	});
	test('test2',function(){
		var position = positionFactory();
		var oneOne = position(1,1);
		var twoTwo = position(2,2);
		this.assert(oneOne.neighbors.indexOf(twoTwo) > -1);
	});
	test('test3',function(){
		var position = positionFactory();
		var one = position(1,0);
		var two = position(2,1);
		var three = position(1,-1);
		this.assert(one.neighbors.indexOf(two) > -1);
		this.assert(two.neighbors.indexOf(one) > -1);

		this.assert(one.neighbors.indexOf(three) > -1);
		this.assert(three.neighbors.indexOf(one) > -1);

		this.assert(two.neighbors.indexOf(three) == -1);
		this.assert(three.neighbors.indexOf(two) == -1);
	});
	test('testForget',function(){
		var position = positionFactory();
		var p = position(5,5);
		this.assert(position.countAll() == 1);
		p.forget();
		this.assert(position.countAll() == 0);
	});
	test('testNeighbors',function(){
		var position = positionFactory();
		var p1 = position(5,5);
		var p2 = position(4,4);
		this.assert(p1.neighbors.length == 1);
	});
	test('testOccupyVacate',function(){
		var position = positionFactory();
		var p = position(5,5);
		this.assert(position.countAll() == 1);
		var q = position(6,6);
		this.assert(p.neighbors.indexOf(q) > -1);
		p.occupy();
		this.assert(position.countAll() == 9);
		q.occupy();
		this.assert(position.countAll() == 14);
		q.vacate();
		this.assert(position.countAll() == 9);
		p.vacate();
		this.assert(position.countAll() == 0);
	});
	test('testGetIfExists', function(){
		var position = positionFactory();
		var p = position(3,3);
		this.assert(position.getIfExistsOnXY(3,3) == p);
		this.assert(position.getIfExistsOnXY(3,4) == null);
	});
})();

