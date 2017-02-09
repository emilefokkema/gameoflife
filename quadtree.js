var position = (function(){
	var direction = {
		NORTHEAST:0,
		NORTHWEST:1,
		SOUTHWEST:2,
		SOUTHEAST:3
	};
	var currentTree = null;
	var tree = function(x, y, size){
		
	}
	var add = function(x,y){
		if(currentTree == null){
			currentTree = tree(0,0,1);
		};
		while(!currentTree.contains(x,y)){
			currentTree = currentTree.expand();
		}
		return currentTree.add(x,y);
	};
})();