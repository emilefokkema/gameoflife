(function(){
	var TreeNode = function(){
		TreeNodeBase.apply(this,arguments);
	};

	var nextGeneration;


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
		centeredSubnode:{
			value:function(){
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
		getCenter:{
			value:function(){
				if(this.level - 1 <= nextGeneration.timePerStepLog){
					return this.nextGeneration();
				}
				return this.centeredSubnode();
			}
		},
		nextGeneration:{
			value:function(){
				if(this.population == 0){
					return this.nw;
				}
				if(this.level == 2){
					return this.slowSimulation();
				}
				var n00 = this.nw.getCenter(),
					n01 = this.centeredHorizontal(this.nw, this.ne).getCenter(),
					n02 = this.ne.getCenter(),
					n10 = this.centeredVertical(this.nw, this.sw).getCenter(),
					n11 = this.centeredSubnode().getCenter(),
					n12 = this.centeredVertical(this.ne, this.se).getCenter(),
					n20 = this.sw.getCenter(),
					n21 = this.centeredHorizontal(this.sw, this.se).getCenter(),
					n22 = this.se.getCenter();

				return this.create(this.create(n00, n01, n10, n11).nextGeneration(),
				              this.create(n01, n02, n11, n12).nextGeneration(),
				              this.create(n10, n11, n20, n21).nextGeneration(),
				              this.create(n11, n12, n21, n22).nextGeneration()) ;
			}
		}
	});
	nextGeneration = TreeNode.prototype.nextGeneration;
	nextGeneration.timePerStepLog = 2;
	window.TreeNode = TreeNode;
})();

