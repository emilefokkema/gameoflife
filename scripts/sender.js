define(function(){
	return function(){
		var todo= [];
		var f = function(){
			var args = arguments;
			todo.map(function(g){
				g.apply(null, args);
			});
		};
		f.add = function(g){todo.push(g);return f;};
		f.remove = function(g){
			var index;
			if((index = todo.indexOf(g))!=-1){
				todo.splice(index,1);
			}
		};
		return f;
	};
});