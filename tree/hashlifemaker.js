(function(){
	window.hashLifeMaker = function(){
		var currentTree = MemoizedTreeNode.create();

		var draw = function(xyDrawer){
			currentTree.draw(0, 0, function(x,y){xyDrawer({x:x,y:y});});
		};

		return {
			draw:draw
		};
	};
})();