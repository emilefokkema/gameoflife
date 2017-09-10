define(["body","menu"], function(body, menu){

    var lifeScript = requireElement(document.getElementById("lifescript").innerHTML, function(div, text, button, signatureMount){
        var makeSignature = function(){
            return requireElement(document.getElementById("scriptSignature").innerHTML, function(container, makeArgument, makeArgumentDefinition, addButton){
                var nameProvider = (function(){
                    var current = "a".charCodeAt(0);
                    return {
                        next:function(){return String.fromCharCode(current++);}
                    };
                })();
                var addArgument = function(name){
                    var ar = makeArgument(function(container){
                        return {
                            setName:function(n){
                                container.innerHTML = ", " + n;
                            }
                        };
                    });
                    ar.setName(name);
                    makeArgumentDefinition(function(inputName, inputValue){
                        inputName.value = name;
                        inputName.addEventListener('blur',function(){
                            ar.setName(inputName.value);
                        });
                    });
                };
                addButton.addEventListener('click',function(){
                    addArgument(nameProvider.next());
                });
                return {
                    addArgument:addArgument,
                    container:container
                };
            });
        };
        var open = false;
        var show = function(){
			open = true;
			body.addClass("lifescript-open");
	    };
        var onHide = function(){};
        var hide = function(){
			open = false;
			body.removeClass("lifescript-open");
		};
        document.body.appendChild(div);
        button.addEventListener('click',function(){
			hide();
            onHide();
            onHide = function(){};
		});
        hide();
        var makeNew = function(){
            show();
            var signature = makeSignature();
            signatureMount.appendChild(signature.container);
            return function(){
                signatureMount.removeChild(signature.container);
            };
        };
        return {
            makeNew:function(){
                onHide = makeNew();
            }
        };
    });
    menu.addMenu('scripts',function(addOption){
        addOption('new',function(){
            lifeScript.makeNew();
        });
    });
    return lifeScript;
});