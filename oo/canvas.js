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

	this._x_buffer = 20
	this._y_buffer = 20

	this.node_generations = {}
	this.edge_generations = {}

	this.x_axis_gen
	this.y_axis_gen

	return this
}


GLO.Canvas.prototype.axis_size = 50;


GLO.Canvas.prototype.width = function(value){
	if(!value){
		return this._width
	}
	this._width = value
	return this
}

GLO.Canvas.prototype.canvas_width = function(){
	return this.width()-2*this.x_buffer()-this.axis_size
}

GLO.Canvas.prototype.canvas_height = function(){
	return this.height()-2*this.y_buffer()-this.axis_size
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


GLO.Canvas.prototype.top = function(){
	return this.y_buffer()
}

GLO.Canvas.prototype.bottom = function(){
	return this.height()-this.y_buffer()-this.axis_size
}

GLO.Canvas.prototype.middle = function(){
	return (this.height()-2*this.y_buffer()-this.axis_size)/2
}

GLO.Canvas.prototype.left = function(){
	return this.axis_size + this.x_buffer()
}

GLO.Canvas.prototype.center = function(){
	return this.axis_size+this.x_buffer()+(this.width()-this.axis_size-2*this.x_buffer())/2
}

GLO.Canvas.prototype.right = function(){
	return this.width()-this.x_buffer()
}



GLO.Canvas.prototype.init = function(){
	this.chart = this.glo.svg.append("g")
		.attr("transform","translate("+this.x_offset()+","+this.y_offset()+")")

	this.x_axis_g = this.chart.append("g")
		.attr("class","x axis")
		.attr("transform","translate("+this.left()+","+ this.bottom() + ")")

	this.y_axis_g = this.chart.append("g")
		.attr("class","y axis")
		.attr("transform","translate("+this.x_buffer()+","+this.top()+")")

	this.chart.append("circle")
		.attr("cx", this.center())
		.attr("cy", this.middle())
		.attr("r", 3)
		.style("fill","blue")

	this.chart.append("line")
		.attr("x1", this.left())
		.attr("x2", this.left())
		.attr("y1", this.bottom())
		.attr("y2", this.top())
		.style("stroke", "blue")
		.style("stroke-width", 1)


	this.chart.append("line")
		.attr("x1", this.left())
		.attr("x2", this.right())
		.attr("y1", this.bottom())
		.attr("y2", this.bottom())
		.style("stroke", "blue")
		.style("stroke-width", 1)

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


