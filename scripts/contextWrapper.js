define([],function(){
	var wrapper = function(context, positionToMousePosition, getViewBox, w, h){
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
		propertiesObj["strokeRect"] = {
			value:function(x, y, width, height){
				var mouseP1 = positionToMousePosition({x:x,y:y});
				var mouseP2 = positionToMousePosition({x:x+width,y:y+height});
				context.strokeRect(mouseP1.x, mouseP1.y, mouseP2.x - mouseP1.x, mouseP2.y - mouseP1.y);
			}
		};
		propertiesObj["fillRect"] = {
			value:function(x, y, width, height){
				var mouseP1 = positionToMousePosition({x:x,y:y});
				var mouseP2 = positionToMousePosition({x:x+width,y:y+height});
				context.fillRect(mouseP1.x, mouseP1.y, mouseP2.x - mouseP1.x, mouseP2.y - mouseP1.y);
			}
		};
		propertiesObj["arc"] = {
			value:function(x, y, radius, startAngle, endAngle, anticlockwise){
				var mouseP = positionToMousePosition({x:x,y:y});
				var mouseR = positionToMousePosition({x:radius,y:0}).x - positionToMousePosition({x:0,y:0}).x;
				context.arc(mouseP.x, mouseP.y, mouseR, startAngle, endAngle, anticlockwise);
			}
		};
		propertiesObj["mapPointSet"] = {
			value:function(ps, mapper){
				ps.map(mapper, getViewBox);
			}
		};
		propertiesObj["makeHorizontalLine"] = {
			value:function(y){
				var screenPoint = positionToMousePosition({x:0,y:y});
				context.beginPath();
				context.moveTo(0,screenPoint.y);
				context.lineTo(w,screenPoint.y);
			}
		};
		propertiesObj["makeVerticalLine"] = {
			value:function(x){
				var screenPoint = positionToMousePosition({x:x,y:0});
				context.beginPath();
				context.moveTo(screenPoint.x,0);
				context.lineTo(screenPoint.x,h);
			}
		};
		constr.prototype = Object.create({},propertiesObj);
		return new constr();
	};

	return wrapper;
});