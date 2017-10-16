define([],function(){
	var transformable = ["fillRect","arc"];
	var wrapper = function(context, getViewBox, setTransform, resetTransform){
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
					context[name].apply(context,arguments);
					resetTransform();
				}
			};
		});
		propertiesObj["strokeRect"] = {
			value:function(x, y, width, height){
				setTransform();
				context.beginPath();
				context.moveTo(x,y);
				context.lineTo(x+width,y);
				context.lineTo(x+width,y+height);
				context.lineTo(x,y+height);
				context.closePath();
				resetTransform();
				context.stroke();
			}
		};
		propertiesObj["mapPointSet"] = {
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
		constr.prototype = Object.create({},propertiesObj);
		return new constr();
	};

	return wrapper;
});