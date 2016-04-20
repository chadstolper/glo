/**
	Top-level glo object storing 
*/
GLO.GLO = function(svg){
	this.svg = svg;
	this._width = parseInt(svg.style("width"))
	this._height = parseInt(svg.style("height"))

	this.node_gen_counter = 0
	this.edge_gen_counter = 0

	this.canvases = {}
	this.canvases[0] = new GLO.Canvas(this,this.width(),this.height())

	this._active_canvas = 0

	this.transition_duration = 500;

	return this
}

GLO.GLO.prototype.width = function(value){
	if(!value){
		return this._width
	}
	this._width = value
	return this
}

GLO.GLO.prototype.height = function(value){
	if(!value){
		return this._height
	}
	this._height = value
	return this
}

GLO.GLO.prototype.active_canvas = function(value){
	if(!value){
		return this.canvases[this._active_canvas]
	}
	this._active_canvas = value
	return this
}

GLO.GLO.prototype.active_node_generation = function(){
	return this.active_canvas().active_node_generation()
}

GLO.GLO.prototype.active_edge_generation = function(){
	return this.active_canvas().active_edge_generation()
}

GLO.GLO.prototype._next_node_gen = function(){
	return this.node_gen_counter++;
}

GLO.GLO.prototype._next_edge_gen = function(){
	return this.edge_gen_counter++;
}


GLO.GLO.prototype.nodes = function(value){
	if(!value){
		return this._nodes
	}
	this._nodes = value
	return this
}

GLO.GLO.prototype.edges = function(value){
	if(!value){
		return this._edges
	}
	this._edges = value
	return this
}

GLO.GLO.prototype.draw = function(){
	this._init_graph()
	this.canvases[0].init()
	return this
}

/**
	Initializes a graph object using provided
	node- and edge-lists.
*/
GLO.GLO.prototype._init_graph = function(){
	var nodes = this.nodes()
	var edges = this.edges()

	for(var e in edges){
		e = edges[e]
		e.source = nodes[e.source]
		e.target = nodes[e.target]

		e.startx = function(edge_gen){ return this.source.x_list[edge_gen.source_generation().gen_id]; }
		e.starty = function(edge_gen){ return this.source.y_list[edge_gen.source_generation().gen_id]; }
		e.endx = function(edge_gen){ return this.target.x_list[edge_gen.target_generation().gen_id]; }
		e.endy = function(edge_gen){ return this.target.y_list[edge_gen.target_generation().gen_id]; }
	}

	nodes.forEach(function(d){
		d.in_edges = []
		d.out_edges = []
		d.x_list = {}
		d.y_list = {}
		d.r_list = {}
		d.radius_list = {}
		d.theta_list = {}
	})
	edges.forEach(function(d){
		d.target.in_edges.push(d)
		d.source.out_edges.push(d)
	})

	return this
}