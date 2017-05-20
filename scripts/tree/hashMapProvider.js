define(["tree/getHashMap"], function(getHashMap){
	var provider = function(maker){
		var thing = null;
		var get = function(){
			if(!thing){
				thing = maker();
			}
			return thing;
		};
		var set = function(t){
			thing = t;
		};
		return {
			get:get,
			set:set
		};
	};

	return provider(getHashMap);
});