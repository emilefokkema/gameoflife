define(["coordinates"],function(coordinates){
	var currentX, currentY;
	var setCell = function(x, y){
		var loc = coordinates.mousePositionToPositionLocation(x,y);
		currentX = loc.x;
		currentY = loc.y;
	};
	var menuFactory = function(){
		return requireElement(document.getElementById("menu").innerHTML, function(div, optionDiv, subMenuDiv){
			var currentX, currentY,onOpen, open = false;
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
			var addMenu = function(title, constr){
				return subMenuDiv(function(){
					
				},{text:title});
			};
			var show = function(x,y){
				onOpen && onOpen(x,y);
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
				isOpen:function(){return open;},
				onOpen:function(f){
					onOpen = f;
				}
			}
		});
	};
	var mainMenu = menuFactory();
	mainMenu.onOpen(setCell);
	return mainMenu;
})