define(["body"],function(body){
	return requireElement(document.getElementById("runScript").innerHTML,function(div, okButton, makeArgumentListElement){
		var argumentList, isOpen = false;
		var makeArgumentList = function(){
			return makeArgumentListElement(function(makeArgumentElement){
				var remove = this.remove, args = [];
				var addArg = function(name){
					args.push(makeArgumentElement(function(input){
						return {
							serialize:function(){
								return {name:name,value:input.value};
							}
						};
					},{name:name}));
				};
				var display = function(signature){
					for(var i=0;i<signature.length;i++){
						addArg(signature[i]);
					}
				};
				return {
					remove:remove,
					display:display,
					serialize:function(){return args.map(function(a){return a.serialize();});}
				};
			});
		};
		var show = function(){
			isOpen = true;
			body.addClass("run-script-open");
		};
		var close = function(){
			isOpen = false;
			body.removeClass("run-script-open");
			argumentList.remove();
			argumentList = null;
		};
		var onOk = function(){};
		okButton.addEventListener('click',function(){
			onOk();
			close();
			onOk = function(){};
		});
		var f = function(script){
			show();
			argumentList = makeArgumentList();
			argumentList.display(script.signature);
			onOk = function(){
				console.log(argumentList.serialize());
			};
		};
		f.isOpen = function(){return isOpen;};
		document.body.appendChild(div);
		return f;
	});
})