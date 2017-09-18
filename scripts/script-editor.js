define(["body","menu","evaluator","codemirror/lib/codemirror","codemirror/mode/javascript/javascript"], function(body, menu, evaluator, CodeMirror){
    var validateScript = function(script, errorCallback){
        if(!script.title){
            alert("Please provide a title");
            return false;
        }
        if(!script.body){
            alert("please provide a body");
            return false;
        }
        if(!evaluator.canBeExecuted(script.body, script.signature, errorCallback)){
            return false;
        }
        return true;
    };
    var scriptEditor = requireElement(document.getElementById("scriptEditor").innerHTML, function(div, text, saveButton, makeSignatureElement, title, closeButton){
        var editor = CodeMirror.fromTextArea(text, {
            lineNumbers: true,
            mode: "javascript"
        });
        var signature;
        var makeSignature = function(){
            return makeSignatureElement(function(makeArgumentElement, makeArgumentDefinition, addButton){
                var remove = this.remove;
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
                            name = inputName.value;
                            ar.setName(name);
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
                    serialize:serialize,
                    deserialize:deserialize,
                    remove:remove
                };
            });
        };
        var isOpen = false;
        var show = function(){
			isOpen = true;
			body.addClass("lifescript-open");
            editor.doc.cm.refresh();
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
                body: editor.doc.getValue()
            };
            if(!validateScript(script, addError)){
                return;
            }
            onSave(script);
            onSave = function(){};
            hide();
		});
        var addError = function(e){
            if(e.lineNumber){
                editor.doc.addLineClass(e.lineNumber - 1, "text", "error");
            }
        };

        closeButton.addEventListener('click',function(){
            hide();
        });
        hide();
        var displayScript = function(s){
            title.value = s.title;
            signature.deserialize(s.signature);
            editor.doc.setValue(s.body);
        };
        var open = function(s){
            show();
            signature = makeSignature();
            onHide = function(){
                signature.remove();
                signature = null;
                title.value = "";
                editor.doc.setValue("");
            };
            s && displayScript(s);
            return {
                onSave:function(f){
                    onSave = f;
                },
                addError:addError
            };
        };
        return {
            open:open,
            isOpen:function(){return isOpen;}
        };
    });
    
   
    return scriptEditor;
});