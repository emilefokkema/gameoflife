define(["body"], function(body){
    return requireElement(document.getElementById("lifescript").innerHTML, function(div, text, button, signaturePart){
        var open = false;
        var show = function(){
			open = true;
			body.addClass("lifescript-open");
	    };
        var hide = function(){
			open = false;
			body.removeClass("lifescript-open");
		};
        document.body.appendChild(div);
        button.addEventListener('click',function(){
			hide();
		});
        hide();
        var makeNew = function(){
            show();
        };
        signaturePart();
        return {
            makeNew:makeNew
        };
    });
});