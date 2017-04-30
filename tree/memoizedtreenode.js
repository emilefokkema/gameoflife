(function(){

	var MemoizedTreeNode = function(){
		CanonicalTreeNode.apply(this,arguments);
		this.result = null;
	};

	var timePerStepLog;

	var setTimePerStepLog = function(l){
		if(l != timePerStepLog){
			TreeNode.prototype.nextGeneration.timePerStepLog = l;
			hashMapProvider.get().all(function(n){n.result = null});
			timePerStepLog = l;
		}
	};

	setTimePerStepLog(0);

	MemoizedTreeNode.prototype = Object.create(CanonicalTreeNode.prototype, {
		create:{
			value:function(){
				if(arguments.length == 4){
					return new MemoizedTreeNode(arguments[0], arguments[1], arguments[2], arguments[3]).intern();
				}
				return new MemoizedTreeNode(arguments[0]).intern();
			}
		},
		nextGeneration:{
			value:function(){
				if(this.result == null){
					this.result = CanonicalTreeNode.prototype.nextGeneration.apply(this,[]);
				}
				return this.result;
			}
		}
	});

	MemoizedTreeNode.create = function(){
		return new MemoizedTreeNode(false).emptyTree(3) ;
	};

	MemoizedTreeNode.setTimePerStepLog = setTimePerStepLog;

	window.MemoizedTreeNode = MemoizedTreeNode;
})();