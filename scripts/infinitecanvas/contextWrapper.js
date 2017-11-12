define(["infinitecanvas/transform"],function(transform){
	
	var wrapper = function(context, currentContextTransform){
		var absolute = false;
		var getRect = function(x,y,width,height){
			var transformedViewBox = currentContextTransform.getTransformedViewBox();
			var minusXInf = transformedViewBox.x;
			var plusXInf = transformedViewBox.x + transformedViewBox.width;
			var minusYInf = transformedViewBox.y;
			var plusYInf = transformedViewBox.y + transformedViewBox.height;
			if(x == Infinity){
				x = plusXInf;
			}
			if(x == -Infinity){
				x = minusXInf;
			}
			if(y == Infinity){
				x = plusYInf;
			}
			if(y == -Infinity){
				y = minusYInf;
			}
			if(width === Infinity){
				width = plusXInf - x;
			}
			if(width == -Infinity){
				width = minusXInf - x;
			}
			if(height === Infinity){
				height = plusYInf - y;
			}
			if(height == -Infinity){
				height = minusYInf - y;
			}
			return {
				x:x,
				y:y,
				width:width,
				height:height
			};
		};
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

		propertiesObj["getRelativeSize"] = {
			value:function(absoluteSize){
				var p0 = currentContextTransform.screenPositionToPoint(0,0);
				var p1 = currentContextTransform.screenPositionToPoint(absoluteSize, 0);
				return Math.abs(p1.x - p0.x);
			}
		};
		
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
				currentContextTransform.setTransform();
			}
		};
		propertiesObj["setTransform"] = {
			value:function(a,b,c,d,e,f){
				currentContextTransform.setCurrentTransform(new transform(a,b,c,d,e,f));
				currentContextTransform.setTransform();
			}
		};
		propertiesObj["rotate"] = {
			value:function(a){
				currentContextTransform.addToCurrentTransform(transform.rotation(a));
				currentContextTransform.setTransform();
			}
		};
		propertiesObj["transform"] = {
			value:function(a,b,c,d,e,f){
				currentContextTransform.addToCurrentTransform(new transform(a,b,c,d,e,f));
				currentContextTransform.setTransform();
			}
		};
		propertiesObj["scale"] = {
			value:function(x,y){
				currentContextTransform.addToCurrentTransform(transform.scale(x,y));
				currentContextTransform.setTransform();
			}
		};
		propertiesObj["translate"] = {
			value:function(x,y){
				currentContextTransform.addToCurrentTransform(transform.translation(x,y));
				currentContextTransform.setTransform();
			}
		};
		propertiesObj["rect"] = {
			value:function(x, y, width, height){
				var rect = getRect(x,y,width,height);
				context.beginPath();
				context.rect(rect.x, rect.y, rect.width, rect.height);
			}
		};
		propertiesObj["fillRect"] = {
			value:function(x, y, width, height){
				var rect = getRect(x,y,width,height);
				context.fillRect(rect.x, rect.y, rect.width, rect.height);
			}
		};
		propertiesObj["strokeRect"] = {
			value:function(x, y, width, height){
				var rect = getRect(x,y,width,height);
				context.beginPath();
				context.rect(rect.x,rect.y,rect.width,rect.height);
				context.closePath();
				context.stroke();
			}
		};
		propertiesObj["mapSet"] = {
			value:function(ps, mapper){
				ps.map(mapper, currentContextTransform.getViewBox);
			}
		};
		constr.prototype = Object.create({},propertiesObj);
		return new constr();
	};

	return wrapper;
});