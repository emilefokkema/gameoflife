define(["infinitecanvas/transform"],function(transform){
	var transformable = ["fillRect","arc", "rect", "moveTo", "arcTo", "lineTo","quadraticCurveTo","fillText"];
	var wrapper = function(context, currentContextTransform){
		var constr = function(){};
		var propertiesObj = {};
		for(var pp in context){
			(function(p){
				if(typeof context[p] !== "function"){
					propertiesObj[p] = {
						get:function(){return context[p];},
						set:function(v){context[p] = v;}
					};
				}else{
					propertiesObj[p] = {
						value:function(){
							return context[p].apply(context,arguments);
						}
					};
				}
			})(pp);
		}
		transformable.map(function(name){
			propertiesObj[name] = {
				value:function(){
					currentContextTransform.setTransform();
					var result = context[name].apply(context,arguments);
					currentContextTransform.resetTransform();
					return result;
				}
			};
		});
		propertiesObj["save"] = {
			value:function(){
				context.save();
				currentContextTransform.saveTransform();
			}
		};
		propertiesObj["restore"] = {
			value:function(){
				context.restore();
				currentContextTransform.restoreTransform();
			}
		};
		propertiesObj["setTransform"] = {
			value:function(a,b,c,d,e,f){
				currentContextTransform.setCurrentTransform(new transform(a,b,c,d,e,f));
			}
		};
		propertiesObj["rotate"] = {
			value:function(a){
				currentContextTransform.addToCurrentTransform(transform.rotation(a));
			}
		};
		propertiesObj["transform"] = {
			value:function(a,b,c,d,e,f){
				currentContextTransform.addToCurrentTransform(new transform(a,b,c,d,e,f));
			}
		};
		propertiesObj["scale"] = {
			value:function(x,y){
				currentContextTransform.addToCurrentTransform(transform.scale(x,y));
			}
		};
		propertiesObj["translate"] = {
			value:function(x,y){
				currentContextTransform.addToCurrentTransform(transform.translation(x,y));
			}
		};
		propertiesObj["strokeRect"] = {
			value:function(x, y, width, height){
				currentContextTransform.setTransform();
				context.beginPath();
				context.rect(x,y,width,height);
				context.closePath();
				currentContextTransform.resetTransform();
				context.stroke();
			}
		};
		propertiesObj["mapSet"] = {
			value:function(ps, mapper){
				ps.map(mapper, currentContextTransform.getViewBox);
			}
		};
		propertiesObj["makeHorizontalLine"] = {
			value:function(y){
				currentContextTransform.setTransform();
				var viewBox = currentContextTransform.getViewBox();
				context.beginPath();
				context.moveTo(viewBox.x,y);
				context.lineTo(viewBox.x + viewBox.width, y);
				currentContextTransform.resetTransform();
			}
		};
		propertiesObj["makeVerticalLine"] = {
			value:function(x){
				currentContextTransform.setTransform();
				var viewBox = currentContextTransform.getViewBox();
				context.beginPath();
				context.moveTo(x, viewBox.y);
				context.lineTo(x, viewBox.y + viewBox.height);
				currentContextTransform.resetTransform();
			}
		};
		propertiesObj["fillEntire"] = {
			value:function(){
				currentContextTransform.setTransform();
				var viewBox = currentContextTransform.getViewBox();
				context.fillRect(viewBox.x,viewBox.y,viewBox.width, viewBox.height);
				currentContextTransform.resetTransform();
			}
		};
		constr.prototype = Object.create({},propertiesObj);
		return new constr();
	};

	return wrapper;
});