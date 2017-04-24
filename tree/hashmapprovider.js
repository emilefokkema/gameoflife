(function(){
	window.hashMapProvider = (function(){
		var map = null;
		var get = function(){
			if(!map){
				map = getHashMap();
			}
			return map;
		};
		var set = function(m){
			map = m;
		};
		return {
			get:get,
			set:set
		};
	})();
})();