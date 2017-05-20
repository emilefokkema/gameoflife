define([], function(){
	return function(){
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
				for(var i=0;i<entry.length;i++){
					if(entry[i].equals(o)){return;}
				}
				entry.push(o);
			}
		};

		var health = function(){
			var totalEntries = 0;
			var hashes = 0;
			var entriesWithResult = 0;
			for(p in all){
				if(all.hasOwnProperty(p)){
					hashes++;
					totalEntries += all[p].length;
					entriesWithResult += all[p].filter(function(n){return n.result != null;}).length;
				}
			}
			return {
				totalEntries:totalEntries,
				hashesRatio: Math.floor(100 * hashes / totalEntries) + "%",
				resultRatio: Math.floor(100 * entriesWithResult / totalEntries) + "%"
			};
		};

		var all = function(f){
			for(var p in all){
				if(all.hasOwnProperty(p)){
					all[p].map(function(x){f(x);});
				}
			}
		};
		return {
			get:get,
			put:put,
			health:health,
			all:all
		};
	};
});