(function(){
	var TreeNodeBase = function(){
		this.nw = null;
		this.ne = null;
		this.sw = null;
		this.se = null;
		this.level = 0;
		this.alive = false;
		this.population = 0;
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

	TreeNodeBase.prototype = {
		setBit: function(x,y){
			if(this.level == 0){
				return this.create(true);
			}
			var offset = 1 << (this.level - 2);
			if(x < 0){
				if(y < 0){
					return this.create(this.nw.setBit(x+offset,y+offset), this.ne, this.sw, this.se);
				}else{
					return this.create(this.nw, this.ne, this.sw.setBit(x+offset,y-offset), this.se);
				}
			}else{
				if(y < 0){
					return this.create(this.nw, this.ne.setBit(x-offset,y+offset), this.sw, this.se);
				}else{
					return this.create(this.nw, this.ne, this.sw, this.se.setBit(x-offset,y-offset));
				}
			}
		},
		removeBit: function(x,y){
			if(this.level == 0){
				return this.create(false);
			}
			var offset = 1 << (this.level - 2);
			if(x < 0){
				if(y < 0){
					return this.create(this.nw.removeBit(x+offset,y+offset), this.ne, this.sw, this.se);
				}else{
					return this.create(this.nw, this.ne, this.sw.removeBit(x+offset,y-offset), this.se);
				}
			}else{
				if(y < 0){
					return this.create(this.nw, this.ne.removeBit(x-offset,y+offset), this.sw, this.se);
				}else{
					return this.create(this.nw, this.ne, this.sw, this.se.removeBit(x-offset,y-offset));
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
		emptyTree: function(lev){
			if(lev <= 0){
				return this.create(false);
			}
			var n = this.emptyTree(lev - 1);
			return this.create(n, n, n, n);
		},
		create: function(){
			if(arguments.length == 4){
				return new TreeNode(arguments[0], arguments[1], arguments[2], arguments[3]);
			}
			return new TreeNode(arguments[0]);
		},
		expandUniverse:function(){
			var border = this.emptyTree(this.level - 1);
			return this.create(
				this.create(border,border,border,this.nw),
				this.create(border,border,this.ne,border),
				this.create(border, this.sw,border,border),
				this.create(this.se,border,border,border)
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
		}
	};
	TreeNodeBase.create = function(){
		return new TreeNode(false).emptyTree(3);
	};

	window.TreeNodeBase = TreeNodeBase;
})();

