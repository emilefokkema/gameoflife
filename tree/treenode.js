(function(){
	var TreeNode = function(){
		TreeNodeBase.apply(this,arguments);
	};

	TreeNode.prototype = Object.create(TreeNodeBase.prototype, {});

	window.TreeNode = TreeNode;
})();

