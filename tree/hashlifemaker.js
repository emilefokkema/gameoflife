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

		var doStep = function(stop, done){
			while(currentTree.level < 3 ||
				currentTree.nw.population != currentTree.nw.se.se.population ||
				currentTree.ne.population != currentTree.ne.sw.sw.population ||
				currentTree.sw.population != currentTree.sw.ne.ne.population ||
				currentTree.se.population != currentTree.se.nw.nw.population){
				currentTree = currentTree.expandUniverse();
			}
			currentTree = currentTree.nextGeneration();
			done && done();
		};

		return {
			draw:draw,
			contains:contains,
			add:add,
			remove:remove,
			doStep:doStep
		};
	};
})();