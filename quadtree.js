var position = (function(){
	var direction = {
		NORTHEAST:0,
		NORTHWEST:1,
		SOUTHWEST:2,
		SOUTHEAST:3
	};
	var currentTree = null;
	var tree = function(x, y, size){
		var minX = x - size, maxX = x + size - 1, minY = y - size, maxY = y + size - 1;
		var subTrees = [];
		subTrees[direction.NORTHEAST] = null;
		subTrees[direction.NORTHWEST] = null;
		subTrees[direction.SOUTHWEST] = null;
		subTrees[direction.SOUTHEAST] = null;
		var contains = function(xx,yy){return xx >= minX && xx <= maxX && yy >= minY && yy <= maxY;};
		var add = function(xx,yy){

		};
		return {
			size:size,
			subTrees:subTrees,
			contains:contains,
			add:function(xx,yy){add(xx,yy);return this;}
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
})();