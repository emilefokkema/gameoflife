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
		var tree = function(x, y, size, getSiblings){
			getSiblings = getSiblings || function(){return [];};
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
					return tree(x + point.x * size / 2, y + point.y * size /2, size / 2, function(){return subTrees;});
				}
			};
			var findNeighborsOf = function(x,y){

			};
			var makeNewPosition = function(x,y){
				return {
					x:x,
					y:y
				};
			};
			var makeBiggerTreeInDirection = function(dir, getSibs){
				var point = pointInDirection[dir];
				var biggerTree = tree(x + point.x * size, y + point.y * size, 2*size, getSibs);
				biggerTree.subTrees[(dir + 2)%4] = self;
				getSiblings = function(){return biggerTree.subTrees;};
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
				makeBiggerTreeInDirection:makeBiggerTreeInDirection
			};
			return self;
		};
		var makeBiggerTree = function(t){
			var newT = tree(0,0,2 * t.size);
			var getSibs = function(){return newT.subTrees;};
			t.subTrees.map(function(st,i){
				if(st){
					newT.subTrees[i] = st.makeBiggerTreeInDirection(i, getSibs);
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
		var fail = function(msg){
			console.error(name+" failed: "+msg);
		}
		try{
			t.apply({
				assert:function(b, msg){
					if(!b){fail(msg);}
				}
			},[]);
		}catch(e){
			fail(e.message);
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

