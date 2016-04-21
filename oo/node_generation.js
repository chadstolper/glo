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
			d.rho_list[self.gen_id] = 0
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


GLO.NodeGeneration.prototype.rho_shift = function(d,new_rho){
	var self = this
	var old_x = d.x_list[self.gen_id]
	var old_y = d.y_list[self.gen_id]
	var old_x_normed = old_x-self.canvas.center()
	var old_y_normed = old_y-self.canvas.middle()
	var polars = cartesian2polar(old_x_normed, old_y_normed)
	polars.rho = new_rho
	var new_coords = polar2cartesian(polars.rho, polars.theta)
	new_coords.x += self.canvas.center()
	new_coords.y += self.canvas.middle()
	return new_coords
}

GLO.NodeGeneration.prototype.theta_shift = function(d,new_theta){
	var self = this
	var old_x = d.x_list[self.gen_id]
	var old_y = d.y_list[self.gen_id]
	var old_x_normed = old_x-self.canvas.center()
	var old_y_normed = old_y-self.canvas.middle()
	var polars = cartesian2polar(old_x_normed, old_y_normed)
	polars.theta = new_theta
	var new_coords = polar2cartesian(polars.rho, polars.theta)
	new_coords.x += self.canvas.center()
	new_coords.y += self.canvas.middle()
	return new_coords
}


GLO.NodeGeneration.prototype.distribute = function(axis,by_prop){
	var self = this


	if(!by_prop){
		by_prop = "id"
	}

	self.nodes.sort(function(a,b){
		var val
		if(_.isNumber(a[by_prop])){
			val = a[by_prop]-b[by_prop]
		}else{
			val = a[by_prop].localeCompare(b[by_prop])
		}
		if (val==0){
			return a.id-b.id
		}
		return val
	}).forEach(function(d,i){
		d.index = i
	})

	var scale = d3.scale.ordinal()
		.domain(_.range(self.nodes.length))

	if(axis=="x"){
		this.x_scale = scale
			.rangePoints([this.canvas.left(),this.canvas.right()])
		
		this.nodes.forEach(function(d){
			d.x_list[self.gen_id] = scale(d.index)
		})
	}
	if(axis=="y"){
		this.y_scale = scale
			.rangePoints([this.canvas.bottom(),this.canvas.top()])
		
		this.nodes.forEach(function(d){
			d.y_list[self.gen_id] = scale(d.index)
		})
	}
	if(axis=="rho"){
		this.rho_scale = scale
			.rangePoints([1,Math.min(this.canvas.canvas_width(),this.canvas.canvas_height())/2])
	
		this.nodes.forEach(function(d){
			d.rho_list[self.gen_id] = scale(d.index)
			var new_coords = self.rho_shift(d, d.rho_list[self.gen_id])
			d.x_list[self.gen_id] = new_coords.x
			d.y_list[self.gen_id] = new_coords.y
		})
	}
	if(axis=="theta"){
		this.theta_scale = scale
			.rangeBands([3*Math.PI/2,7*Math.PI/2])

		this.nodes.forEach(function(d){
			d.theta_list[self.gen_id] = scale(d.index)
			var new_coords = self.theta_shift(d, d.theta_list[self.gen_id])
			d.x_list[self.gen_id] = new_coords.x
			d.y_list[self.gen_id] = new_coords.y
		})
	}


	this.update()
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