(function(){
	window.hashLifeMaker = function(){
		var currentTree = MemoizedTreeNode.create();

		var draw = function(xyDrawer){
			currentTree.getCoordinates(0, 0, function(x,y){xyDrawer({x:x,y:y});});
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

		var doStep = function(){
			while(currentTree.level < 3 ||
				currentTree.nw.population != currentTree.nw.se.se.population ||
				currentTree.ne.population != currentTree.ne.sw.sw.population ||
				currentTree.sw.population != currentTree.sw.ne.ne.population ||
				currentTree.se.population != currentTree.se.nw.nw.population){
				currentTree = currentTree.expandUniverse();
			}
			currentTree = currentTree.nextGeneration();
		};

		var vacateAll = function(){
			currentTree = MemoizedTreeNode.create();
		};

		var getAllInBox = function(box){
			var result =[];
			currentTree.getCoordinates(0, 0, function(x,y){
				if(x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY){
					result.push({x:x,y:y});
				}
			});
			return result;
		};

		var getAllAlive = function(){
			var result = [];
			currentTree.getCoordinates(0, 0, function(x,y){
				result.push({x:x,y:y});
			});
			return result;
		};

		var timePerStepLog = 0;

		var setTimePerStepLog = function(l){
			if(l != timePerStepLog){
				MemoizedTreeNode.setTimePerStepLog(l);
				timePerStepLog = l;
			}
		};

		var getTimePerStepLog = function(){return timePerStepLog;};

		return {
			draw:draw,
			contains:contains,
			setTimePerStepLog:setTimePerStepLog,
			getTimePerStepLog:getTimePerStepLog,
			add:add,
			remove:remove,
			doStep:doStep,
			vacateAll:vacateAll,
			getAllInBox:getAllInBox,
			getAllAlive:getAllAlive
		};
	};
})();