define(["body"],function(body){
	return requireElement(document.getElementById("input").innerHTML, function(div, text, button){
			var open = false;

			var show = function(initialText){
				open = true;
				body.addClass("input-open");
				if(initialText){
					text.value = initialText;
				}
			};
			var hide = function(){
				open = false;
				body.removeClass("input-open");
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
			f.alert = function(text){
				f(function(){
				},text);
			};
			return f;
		});
})