define(["transform"],function(transform){
	var transformable = ["fillRect","arc", "rect", "moveTo", "arcTo", "lineTo","quadraticCurveTo","fillText"];
	var wrapper = function(context, getViewBox, setTransform, resetTransform, setCurrentTransform, addToCurrentTransform, saveTransform, restoreTransform){
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
					setTransform();
					var result = context[name].apply(context,arguments);
					resetTransform();
					return result;
				}
			};
		});
		propertiesObj["save"] = {
			value:function(){
				context.save();
				saveTransform();
			}
		};
		propertiesObj["restore"] = {
			value:function(){
				context.restore();
				restoreTransform();
			}
		};
		propertiesObj["setTransform"] = {
			value:function(a,b,c,d,e,f){
				setCurrentTransform(new transform(a,b,c,d,e,f));
			}
		};
		propertiesObj["rotate"] = {
			value:function(a){
				addToCurrentTransform(transform.rotation(a));
			}
		};
		propertiesObj["transform"] = {
			value:function(a,b,c,d,e,f){
				addToCurrentTransform(new transform(a,b,c,d,e,f));
			}
		};
		propertiesObj["scale"] = {
			value:function(x,y){
				addToCurrentTransform(new transform(x,0,0,y,0,0));
			}
		};
		propertiesObj["translate"] = {
			value:function(x,y){
				addToCurrentTransform(new transform(1,0,0,1,x,y));
			}
		};
		propertiesObj["strokeRect"] = {
			value:function(x, y, width, height){
				setTransform();
				context.beginPath();
				context.rect(x,y,width,height);
				context.closePath();
				resetTransform();
				context.stroke();
			}
		};
		propertiesObj["mapSet"] = {
			value:function(ps, mapper){
				ps.map(mapper, getViewBox);
			}
		};
		propertiesObj["makeHorizontalLine"] = {
			value:function(y){
				setTransform();
				var viewBox = getViewBox();
				context.beginPath();
				context.moveTo(viewBox.x,y);
				context.lineTo(viewBox.x + viewBox.width, y);
				resetTransform();
			}
		};
		propertiesObj["makeVerticalLine"] = {
			value:function(x){
				setTransform();
				var viewBox = getViewBox();
				context.beginPath();
				context.moveTo(x, viewBox.y);
				context.lineTo(x, viewBox.y + viewBox.height);
				resetTransform();
			}
		};
		propertiesObj["fillEntire"] = {
			value:function(){
				setTransform();
				var viewBox = getViewBox();
				context.fillRect(viewBox.x,viewBox.y,viewBox.width, viewBox.height);
				resetTransform();
			}
		};
		constr.prototype = Object.create({},propertiesObj);
		return new constr();
	};

	return wrapper;
});