define([],function(){
	var body = document.body;
	var getOldClassNames = function(){
		var oldName = body.getAttribute('class') || "";
		return oldName.match(/[^\s]+/g) || [];
	};
	var addClass = function(className){
		
		body.setAttribute('class', getOldClassNames().filter(function(n){return n != className;}).concat([className]).join(" "));
	};
	var removeClass = function(className){
		
		body.setAttribute('class', getOldClassNames().filter(function(n){return n != className;}).join(" "));
	};
	return {
		addClass:addClass,
		removeClass:removeClass
	};
});