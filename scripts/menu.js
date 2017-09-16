define(["coordinates","sender"],function(coordinates, sender){
	var currentX, currentY;
	var setCell = function(x, y){
		var loc = coordinates.mousePositionToPositionLocation(x,y);
		currentX = loc.x;
		currentY = loc.y;
	};
	var menuFactory = function(){
		return requireElement(document.getElementById("menu").innerHTML, function(div, optionDiv, subMenuDiv){
			var onOpen, onHide = sender(), onChoose = sender(), open = false;
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
						onChoose();
						f(currentX, currentY, remove);
					});
					return remove;
				},{text:text});
			};
			var addMenu = function(title, constr){
				return subMenuDiv(function(option){
					var remove = this.remove;
					var setTitle = function(t){option.innerHTML = t;};
					var subMenu = menuFactory();
					option.addEventListener('click',function(){
						if(!subMenu.isOpen()){
							var rect = option.getBoundingClientRect();
							var x = rect.left + rect.width;
							var y = rect.top;
							subMenu.show(x, y);
						}else{
							subMenu.hide();
						}
					});
					subMenu.onChoose(function(){
						subMenu.hide();
						onChoose();
					});
					onHide.add(function(){
						subMenu.hide();
					});
					constr.apply(null,[subMenu.addOption, subMenu.addMenu]);
					return {
						remove:remove,
						setTitle:setTitle
					};
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
				onHide();
			};
			return {
				addOption:addOption,
				show:show,
				hide:hide,
				isOpen:function(){return open;},
				onOpen:function(f){
					onOpen = f;
				},
				onChoose: function(f){
					onChoose.add(f);
				},
				onHide:function(f){
					onHide.add(f);
				},
				addMenu:addMenu
			}
		});
	};
	var mainMenu = menuFactory();
	mainMenu.onOpen(setCell);
	mainMenu.onChoose(function(){
		mainMenu.hide();
	});
	return mainMenu;
})