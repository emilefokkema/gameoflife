define([],function(){
	
	var execute = function(scriptBody, argumentPairs, alive, errorCallback){
		var cleanedBody = scriptBody;
		argumentPairs = [{name:"alive",value:alive}]
			.concat(argumentPairs)
			.concat([{name:"window"},{name:"console"}]);

		var fBody = "return function("+argumentPairs.map(function(p){return p.name;})+"){"+cleanedBody+"}";
		var ff = new Function(fBody)();
		try{
			ff.apply(null, argumentPairs.map(function(p){return p.value;}));
		}catch(e){
			var error = {
				message:e.message
			};
			var lineNumberMatch = e.stack.match(/<anonymous>:(\d+):\d+/);
			if(lineNumberMatch){
				error.lineNumber = parseInt(lineNumberMatch[1]) - 1
			}
			errorCallback && errorCallback(error);
		}
		
	};
	var canBeExecuted = function(scriptBody, argumentNames){
		var success = true;
		var argumentPairs = argumentNames.map(function(n){
			return {
				name:n,
				value:true
			};
		});
		execute(scriptBody,argumentPairs,function(){}, function(){success = false;});
		return success;
	};
	return {
		canBeExecuted:canBeExecuted,
		execute:execute
	};
})