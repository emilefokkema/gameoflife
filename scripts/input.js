define([],function(){
	return requireElement(document.getElementById("input").innerHTML, function(div, text, button){
			var open = false;

			var show = function(initialText){
				open = true;
				div.style.display = 'initial';
				if(initialText){
					text.value = initialText;
				}
			};
			var hide = function(){
				open = false;
				div.style.display = 'none';
			};
			var handler = function(v){};
			document.body.appendChild(div);
			button.addEventListener('click',function(){
				handler(text.value);
				text.value = '';
			});
			hide();
			var f = function(resultHandler, initialText){
				show(initialText);
				handler = function(v){
					hide();
					resultHandler(v);
				};
			};
			f.isOpen = function(){return open;};
			return f;
		});
})