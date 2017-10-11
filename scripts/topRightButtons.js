define(["requireElement"],function(requireElement){
	var topRightButtons = requireElement(document.getElementById("topRightButtons"), function(buttonDiv){
		var all = [];
		var add = function(className, f){
			buttonDiv(f, {className:className});
		};
		
		return {
			add:add
		};
	});
	return topRightButtons;
});