define(["body","position","evaluator","c"],function(body, position, evaluator, c){
	var literalPattern = /^(?:|'[^']+(?:\\'[^']+)*'|"[^"]+(?:\\"[^"]+)*"|-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?|0x[0-9a-f]+|0b[01]+|true|false|null|undefined)$/i;
	var getAlive = function(x,y){
		var error = false;
		return function(){
			if(error){return;}
			var xx,yy;
			if(arguments.length < 2){
				error = true;
				alert("alive() requires two numbers");
				return;
			}
			if(typeof (xx = arguments[0]) !== "number" || typeof (yy = arguments[1]) !== "number"){
				error = true;
				alert(xx + " and " + yy + "are not two numbers");
				return;
			}
			xx = Math.floor(xx);
			yy = Math.floor(yy);
			position.add(x + xx, y + yy);
		};
	};
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
		var validate = function(serialized){
			for(var i=0;i<serialized.length;i++){
				if(!serialized[i].value.match(literalPattern)){
					alert("please provide either a number, a string, a boolean, null, undefined or nothing at all");
					return false;
				}
			}
			return true;
		};
		var onOk = function(){};
		okButton.addEventListener('click',function(){
			var serialized = argumentList.serialize();
			if(!validate(serialized)){
				return;
			}
			onOk(serialized);
			close();
			onOk = function(){};
		});
		var f = function(x, y, script){
			show();
			argumentList = makeArgumentList();
			argumentList.display(script.signature);
			onOk = function(serialized){
				for(var i=0;i<serialized.length;i++){
					serialized[i].value = eval(serialized[i].value);
				}
				var alive = getAlive(x,y);
				evaluator.execute(script.body, serialized, alive);
				c.drawAll();
			};
		};
		f.isOpen = function(){return isOpen;};
		document.body.appendChild(div);
		return f;
	});
})