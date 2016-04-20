/**
	Top-level glo object storing 
*/
GLO.GLO = function(svg){
	this.svg = svg;
	this.width = parseInt(svg.style("width"))
	this.height = parseInt(svg.style("height"))

	this.node_gen_counter = 0
	this.edge_gen_counter = 0

	this.canvases = {}
	this.canvases[0] = new GLO.Canvas(this,this.width,this.height)

	this.transition_duration = 500;

	return this
}



GLO.GLO.prototype._next_node_gen = function(){
	return ++this.node_gen_counter;
}

GLO.GLO.prototype._next_edge_gen = function(){
	return ++this.edge_gen_counter;
}


GLO.GLO.prototype.nodes = function(nodes){
	if(!nodes){
		return this._nodes
	}
	this._nodes = nodes
	return this
}

GLO.GLO.prototype.edges = function(edges){
	if(!edges){
		return this._edges
	}
	this._edges = edges
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