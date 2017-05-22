define(["body","position","topRightButtons"],function(body, position, topRightButtons){
	return requireElement(document.getElementById("settings").innerHTML, function(div, number, closeButton){
			var open = false;

			number.value = 0;
			number.addEventListener('blur',function(){
				number.value = Math.floor(number.value);
				number.value = Math.max(0,number.value);
			});
			
			
			closeButton.addEventListener('click',function(){
				position.setTimePerStepLog(number.value);
				hide();
			});
			
			var show = function(initialText){
				open = true;
				body.addClass('settings-open');
			};
			var hide = function(){
				open = false;
				body.removeClass('settings-open');
			};
			document.body.appendChild(div);
			hide();
			topRightButtons.add("settings-button fa fa-gear",function(button){
					button.addEventListener('click',function(){
						show();
					});
			});
		});
})