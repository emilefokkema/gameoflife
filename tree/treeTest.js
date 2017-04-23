(function(){
	var reportSuccess = function(t){console.info(t);};
	var reportFailure = function(t){console.error(t);};
	var test = function(name, t){
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
	})
})();