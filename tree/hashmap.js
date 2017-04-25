(function(){
	window.getHashMap = function(){
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
		var memoizedRatio = function(){
			var n = 0;
			var r = 0;
			for(p in all){
				if(all.hasOwnProperty(p)){
					n += all[p].length;
					r += all[p].filter(function(n){return n.result != null;}).length;
				}
			}
			return r/n;
		};
		return {
			get:get,
			put:put,
			memoizedRatio:memoizedRatio
		};
	};
})();