define(["infinitecanvas/infinite-canvas"],function(infiniteCanvas){
	var c = infiniteCanvas(document.getElementById("theCanvas"));
	c.zoom(15,0,0);
	return c;
});