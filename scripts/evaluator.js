define([],function(){
	var execute = function(scriptBody, argumentPairs, alive){
		var cleanedBody = scriptBody;
		argumentPairs = [{name:"alive",value:alive}]
			.concat(argumentPairs)
			.concat([{name:"window"},{name:"console"}]);

		var fBody = "return function("+argumentPairs.map(function(p){return p.name;})+"){"+cleanedBody+"}";
		var ff = new Function("",fBody)();
		ff.apply(null, argumentPairs.map(function(p){return p.value;}));
	};
	var canBeExecuted = function(scriptBody, argumentNames){
		try{
			var argumentPairs = argumentNames.map(function(n){
				return {
					name:n,
					value:true
				};
			});
			execute(scriptBody,argumentPairs,function(){});
		}catch(e){
			alert(e.message);
			return false;
		}
		return true;
	};
	return {
		canBeExecuted:canBeExecuted,
		execute:execute
	};
})