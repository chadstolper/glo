/**
	NodeGeneration object.
	Constructor adds itself to its home canvas's node_generation dict
*/
GLO.NodeGeneration = function(canvas, nodes, is_aggregated){
	this.canvas = canvas
	this.nodes = nodes
	this.is_aggregated = is_aggregated || false

	this.gen_id = this.canvas.glo._next_node_gen()

	this.canvas.node_generations[this.gen_id] = this

	this.edge_generation_listeners = new Set()

	return this
}

GLO.NodeGeneration.prototype.default_r = 5


GLO.NodeGeneration.prototype.update = function(){
	var self = this
	this.node_glyphs.transition()
		.attr("cx", function(d){ return d.x_list[self.gen_id]; })
		.attr("cy", function(d){ return d.y_list[self.gen_id]; })
		.attr("r", function(d){ return d.r_list[self.gen_id]; })

	for(let edge_gen of this.edge_generation_listeners){
		edge_gen.update()
	}

	return this
}


GLO.NodeGeneration.prototype.add_listener = function(edge_gen){
	this.edge_generation_listeners.add( edge_gen )
}

GLO.NodeGeneration.prototype.remove_listener = function(edge_gen){
	this.edge_generation_listeners.delete( edge_gen )
}


GLO.NodeGeneration.prototype.init_svg = function(){
	this.node_g = this.canvas.chart.append("g")
		.classed("nodeg",true)

	return this
}



GLO.NodeGeneration.prototype.init_draw = function(){
	var self = this
	this.node_glyphs = this.node_g.selectAll(".node")
		.data(this.nodes, function(d){return d.id})
	this.node_glyphs.enter().append("circle")
		.classed("node",true)
		.classed("gen-"+this.gen_id,true)
		.attr("nodeid", function(d){return d.id})
		.attr("r",function(d){
			d.r_list[self.gen_id] = self.default_r
			return d.r_list[self.gen_id]
		})
		.attr("cx", function(d) {
			d.x_list[self.gen_id] = self.canvas.center()
			return d.x_list[self.gen_id];
		})
		.attr("cy", function(d) {
			d.y_list[self.gen_id] = self.canvas.middle()
			return d.y_list[self.gen_id];
		})
		.each(function(d){
			d.radius_list[self.gen_id] = 0
			d.theta_list[self.gen_id] = Math.PI/2
		})
		.attr("fill", "black")

	return this
}


GLO.NodeGeneration.prototype.apply_force_directed = function(edges){
	var self = this
	var force = cola.d3adaptor()
		.linkDistance(70)
		.size([self.canvas.width(),self.canvas.height()])
		.nodes(self.nodes)
		.links(edges)
		.on('tick', function(){
			self.nodes.forEach(function(d){
				d.x_list[self.gen_id] = d.x
				d.y_list[self.gen_id] = d.y
			})
			self.update()
		})
		.start()

	return this
}

GLO.NodeGeneration.prototype.align = function(dir){
	var self = this

	if(dir=="top"){
		this.node_glyphs
			.each(function(d){
				d.y_list[self.gen_id] = self.canvas.top()
			})
	}

	if(dir=="middle"){
		this.node_glyphs
			.each(function(d){
				d.y_list[self.gen_id] = self.canvas.middle()
			})
	}

	if(dir=="bottom"){
		this.node_glyphs
			.each(function(d){
				d.y_list[self.gen_id] = self.canvas.bottom()
			})
	}

	if(dir=="left"){
		this.node_glyphs
			.each(function(d){
				d.x_list[self.gen_id] = self.canvas.left()
			})
	}

	if(dir=="center"){
		this.node_glyphs
			.each(function(d){
				d.x_list[self.gen_id] = self.canvas.center()
			})
	}

	if(dir=="right"){
		this.node_glyphs
			.each(function(d){
				d.x_list[self.gen_id] = self.canvas.right()
			})
	}

	this.update()

	return this

}