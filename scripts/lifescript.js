define(["body","menu","script-editor","run-script"], function(body, menu, scriptEditor, runScript){
    var createScript;
    var allScripts = [];
    var saveAll = function(){
        var all = allScripts.map(function(s){return s.get();});
        localStorage.setItem("lifescripts",JSON.stringify(all));
    };
    var makeScript = function(obj, getSubMenu){
        var s = {
            get:function(){return obj;},
            edit:function(){
                var opened = scriptEditor.open(obj);
                opened.onSave(function(_obj){
                    obj = _obj;
                    getSubMenu().setTitle(_obj.title);
                    saveAll();
                });
                return opened;
            },
            remove:function(){
                allScripts.splice(allScripts.indexOf(s),1);
                getSubMenu().remove();
                saveAll();
            },
            run:function(x,y){
                runScript(x, y, obj, function(e){
                    var opened = s.edit();
                    opened.addError(e);
                    // setTimeout(function(){
                    //     alert(e.message + (e.lineNumber ? " (at line "+e.lineNumber+")":""));
                    // },1);
                });
            }
        };
        allScripts.push(s);
        saveAll();
        return s;
    };
   
    menu.addMenu('scripts',function(addOption, addMenu){
        createScript = function(obj){
            var subMenu;
            var script = makeScript(obj, function(){return subMenu;});
            subMenu = addMenu(obj.title, function(_addOption){
                _addOption('edit',function(){
                    script.edit();
                });
                _addOption('run',function(x, y){
                    script.run(x,y);
                });
                _addOption('remove',function(){
                   script.remove();
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