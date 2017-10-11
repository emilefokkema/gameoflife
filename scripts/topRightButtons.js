define(["requireElement"],function(requireElement){
	var topRightButtons = requireElement(document.getElementById("topRightButtons").innerHTML, function(container, buttonDiv){
		var all = [];
		var add = function(className, f){
			buttonDiv(f, {className:className});
		};
		var attach = function(){
			document.body.appendChild(container);
		};
		return {
			add:add,
			attach:attach
		};
	});
	return topRightButtons;
});