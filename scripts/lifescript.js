define(["body","menu"], function(body, menu){
    var validateScript = function(script){
        if(!script.title){
            alert("Please provide a title");
            return false;
        }
        for(var i=0;i<script.signature.length;i++){
            try{
                var v = new Function("window","'use strict';return eval("+script.signature[i].value+");").apply(null,[]);
                console.log(v);
            }catch(e){
                alert(e.message);
                return false;
            }
        }
        return true;
    };
    var lifeScript = requireElement(document.getElementById("lifescript").innerHTML, function(div, text, saveButton, signatureMount, title, closeButton){
        var signature;
        var makeSignature = function(){
            return requireElement(document.getElementById("scriptSignature").innerHTML, function(container, makeArgumentElement, makeArgumentDefinition, addButton){
                var fArguments = [];
                var nameProvider = (function(){
                    var current = "a".charCodeAt(0);
                    return {
                        next:function(){return String.fromCharCode(current++);}
                    };
                })();
                var makeArgument = function(name){
                    var ar = makeArgumentElement(function(container){
                        return {
                            setName:function(n){
                                container.innerHTML = ", " + n;
                            }
                        };
                    });
                    ar.setName(name);
                    var def = makeArgumentDefinition(function(inputName){
                        inputName.value = name;
                        inputName.addEventListener('blur',function(){
                            ar.setName(inputName.value);
                        });
                    });
                    return {
                        serialize:function(){
                            return name;
                        }
                    };
                };
                var addArgument = function(name){
                    fArguments.push(makeArgument(name));
                };
                var serialize = function(){
                    return fArguments.map(function(a){return a.serialize();});
                };
                addButton.addEventListener('click',function(){
                    addArgument(nameProvider.next());
                });
                var deserialize = function(obj){
                    obj.map(function(name){
                        addArgument(name);
                    });
                };
                return {
                    addArgument:addArgument,
                    container:container,
                    serialize:serialize,
                    deserialize:deserialize
                };
            });
        };
        var isOpen = false;
        var show = function(){
			isOpen = true;
			body.addClass("lifescript-open");
	    };
        var onHide = function(){};
        var onSave = function(){};
        var hide = function(){
			isOpen = false;
			body.removeClass("lifescript-open");
            onHide();
            onHide = function(){};
		};
        document.body.appendChild(div);
        saveButton.addEventListener('click',function(){
            var script = {
                title:title.value,
                signature:signature.serialize(),
                body: text.value
            };
            if(!validateScript(script)){
                return;
            }
            onSave(script);
            onSave = function(){};
            hide();
		});

        closeButton.addEventListener('click',function(){
            hide();
        });
        hide();
        var displayScript = function(s){
            title.value = s.title;
            signature.deserialize(s.signature);
            text.value = s.body;
        };
        var open = function(s){
            show();
            signature = makeSignature();
            signatureMount.appendChild(signature.container);
            onHide = function(){
                signatureMount.removeChild(signature.container);
                signature = null;
                title.value = "";
                text.value = "";
            };
            s && displayScript(s);
            return {
                onSave:function(f){
                    onSave = f;
                }
            };
        };
        return {
            open:open,
            isOpen:function(){return isOpen;}
        };
    });
    
    menu.addMenu('scripts',function(addOption, addMenu){
        addOption('new',function(){
            var newOne = lifeScript.open();
            newOne.onSave(function(obj){
								addMenu(obj.title, function(_addOption){
									_addOption('edit',function(){
										 	var opened = lifeScript.open(obj);
                    	opened.onSave(function(_obj){
                        obj = _obj;
                    	});
									});
								});
            });
        });
    });
    return lifeScript;
});