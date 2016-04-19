/**
	Canvas object with width, height, and buffers.
	Stores node and edge generations.
*/
GLO.Canvas = function(glo,width,height){
	this.glo = glo;
	this.width = width;
	this.height = height;

	this.node_generations = {}
	this.edge_generations = {}

	this.xscale;
	this.yscale;

	return this
}