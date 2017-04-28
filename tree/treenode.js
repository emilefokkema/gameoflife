(function(){
	var timePerStepLog = 1;

	var TreeNode = function(){
		TreeNodeBase.apply(this,arguments);
	};

	TreeNode.prototype = Object.create(TreeNodeBase.prototype, {
		oneGen: {
			value:function(bitMask){
				if(bitMask == 0){
					return this.create(false);
				}
				var self = (bitMask >> 5) & 1 ;
				bitMask &= 0x757 ;
				var neighborCount = 0;
				while (bitMask != 0) {
				   neighborCount++ ;
				   bitMask &= bitMask - 1 ;
				}
				if (neighborCount == 3 || (neighborCount == 2 && self != 0)){
				   return this.create(true) ;
				}
				else{
				   return this.create(false) ;
				}
			}
		},
		slowSimulation:{
			value:function(){
				var allBits = 0;
				for(var y=-2;y<2;y++){
					for(var x=-2;x<2;x++){
						allBits = (allBits << 1) + this.getBit(x, y) ;
					}
				}
				return this.create(this.oneGen(allBits>>5), this.oneGen(allBits>>4),
				              this.oneGen(allBits>>1), this.oneGen(allBits)) ;
			}
		},
		recursiveNextGeneration:{
			value:function(){
				if(this.level == 2){
					return this.slowSimulation();
				}
				var n00 = this.nw.centeredSubnode(true),
					n01 = this.centeredHorizontal(this.nw, this.ne).centeredSubnode(true),
					n02 = this.ne.centeredSubnode(true),
					n10 = this.centeredVertical(this.nw, this.sw).centeredSubnode(true),
					n11 = this.centeredSubnode(false).centeredSubnode(true),
					n12 = this.centeredVertical(this.ne, this.se).centeredSubnode(true),
					n20 = this.sw.centeredSubnode(true),
					n21 = this.centeredHorizontal(this.sw, this.se).centeredSubnode(true),
					n22 = this.se.centeredSubnode(true);
				return this.create(this.create(n00, n01, n10, n11).centeredSubnode(true),
				              this.create(n01, n02, n11, n12).centeredSubnode(true),
				              this.create(n10, n11, n20, n21).centeredSubnode(true),
				              this.create(n11, n12, n21, n22).centeredSubnode(true)) ;
			}
		},
		centeredSubnode:{
			value:function(advancedInTime){
				if(advancedInTime){
					return this.nextGeneration();
				}
				return this.create(this.nw.se, this.ne.sw, this.sw.ne, this.se.nw) ;
			}
		},
		centeredHorizontal:{
			value:function(w, e){
				return this.create(w.ne, e.nw, w.se, e.sw) ;
			}
		},
		centeredVertical:{
			value:function(n, s){
				return this.create(n.sw, n.se, s.nw, s.ne) ;
			}
		},
		nextGeneration:{
			value:function(){
				if(this.population == 0){
					return this.nw;
				}
				if(this.level - 2 <= timePerStepLog){
					return this.recursiveNextGeneration();
				}
				var n00 = this.nw.centeredSubnode(false),
					n01 = this.centeredHorizontal(this.nw, this.ne).centeredSubnode(false),
					n02 = this.ne.centeredSubnode(false),
					n10 = this.centeredVertical(this.nw, this.sw).centeredSubnode(false),
					n11 = this.centeredSubnode(false).centeredSubnode(false),
					n12 = this.centeredVertical(this.ne, this.se).centeredSubnode(false),
					n20 = this.sw.centeredSubnode(false),
					n21 = this.centeredHorizontal(this.sw, this.se).centeredSubnode(false),
					n22 = this.se.centeredSubnode(false);
				return this.create(this.create(n00, n01, n10, n11).centeredSubnode(true),
				              this.create(n01, n02, n11, n12).centeredSubnode(true),
				              this.create(n10, n11, n20, n21).centeredSubnode(true),
				              this.create(n11, n12, n21, n22).centeredSubnode(true)) ;
			}
		}
	});

	window.TreeNode = TreeNode;
})();

