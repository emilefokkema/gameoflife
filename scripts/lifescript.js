define(["body","menu","script-editor"], function(body, menu, scriptEditor){

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
				});
            });
        });
    });
    
});