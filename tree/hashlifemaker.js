(function(){
	window.hashLifeMaker = function(){
		var currentTree = MemoizedTreeNode.create();

		var draw = function(xyDrawer){
			currentTree.draw(0, 0, function(x,y){xyDrawer({x:x,y:y});});
		};

		var contains = function(x,y){
			if(!currentTree.canContain(x,y)){return false;}
			return currentTree.getBit(x,y) == 1;
		};

		var add = function(x,y){
			while(!currentTree.canContain(x,y)){
				currentTree = currentTree.expandUniverse();
			}
			currentTree = currentTree.setBit(x,y);
		};

		var remove = function(x,y){
			if(!currentTree.canContain(x,y)){return;}
			currentTree = currentTree.removeBit(x,y);
		};

		return {
			draw:draw,
			contains:contains,
			add:add,
			remove:remove
		};
	};
})();