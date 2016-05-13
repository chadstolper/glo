/**
	Top-level glo object storing 
*/
GLO.GLO = function(svg){
	this.svg = svg;
	this._width = parseInt(svg.style("width"))
	this._height = parseInt(svg.style("height"))

	this.node_gen_counter = 0
	this.edge_gen_counter = 0

	this.canvases = new Map()
	this.canvases.set(0, new GLO.Canvas(this,this.width(),this.height()))

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
		return this.canvases.get(this._active_canvas)
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


GLO.GLO.prototype.update_all_node_generations = function(){
	this.canvases.forEach(function(canvas,id){
		canvas.node_generations.forEach(function(node_gen,gen_id){
			node_gen.update()
		})
	})
	return this
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

GLO.GLO.prototype.node_attr = function(value){
	if(!value){
		return this._node_attr
	}
	this._node_attr = value
	this._node_attr.count = "continuous"
	this._node_attr.degree = "continuous"
	this._node_attr.in_degree = "continuous"
	this._node_attr.out_degree = "continuous"
	return this
}

GLO.GLO.prototype.edge_attr = function(value){
	if(!value){
		return this._edge_attr
	}
	this._edge_attr = value
	this._edge_attr.count = "continuous"
	return this
}

GLO.GLO.prototype.draw = function(){
	this._init_graph()
	this._init_directional_gradients()
	this.canvases.get(0).init()
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

		e.stroke_list = new Map()
		e.stroke_width_list = new Map()
		e.fill_list = new Map()
		e.color_list = new Map()

		e.display_list = new Map()

		e.show_mode_list = new Map()
		e.edge_format_list = new Map()

		e.startx = function(edge_gen){ return this.source.x_list[edge_gen.source_generation().gen_id]; }
		e.starty = function(edge_gen){ return this.source.y_list[edge_gen.source_generation().gen_id]; }
		e.endx = function(edge_gen){ return this.target.x_list[edge_gen.target_generation().gen_id]; }
		e.endy = function(edge_gen){ return this.target.y_list[edge_gen.target_generation().gen_id]; }

		e.count = 1
	}

	nodes.forEach(function(d){
		d.in_edges = []
		d.out_edges = []
		d.x_list = new Map()
		d.y_list = new Map()
		d.r_list = new Map()
		d.rho_list = new Map()
		d.theta_list = new Map()

		d.hover_list = new Map()

		d.fill_list = new Map()

		d.count = 1
		
	})
	edges.forEach(function(d){
		d.target.in_edges.push(d)
		d.source.out_edges.push(d)
	})

	nodes.forEach(function(d){
		d.degree = d.in_edges.length + d.out_edges.length
		d.in_degree =  d.in_edges.length
		d.out_degree = d.out_edges.length
	})

	return this
}




GLO.GLO.prototype._init_directional_gradients = function(){
		//http://stackoverflow.com/questions/11368339/drawing-multiple-edges-between-two-nodes-with-d3
	// Per-type markers, as they don't inherit styles.
	var defs = this.svg
		.append("svg:defs")

	defs.append("svg:marker")
		.attr("id", "arrow")
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", 5)
		.attr("refY", 0)
		.attr("markerWidth", 6)
		.attr("markerHeight", 6)
		.attr("orient", "auto")
		.attr("fill","none")
		.attr("stroke","black")
		.attr("opacity",0.45)
	.append("svg:path")
		.attr("d", "M0,-1L4,0L0,1");

	var grad = defs.append("svg:linearGradient")
			.attr("id","nxny")
			.attr("x1","0%")
			.attr("x2","100%")
			.attr("y1","0%")
			.attr("y2","100%")
		grad.append("stop")
			.attr("offset","0%")
			.style("stop-opacity",0.0)
			.style("stop-color","black")
		grad.append("stop")
			.attr("offset","100%")
			.style("stop-opacity",1)
			.style("stop-color","black")

	var grad = defs.append("svg:linearGradient")
			.attr("id","nxpy")
			.attr("x1","0%")
			.attr("x2","100%")
			.attr("y1","100%")
			.attr("y2","0%")
		grad.append("stop")
			.attr("offset","0%")
			.style("stop-opacity",0.0)
			.style("stop-color","black")
		grad.append("stop")
			.attr("offset","100%")
			.style("stop-opacity",1)
			.style("stop-color","black")

	var grad = defs.append("svg:linearGradient")
			.attr("id","pxny")
			.attr("x1","100%")
			.attr("x2","0%")
			.attr("y1","0%")
			.attr("y2","100%")
		grad.append("stop")
			.attr("offset","0%")
			.style("stop-opacity",0.0)
			.style("stop-color","black")
		grad.append("stop")
			.attr("offset","100%")
			.style("stop-opacity",1)
			.style("stop-color","black")

	var grad = defs.append("svg:linearGradient")
			.attr("id","pxpy")
			.attr("x1","100%")
			.attr("x2","0%")
			.attr("y1","100%")
			.attr("y2","0%")
		grad.append("stop")
			.attr("offset","0%")
			.style("stop-opacity",0.0)
			.style("stop-color","black")
		grad.append("stop")
			.attr("offset","100%")
			.style("stop-opacity",1)
			.style("stop-color","black")

	var grad = defs.append("svg:linearGradient")
			.attr("id","down")
			.attr("gradientUnits","userSpaceOnUse")
			.attr("x1","0%")
			.attr("x2","0%")
			.attr("y1","100%")
			.attr("y2","0%")
		grad.append("stop")
			.attr("offset","0%")
			.style("stop-opacity",0.0)
			.style("stop-color","black")
		grad.append("stop")
			.attr("offset","100%")
			.style("stop-opacity",1)
			.style("stop-color","black")

	var grad = defs.append("svg:linearGradient")
			.attr("id","up")
			.attr("gradientUnits","userSpaceOnUse")
			.attr("x1","0%")
			.attr("x2","0%")
			.attr("y1","0%")
			.attr("y2","100%")
		grad.append("stop")
			.attr("offset","0%")
			.style("stop-opacity",0.0)
			.style("stop-color","black")
		grad.append("stop")
			.attr("offset","100%")
			.style("stop-opacity",1)
			.style("stop-color","black")

	var grad = defs.append("svg:linearGradient")
			.attr("id","right")
			.attr("gradientUnits","userSpaceOnUse")
			.attr("x1","0%")
			.attr("x2","100%")
			.attr("y1","0%")
			.attr("y2","0%")
		grad.append("stop")
			.attr("offset","0%")
			.style("stop-opacity",0.0)
			.style("stop-color","black")
		grad.append("stop")
			.attr("offset","100%")
			.style("stop-opacity",1)
			.style("stop-color","black")

	var grad = defs.append("svg:linearGradient")
			.attr("id","left")
			.attr("gradientUnits","userSpaceOnUse")
			.attr("x1","100%")
			.attr("x2","0%")
			.attr("y1","0%")
			.attr("y2","0%")
		grad.append("stop")
			.attr("offset","0%")
			.style("stop-opacity",0.0)
			.style("stop-color","black")
		grad.append("stop")
			.attr("offset","100%")
			.style("stop-opacity",1)
			.style("stop-color","black")
}
