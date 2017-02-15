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
		var tree = function(x, y, size, getParentTree){
			var minX = x - size, maxX = x + size - 1, minY = y - size, maxY = y + size - 1;
			var subTrees = [];
			var self;
			subTrees[direction.NORTHEAST] = null;
			subTrees[direction.NORTHWEST] = null;
			subTrees[direction.SOUTHWEST] = null;
			subTrees[direction.SOUTHEAST] = null;
			var contains = function(xx,yy){return xx >= minX && xx <= maxX && yy >= minY && yy <= maxY;};
			var makeTreeInDirection = function(dir){
				var point = pointInDirection[dir];
				if(size == 1){
					var newOne = makeNewPosition(x-1/2+point.x/2, y-1/2+point.y/2);
					return newOne;
				}else{
					return tree(x + point.x * size / 2, y + point.y * size /2, size / 2, function(){return self;});
				}
			};
			var findNeighborsOf = function(x,y,soFar){
				if(size == 1){
					subTrees.map(function(p){
						if(Math.abs(x - p.x) < 2 && Math.abs(y - p.y) < 2){
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
				}
				if(getParentTree){
					getParentTree().findNeighborsOfForChildTree(x,y,soFar,self);
				}
			};
			var makeNewPosition = function(x,y){
				var neighbors = [];
				var newOne = {
					x:x,
					y:y
				};
				findNeighborsOfForChildTree(x,y,neighbors,newOne);
				newOne.neighbors = neighbors;
				return newOne;
			};
			var makeBiggerTreeInDirection = function(dir, getParent){
				var point = pointInDirection[dir];
				var biggerTree = tree(x + point.x * size, y + point.y * size, 2*size, getParent);
				biggerTree.subTrees[(dir + 2)%4] = self;
				getParentTree = function(){return biggerTree;};
				return biggerTree;
			};
			var add = function(xx,yy){
				var dir = getDirection(xx - x, yy - y);
				var subTree = subTrees[dir] = subTrees[dir] || makeTreeInDirection(dir);
				if(size == 1){
					return subTree;
				}
				return subTree.add(xx,yy);
			};
			self = {
				size:size,
				subTrees:subTrees,
				contains:contains,
				add:add,
				makeBiggerTreeInDirection:makeBiggerTreeInDirection,
				findNeighborsOfForChildTree:findNeighborsOfForChildTree
			};
			return self;
		};
		var makeBiggerTree = function(t){
			var newT = tree(0,0,2 * t.size);
			var getParent = function(){return newT;};
			t.subTrees.map(function(st,i){
				if(st){
					newT.subTrees[i] = st.makeBiggerTreeInDirection(i, getParent);
				}
			});
			return newT;
		};
		var add = function(x,y){
			if(currentTree == null){
				currentTree = tree(0,0,1);
			};
			while(!currentTree.contains(x,y)){
				currentTree = makeBiggerTree(currentTree);
			}
			return currentTree.add(x,y);
		};
		return add;
	};
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
		this.assert(oneOne.neighbors.indexOf(twoTwo) > 0);
	});
})();

