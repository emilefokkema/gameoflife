define(["body","tree/hashlife","evaluator","c","requireElement"],function(body, hashLife, evaluator, c, requireElement){
	var literalPattern = /^(?:|'[^']+(?:\\'[^']+)*'|"[^"]+(?:\\"[^"]+)*"|-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?|0x[0-9a-f]+|0b[01]+|true|false|null|undefined)$/i;
	var toLiteralString = function(a){
		if(typeof a === "string"){
			return "\""+a.replace(/"/g,"\\\"")+"\"";
		}
		return a.toString();
	};
	var getAlive = function(x,y){
		var error = false;
		return function(){
			if(error){return;}
			var xx,yy;
			if(arguments.length < 2){
				error = true;
				throw new Error("alive() requires two numbers");
			}
			xx = arguments[0];
			yy = arguments[1];
			if(typeof xx !== "number" || typeof yy !== "number"){
				error = true;
				throw new Error(toLiteralString(xx) + " and " + toLiteralString(yy) + " are not two numbers");
			}
			xx = Math.floor(xx);
			yy = Math.floor(yy);
			hashLife.add(x + xx, y + yy);
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
			for(var i=0;i<serialized.length;i++){
				serialized[i].value = eval(serialized[i].value);
			}
			onOk(serialized);
			close();
			onOk = function(){};
		});
		var runWithValues = function(x, y, script, namesAndValues, onError){
			var alive = getAlive(x,y);
			evaluator.execute(script.body, namesAndValues, alive, onError);
			c.drawAll();
		};
		var f = function(x, y, script, onError){
			if(script.signature.length == 0){
				runWithValues(x,y,script,[],onError);
				return;
			}
			show();
			argumentList = makeArgumentList();
			argumentList.display(script.signature);
			onOk = function(serialized){
				runWithValues(x, y, script, serialized, onError);
			};
		};
		f.isOpen = function(){return isOpen;};
		document.body.appendChild(div);
		return f;
	});
})