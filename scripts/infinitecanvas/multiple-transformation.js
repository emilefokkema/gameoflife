define(["infinitecanvas/transform"],function(transform){
	var mt = function(specs, currentContextTransform){
		this.specs = specs;
		this.currentContextTransform = currentContextTransform;
		this.transformableContext = {
			transform:function(a,b,c,d,e,f){
				currentContextTransform.addToCurrentTransform(new transform(a,b,c,d,e,f));
			},
			setTransform:function(a,b,c,d,e,f){
				currentContextTransform.setCurrentTransform(new transform(a,b,c,d,e,f));
			},
			rotate:function(a){
				currentContextTransform.addToCurrentTransform(transform.rotation(a));
			},
			scale:function(x,y){
				currentContextTransform.addToCurrentTransform(transform.scale(x,y));
			},
			translate:function(x,y){
				currentContextTransform.addToCurrentTransform(transform.translation(x,y));
			}
		};
	};
	mt.prototype.each = function(f){
		var viewBox = this.currentContextTransform.getViewBox();
		var minIndex = this.specs.minIndex(viewBox);
		var maxIndex = this.specs.maxIndex(viewBox);
		

		for(var i = minIndex; i<=maxIndex; i++){
			this.currentContextTransform.saveTransform();
			this.specs.transform(i, this.transformableContext);
			f();
			this.currentContextTransform.restoreTransform();
		}
	};
	return mt;
})