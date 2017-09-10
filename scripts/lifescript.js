define(["body","menu"], function(body, menu){

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
                    var def = makeArgumentDefinition(function(inputName, inputValue){
                        inputName.value = name;
                        inputName.addEventListener('blur',function(){
                            ar.setName(inputName.value);
                        });
                        return {
                            serialize:function(){
                                return {
                                    name:inputName.value,
                                    value:inputValue.value
                                };
                            }
                        };
                    });
                    return {
                        serialize:function(){
                            return def.serialize();
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
                return {
                    addArgument:addArgument,
                    container:container,
                    serialize:serialize
                };
            });
        };
        var open = false;
        var show = function(){
			open = true;
			body.addClass("lifescript-open");
	    };
        var onHide = function(){};
        var onSave = function(){};
        var hide = function(){
			open = false;
			body.removeClass("lifescript-open");
            onHide();
            onHide = function(){};
		};
        document.body.appendChild(div);
        saveButton.addEventListener('click',function(){
            onSave({
                title:title.value,
                signature:signature.serialize(),
                body: text.value
            });
            onSave = function(){};
            hide();
		});
        closeButton.addEventListener('click',function(){
            hide();
        });
        hide();
        var open = function(){
            show();
            signature = makeSignature();
            signatureMount.appendChild(signature.container);
            onHide = function(){
                signatureMount.removeChild(signature.container);
                signature = null;
                title.value = "";
                text.value = "";
            };
            return {
                onSave:function(f){
                    onSave = f;
                }
            };
        };
        return {
            open:open
        };
    });
    menu.addMenu('scripts',function(addOption){
        addOption('new',function(){
            var newOne = lifeScript.open();
            newOne.onSave(function(obj){
                console.log(obj);
            });
        });
    });
    return lifeScript;
});