(function(){
	var reportSuccess = function(t){console.info(t);};
	var reportFailure = function(t){console.error(t);};
	var test = function(name, t){
		hashMapProvider.set(getHashMap());
		var fail = function(e){
			reportFailure(name+" failed");
			console.error(e);
		};
		var pass = function(){reportSuccess(name+" passed");};
		try{
			t.apply({
				assert: function(b, msg){
					if(!b){
						throw new Error("assertion failed"+(msg?": "+msg:""));
					}
				}
			}, []);
		}catch(e){
			fail(e);
			return;
		}
		pass();
	};

	test("nodeTest1",function(){
		var baseNw = new TreeNode(true);
		var baseNe = new TreeNode(false);
		var baseSw = new TreeNode(false);
		var baseSe = new TreeNode(true);

		var combination = new TreeNode(baseNw, baseNe, baseSw, baseSe);
		this.assert(combination.population == 2,"population should be 2");
		this.assert(combination.alive,"should be alive");
		this.assert(combination.level == 1, "level should be 1");
		this.assert(combination.nw = baseNw, "should refer to the child nodes");
	});

	test("createTest",function(){
		var created = TreeNodeBase.create();
		this.assert(created.level == 3);
	});

	test("setBitTest",function(){
		var node = TreeNodeBase.create();
		node = node.setBit(0,0);
		node = node.setBit(1,0);
		this.assert(node.population == 2, "population should be 2");
		this.assert(node.getBit(0,0) == 1, "bit at 0,0 should be 1");
		this.assert(node.getBit(1,0) == 1, "bit at 1,0 should be 1")
	});
	
	test("expandUniverseTest",function(){
		var node = TreeNodeBase.create();
		node = node.expandUniverse();
		this.assert(node.level == 4, "level should be 4");
	});

	test("oneGenTest",function(){
		var node = new TreeNode(true);
		var aliveInNext = node.oneGen(0b100111).alive; //three south neighbors are alive
		this.assert(aliveInNext);

		node = new TreeNode(false);
		aliveInNext = node.oneGen(0b100111).alive; //three south neighbors are alive
		this.assert(aliveInNext);

		node = new TreeNode(false);
		aliveInNext = node.oneGen(0b11).alive; //two south neighbors are alive
		this.assert(!aliveInNext);

		node = new TreeNode(true);
		aliveInNext = node.oneGen(0b100001).alive; //one south neighbor is alive
		this.assert(!aliveInNext);
	});

	test("slowSimulationTest",function(){
		var node = TreeNodeBase.create().nw;
		node = node.setBit(-2,-2).setBit(-1,-2).setBit(0,-2).setBit(1,-2); //a 4x4 with the top four alive
		var resultNode = node.slowSimulation(); //should be a 2x2 with the top two alive
		this.assert(resultNode.population == 2);

	});

	test("nextGenerationTestEmpty",function(){
		var node = TreeNodeBase.create();
		var next = node.nextGeneration();
		this.assert(next.level == 2, "level should be 2");
		this.assert(next.population == 0, "population should be 0");
	});

	test("nextGenerationTestNonEmpty",function(){
		var node = TreeNodeBase.create().setBit(0,0).setBit(0,-1).setBit(0,1); //a blinker in its vertical state
		var next = node.nextGeneration();
		this.assert(next.population == 3);
		this.assert(next.getBit(0,0) == 1);
		this.assert(next.getBit(1,0) == 1);
		this.assert(next.getBit(-1,0) == 1);
	});

	test("canonicalTreeNodeCreateTest",function(){
		var created = CanonicalTreeNode.create();
		this.assert(created.nw == created.ne);
		var createdAgain = CanonicalTreeNode.create();
		this.assert(created == createdAgain);
		this.assert(created.nw == createdAgain.nw);
	});

	test("canonicalTreeNodeTest",function(){
		var one = CanonicalTreeNode.create().setBit(0,0).setBit(0,1);
		var two = CanonicalTreeNode.create().setBit(0,0).setBit(0,1);
		this.assert(one == two);
		this.assert(one.nw == two.nw);
	});

	test("memoizedTreeNodeTest",function(){
		var node = MemoizedTreeNode.create();
		this.assert(node instanceof MemoizedTreeNode, "expected an instance of MemoizedTreeNode");
		node = node.setBit(0,0).setBit(0,1).setBit(0,-1);
		var nextNode = node.nextGeneration();
		this.assert(node.nextGeneration() == nextNode);
	});
})();
