define(["body","menu","script-editor","run-script"], function(body, menu, scriptEditor, runScript){
    var createScript;
    var allScripts = [];
    var saveAll = function(){
        var all = allScripts.map(function(s){return s.get();});
        localStorage.setItem("lifescripts",JSON.stringify(all));
    };
    var makeScript = function(obj){
        var s = {
            replaceWith:function(_obj){
                obj = _obj;
                saveAll();
            },
            get:function(){return obj;}
        };
        allScripts.push(s);
        saveAll();
        return s;
    };
    var removeScript = function(s){
        allScripts.splice(allScripts.indexOf(s),1);
        saveAll();
    };
    menu.addMenu('scripts',function(addOption, addMenu){
        createScript = function(obj){
            var script = makeScript(obj);
            var subMenu = addMenu(obj.title, function(_addOption){
                _addOption('edit',function(){
                    var opened = scriptEditor.open(script.get());
                    opened.onSave(function(_obj){
                        script.replaceWith(_obj);
                        subMenu.setTitle(_obj.title);
                    });
                });
                _addOption('run',function(x, y){
                    runScript(x, y, script.get());
                });
                _addOption('remove',function(){
                    removeScript(script);
                    subMenu.remove();
                });
            });
        };
        addOption('new',function(){
            var newOne = scriptEditor.open();
            newOne.onSave(createScript);
        });
    });
    var present = localStorage["lifescripts"];
    if(present){
        present = JSON.parse(present);
        for(var i=0;i<present.length;i++){
            createScript(present[i]);
        }
    }
});