define(["requireElement"],function(requireElement){
	return requireElement("<a id=\"1\" class=\"step-count\"></a>", function(a){
		    document.body.appendChild(a);
		    return {
		    	set:function(t){
		    		a.innerHTML = t;
		    	}
		    };
		});
});