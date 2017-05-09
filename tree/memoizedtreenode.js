(function(){
	var create = function(){
		if(arguments.length == 4){
			return new MemoizedTreeNode(arguments[0], arguments[1], arguments[2], arguments[3]).intern();
		}
		return new MemoizedTreeNode(arguments[0]).intern();
	};

	var emptyTree = function(lev){
		if(lev <= 0){
			return create(false);
		}
		var n = emptyTree(lev - 1);
		return create(n, n, n, n);
	};

	var oneGen = function(bitMask){
		if(bitMask == 0){
			return create(false);
		}
		var self = (bitMask >> 5) & 1 ;
		bitMask &= 0x757 ;
		var neighborCount = 0;
		while (bitMask != 0) {
		   neighborCount++ ;
		   bitMask &= bitMask - 1 ;
		}
		if (neighborCount == 3 || (neighborCount == 2 && self != 0)){
		   return create(true) ;
		}
		else{
		   return create(false) ;
		}
	};

	var MemoizedTreeNode = function(){
		this.nw = null;
		this.ne = null;
		this.sw = null;
		this.se = null;
		this.level = 0;
		this.alive = false;
		this.population = 0;
		this.hashCache = null;
		this.result = null;
		if(arguments.length == 4){
			this.nw = arguments[0];
			this.ne = arguments[1];
			this.sw = arguments[2];
			this.se = arguments[3];
			this.level = this.nw.level + 1;
			this.population = this.nw.population + this.ne.population + this.sw.population + this.se.population;
			this.alive = this.population > 0;
			return;
		}
		this.alive = arguments[0];
		this.population = this.alive ? 1 : 0;
		
	};

	var timePerStepLog;

	var setTimePerStepLog = function(l){
		if(l != timePerStepLog){
			timePerStepLog = l;
			hashMapProvider.get().all(function(n){n.result = null});
		}
	};

	setTimePerStepLog(0);

	MemoizedTreeNode.prototype = {
		setBit: function(x,y){
			if(this.level == 0){
				return create(true);
			}
			var offset = 1 << (this.level - 2);
			if(x < 0){
				if(y < 0){
					return create(this.nw.setBit(x+offset,y+offset), this.ne, this.sw, this.se);
				}else{
					return create(this.nw, this.ne, this.sw.setBit(x+offset,y-offset), this.se);
				}
			}else{
				if(y < 0){
					return create(this.nw, this.ne.setBit(x-offset,y+offset), this.sw, this.se);
				}else{
					return create(this.nw, this.ne, this.sw, this.se.setBit(x-offset,y-offset));
				}
			}
		},
		removeBit: function(x,y){
			if(this.level == 0){
				return create(false);
			}
			var offset = 1 << (this.level - 2);
			if(x < 0){
				if(y < 0){
					return create(this.nw.removeBit(x+offset,y+offset), this.ne, this.sw, this.se);
				}else{
					return create(this.nw, this.ne, this.sw.removeBit(x+offset,y-offset), this.se);
				}
			}else{
				if(y < 0){
					return create(this.nw, this.ne.removeBit(x-offset,y+offset), this.sw, this.se);
				}else{
					return create(this.nw, this.ne, this.sw, this.se.removeBit(x-offset,y-offset));
				}
			}
		},
		getBit:function(x,y){
			if(this.level == 0){
				return this.alive ? 1 : 0;
			}
			var offset = 1 << (this.level - 2);
			if(x < 0){
				if(y < 0){
					return this.nw.getBit(x+offset,y+offset);
				}else{
					return this.sw.getBit(x+offset,y-offset);
				}
			}else{
				if(y < 0){
					return this.ne.getBit(x-offset,y+offset);
				}else{
					return this.se.getBit(x-offset,y-offset);
				}
			}
		},
		canContain:function(x,y){
			var maxCoordinate = 1 << (this.level - 1);
			return -maxCoordinate <= x && x <= maxCoordinate-1 &&
             -maxCoordinate <= y && y <= maxCoordinate-1;
		},
		expandUniverse:function(){
			var border = emptyTree(this.level - 1);
			return create(
				create(border,border,border,this.nw),
				create(border,border,this.ne,border),
				create(border, this.sw,border,border),
				create(this.se,border,border,border)
				);
		},
		getCoordinates:function(x, y, returnXY){
			if(this.population == 0){return;}
			if(this.level == 0 && this.alive){
				returnXY(x,y);
				return;
			}
			if(this.level == 1){
				this.nw.getCoordinates(x - 1, y - 1, returnXY);
				this.ne.getCoordinates(x, y-1, returnXY);
				this.sw.getCoordinates(x - 1, y, returnXY);
				this.se.getCoordinates(x, y, returnXY);
				return;
			}
			var offset = 1 << (this.level - 2);
			this.nw.getCoordinates(x - offset, y - offset, returnXY);
			this.sw.getCoordinates(x - offset, y + offset, returnXY);
			this.ne.getCoordinates(x + offset, y - offset, returnXY);
			this.se.getCoordinates(x + offset, y + offset, returnXY);
		},
		slowSimulation:function(){
			var allBits = 0;
			for(var y=-2;y<2;y++){
				for(var x=-2;x<2;x++){
					allBits = (allBits << 1) + this.getBit(x, y) ;
				}
			}
			return create(oneGen(allBits>>5), oneGen(allBits>>4),
			              oneGen(allBits>>1), oneGen(allBits)) ;
		},
		centeredSubnode:function(){
			return create(this.nw.se, this.ne.sw, this.sw.ne, this.se.nw) ;
		},
		centeredHorizontal:function(w, e){
			return create(w.ne, e.nw, w.se, e.sw) ;
		},
		centeredVertical:function(n, s){
			return create(n.sw, n.se, s.nw, s.ne) ;
		},
		getCenter:function(){
			if(this.level - 1 <= timePerStepLog){
				return this.nextGeneration();
			}
			return this.centeredSubnode();
		},
		calculateNextGeneration:function(){
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

			return create(create(n00, n01, n10, n11).nextGeneration(),
			              create(n01, n02, n11, n12).nextGeneration(),
			              create(n10, n11, n20, n21).nextGeneration(),
			              create(n11, n12, n21, n22).nextGeneration()) ;
		},
		hashCode:function(){
			if(this.hashCache != null){return this.hashCache;}
			if(this.level == 0){return this.hashCache = 1 + this.population;}
			return this.hashCache = this.nw.hashCode() + 11 * this.ne.hashCode() + 101 * this.sw.hashCode() + 1007 * this.se.hashCode();
		},
		equals:function(other){
			if(this.level != other.level){
				return false;
			}
			if(this.level == 0){
				return this.alive == other.alive;
			}
			return this.nw == other.nw && this.ne == other.ne && this.sw == other.sw && this.se == other.se;
		},
		intern:function(){
			var hashMap = hashMapProvider.get();
			var canon = hashMap.get(this);
			if(canon){
				return canon;
			}
			hashMap.put(this);
			return this;
		},
		nextGeneration:function(){
			if(this.result == null){
				this.result = this.calculateNextGeneration();
			}
			return this.result;
		}
	};

	

	MemoizedTreeNode.create = function(){
		return emptyTree(3) ;
	};

	MemoizedTreeNode.setTimePerStepLog = setTimePerStepLog;

	window.MemoizedTreeNode = MemoizedTreeNode;
})();