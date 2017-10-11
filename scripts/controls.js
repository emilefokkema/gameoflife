define(["animation","tree/hashlife","snapshots","requireElement"],function(animation,hashLife,snapshots,requireElement){
	return requireElement(document.getElementById("controls").innerHTML, function(container, buttonDiv){
			document.body.appendChild(container);
			var addButton = function(className, action){
				buttonDiv(function(div){
					div.addEventListener('click',function(){
						action(function(newClassName){
							if(newClassName){
								div.setAttribute('class','button fa '+newClassName);
							}
						});
					});
				},{className:className});
			};
			addButton("fa-play",function(setNewClassName){
				if(animation.isGoing()){
					animation.stop();
					setNewClassName("fa-play");
				}else{
					animation.go();
					setNewClassName("fa-pause");
				}
			});
			addButton("fa-eraser",function(){
				animation.reset();
			});
			addButton("fa-step-forward",function(){
				animation.doStep();
			});
			addButton("fa-clipboard",function(){
				snapshots.add(hashLife.getAllAlive());
			});
		});
});