define(["coordinates"],function(coordinates){
	var menu = requireElement(document.getElementById("menu").innerHTML, function(div, optionDiv){
		var currentX, currentY,open = false;
		document.body.appendChild(div);
		var addOption = function(text, f){
			return optionDiv(function(option){
				var removed = false;
				var remove = function(){
					if(!removed){
						div.removeChild(option);
						removed = true;
					}
				};
				option.addEventListener('click', function(){
					hide();
					f(currentX, currentY, remove);
				});
				return remove;
			},{text:text});
		};
		var show = function(x,y){
			var loc = coordinates.mousePositionToPositionLocation(x,y);
			currentX = loc.x;
			currentY = loc.y;
			div.style.display = "initial";
			div.style.left = x + "px";
			div.style.top = y + "px";
			open = true;
		};
		var hide = function(){
			div.style.display = "none";
			open = false;
		};
		return {
			addOption:addOption,
			show:show,
			hide:hide,
			isOpen:function(){return open;}
		}
	});
	return menu;
})