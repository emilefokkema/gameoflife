define([],function(){
	var interpolation = function(y0, x1, c){
		var a = y0 / (1 - Math.exp(-c*x1)), b = y0 - a;
		return function(x){
			return a * Math.exp(-c*x) + b;
		};
	};

	return requireElement("<input id=\"1\" type=\"range\" class=\"speed-range\"/>", function(range){
		var getLength = interpolation(1000,100,0.05);
		document.body.appendChild(range);
		var onInput = function(){};
		range.addEventListener('input',function(){
			var newLength = getLength(range.value);
			onInput(Math.max(1, newLength)); 
		});
		return {
			onInput:function(f){onInput = f;}
		};
	});
});