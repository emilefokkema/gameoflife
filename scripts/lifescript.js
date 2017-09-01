define(["body"], function(body){
    return requireElement(document.getElementById("lifescript").innerHTML, function(div, text, button, signatureMount){
        var makeSignature = function(){
            return requireElement(document.getElementById("scriptSignature").innerHTML, function(container, makeArgument, makeArgumentDefinition, addButton){
                var addArgument = function(name){
                    makeArgument(function(container){
                        container.innerHTML = ", " + name;
                    });
                    makeArgumentDefinition(function(inputName, inputValue){
                        inputName.value = name;
                    });
                };
                addButton.addEventListener('click',function(){
                    addArgument("a");
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
});