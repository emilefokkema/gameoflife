(function(){
	var hashMap = (function(){
		var all = {};

		var get = function(o){
			var hashCode = o.hashCode();
			if(all.hasOwnProperty(hashCode)){
				var entry = all[hashCode];
				for(var i=0;i<entry.length;i++){
					var found;
					if( (found = entry[i]).equals(o) ){return found;}
				}
			}
		};
		var put = function(o){
			var hashCode = o.hashCode();
			var entry = all[hashCode];
			if(!entry){
				entry = [o];
				all[hashCode] = entry;
			}else{
				entry.push(o);
			}
		};
		return {
			get:get,
			put:put
		};
	})();

	var CanonicalTreeNode = function(){
		TreeNode.apply(this, arguments);
	};

	CanonicalTreeNode.prototype = Object.create(TreeNode.prototype, {
		hashCode:{
			value:function(){
				if(this.level == 0){return 1 + this.population;}
				return this.nw.hashCode() + 11 * this.ne.hashCode() + 101 * this.sw.hashCode() + 1007 * this.se.hashCode();
			}
		},
		equals:{
			value:function(other){
				if(this.level != other.level){
					return false;
				}
				if(this.level == 0){
					return this.alive == other.alive;
				}
				return this.nw == other.nw && this.ne == other.ne && this.sw == other.sw && this.se == other.se;
			}
		},
		intern:{
			value:function(){
				var canon = hashMap.get(this);
				if(canon){
					return canon;
				}
				hashMap.put(this);
				return this;
			}
		},
		create:{
			value:function(){
				if(arguments.length == 4){
					return new CanonicalTreeNode(arguments[0], arguments[1], arguments[2], arguments[3]).intern();
				}
				return new CanonicalTreeNode(arguments[0]).intern();
			}
		}
	});

	CanonicalTreeNode.create = function(){
		return new CanonicalTreeNode(false).emptyTree(3) ;
	};

	window.CanonicalTreeNode = CanonicalTreeNode;
})();