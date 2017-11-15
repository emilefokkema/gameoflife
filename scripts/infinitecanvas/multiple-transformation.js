define(["infinitecanvas/transform"],function(transform){
	var mt = function(specs, currentContextTransform){
		this.specs = specs;
		this.currentContextTransform = currentContextTransform;
		this.transformableContext = {
			transform:function(a,b,c,d,e,f){
				currentContextTransform.addToCurrentTransform(new transform(a,b,c,d,e,f));
				currentContextTransform.setTransform();
			},
			setTransform:function(a,b,c,d,e,f){
				currentContextTransform.setCurrentTransform(new transform(a,b,c,d,e,f));
				currentContextTransform.setTransform();
			},
			rotate:function(a){
				currentContextTransform.addToCurrentTransform(transform.rotation(a));
				currentContextTransform.setTransform();
			},
			scale:function(x,y){
				currentContextTransform.addToCurrentTransform(transform.scale(x,y));
				currentContextTransform.setTransform();
			},
			translate:function(x,y){
				currentContextTransform.addToCurrentTransform(transform.translation(x,y));
				currentContextTransform.setTransform();
			}
		};
	};
	mt.prototype.each = function(f){
		var viewBox = this.currentContextTransform.getViewBox();
		var minIndex = this.specs.minIndex(viewBox);
		var maxIndex = this.specs.maxIndex(viewBox);
		

		for(var i = minIndex; i<=maxIndex; i++){
			this.specs.transform(i, this.transformableContext);
			f();
			this.transformableContext.setTransform(1,0,0,1,0,0);
		}
	};
	return mt;
})