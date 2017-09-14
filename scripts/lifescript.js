define(["body","menu","script-editor","run-script"], function(body, menu, scriptEditor, runScript){

    menu.addMenu('scripts',function(addOption, addMenu){
        addOption('new',function(){
            var newOne = scriptEditor.open();
            newOne.onSave(function(obj){
				addMenu(obj.title, function(_addOption){
					_addOption('edit',function(){
					 	var opened = scriptEditor.open(obj);
                    	opened.onSave(function(_obj){
                            obj = _obj;
                    	});
					});
                    _addOption('run',function(x, y){
                        runScript(x, y, obj);
                    });
				});
            });
        });
    });
    
});