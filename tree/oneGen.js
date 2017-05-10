(function(){
	window.oneGen = function(bitMask, create){
		if(bitMask == 0){
			return create(false);
		}
		var self = (bitMask >> 5) & 1 ;
		bitMask &= 0x757 ;
		var neighborCount = 0;
		while (bitMask != 0) {
		   neighborCount++ ;
		   bitMask &= bitMask - 1 ;
		}
		if (neighborCount == 3 || (neighborCount == 2 && self != 0)){
		   return create(true) ;
		}
		else{
		   return create(false) ;
		}
	};
})();