var position = (function(){
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
	var tree = function(x, y, size){
		var minX = x - size, maxX = x + size - 1, minY = y - size, maxY = y + size - 1;
		var subTrees = [];
		subTrees[direction.NORTHEAST] = null;
		subTrees[direction.NORTHWEST] = null;
		subTrees[direction.SOUTHWEST] = null;
		subTrees[direction.SOUTHEAST] = null;
		var contains = function(xx,yy){return xx >= minX && xx <= maxX && yy >= minY && yy <= maxY;};
		var makeTreeInDirection = function(dir){
			var point = pointInDirection[dir];
			if(size == 1){
				return {x:x-1/2+point.x/2, y:y-1/2+point.y/2};
			}else{
				return tree(x + point.x * size / 2, y + point.y * size /2, size / 2);
			}
		};
		var add = function(xx,yy){
			var dir = getDirection(xx - x, yy - y);
			var subTree = subTrees[dir] = subTrees[dir] || makeTreeInDirection(dir);
			if(size == 1){
				return subTree;
			}
			return subTree.add(xx,yy);
		};
		return {
			size:size,
			subTrees:subTrees,
			contains:contains,
			add:add
		};
	}
	var makeBiggerTree = function(t){
		var newT = tree(0,0,2 * t.size);
		t.subTrees.map(function(st,i){
			if(st){
				newT.subTrees[(i + 2)%4] = st;
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

	console.log(add(5,3));
	console.log(add(5,2));
	console.log(currentTree);
})();