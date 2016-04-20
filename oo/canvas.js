/**
	Canvas object with width, height, and buffers.
	Stores node and edge generations.
*/
GLO.Canvas = function(glo,width,height,x_offset,y_offset){
	this.glo = glo;
	this._width = width;
	this._height = height;
	this._x_offset = x_offset || 0
	this._y_offset = y_offset || 0

	this._x_buffer = 0
	this._y_buffer = 0

	this.node_generations = {}
	this.edge_generations = {}


	this.xscale;
	this.yscale;

	return this
}


GLO.Canvas.prototype.axis_size = 20;


GLO.Canvas.prototype.width = function(value){
	if(!value){
		return this._width
	}
	this._width = value
	return this
}

GLO.Canvas.prototype.height = function(value){
	if(!value){
		return this._height
	}
	this._height = value
	return this
}

GLO.Canvas.prototype.active_node_generation = function(value){
	if(!value){
		return this._active_node_generation
	}
	this._active_node_generation = value
	return this
}

GLO.Canvas.prototype.active_edge_generation = function(value){
	if(!value){
		return this._active_edge_generation
	}
	this._active_edge_generation = value
	return this
}



GLO.Canvas.prototype.x_buffer = function(value){
	if(!value){
		return this._x_buffer
	}
	this._x_buffer = value
	return this
}


GLO.Canvas.prototype.y_buffer = function(value){
	if(!value){
		return this._y_buffer
	}
	this._y_buffer = value
	return this
}


GLO.Canvas.prototype.x_offset = function(value){
	if(!value){
		return this._x_offset
	}
	this._x_offset = value
	return this
}


GLO.Canvas.prototype.y_offset = function(value){
	if(!value){
		return this._y_offset
	}
	this._y_offset = value
	return this
}





GLO.Canvas.prototype.init = function(){
	this.chart = this.glo.svg.append("g")
		.attr("transform","translate("+this.x_offset() + this.x_buffer()+","+this.y_offset() + this.y_buffer()+")")

	this.x_axis_g = this.chart.append("g")
		.attr("class","x axis")
		.attr("transform","translate("+this.x_buffer()+","+ (this.height()+this.y_buffer()+this.axis_size) + ")")

	this.y_axis_g = this.chart.append("g")
		.attr("class","y axis")
		.attr("transform","translate("+(this.x_buffer()-this.axis_size)+","+this.y_buffer()+")")


	//append edgeg first so that it is under the nodes
	var init_edges = new GLO.EdgeGeneration(this,this.glo.edges(),false)
	init_edges.init_svg()
	this.active_edge_generation(init_edges)



	var init_nodes = new GLO.NodeGeneration(this,this.glo.nodes(),false);
	init_nodes.init_svg().init_draw()
	this.active_node_generation(init_nodes)

	init_edges
		.source_generation(init_nodes)
		.target_generation(init_nodes)
		.init_draw()

}


