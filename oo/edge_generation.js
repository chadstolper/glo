GLO.EdgeGeneration = function(canvas, edges, is_aggregated){
	this.canvas = canvas
	this.edges = edges
	this.is_aggregated = is_aggregated || false

	this.gen_id = this.canvas.glo._next_edge_gen()

	this.canvas.edge_generations[this.gen_id] = this

	return this
}

GLO.EdgeGeneration.prototype.default_stroke_width = 3;
GLO.EdgeGeneration.prototype.default_stroke = "black";



GLO.EdgeGeneration.prototype.source_generation = function(value){
	if(!value){
		return this._source_generation
	}
	if(this._source_generation){
		this._source_generation.remove_listener(this)
	}
	this._source_generation = value
	this._source_generation.add_listener(this)
	this.update()
	return this
}

GLO.EdgeGeneration.prototype.target_generation = function(value){
	if(!value){
		return this._target_generation
	}
	if(this._target_generation){
		this._target_generation.remove_listener(this)
	}
	this._target_generation = value
	this._target_generation.add_listener(this)
	this.update()
	return this
}



GLO.EdgeGeneration.prototype.update = function(){
	if(this.edge_mode){
		this[this.edge_mode]()
	}
	return this
}


GLO.EdgeGeneration.prototype.init_svg = function(){
	this.edge_g = this.canvas.chart.append("g")
		.classed("edgeg",true)

	return this
}

GLO.EdgeGeneration.prototype.init_draw = function(){
	var self = this
	this.edge_glyphs = this.edge_g.selectAll(".edge")
		.data(this.edges, function(d){return d.id})
	
	this.edge_glyphs.enter().append("svg:path")
		.classed("edge",true)
		.classed("edgegen-"+this.gen_id, true)
		.style("stroke-width", function(d){
			d.stroke_width_list[self.gen_id] = self.default_stroke_width
			return d.stroke_width_list[self.gen_id]
		})
		.style("stroke", function(d){
			d.stroke_list[self.gen_id] = self.default_stroke
			return d.stroke_list[self.gen_id]
		})
		.style("fill", "none")
		.on("mouseover",function(d){
			self.source_generation().select('[nodeid="'+d.source.id+'"]')
				.attr("fill", function(d){
					return d3.rgb(d.fill_list[self.source_generation().gen_id]).brighter()
				} )
			self.target_generation().select('[nodeid="'+d.target.id+'"]')
				.attr("fill", function(d){
					return d3.rgb(d.fill_list[self.target_generation().gen_id]).brighter()
				} )
		})
		.on("mouseout",function(d){
			self.source_generation().select('[nodeid="'+d.source.id+'"]')
				.attr("fill", function(d){
					return d.fill_list[self.source_generation().gen_id]
				} )
			self.target_generation().select('[nodeid="'+d.target.id+'"]')
				.attr("fill", function(d){
					return d.fill_list[self.target_generation().gen_id]
				} )
		})
		

	this.straight_lines()
}


GLO.EdgeGeneration.prototype.straight_lines = function(){
	var self = this

	this.edge_mode = "straight_lines"

	this.edge_glyphs.transition()
		.attr("d", function(d) {
			var p = "M"+ d.startx(self) + "," + d.starty(self)

			//control point
			var cx = (d.endx(self) + d.startx(self))/2
			var cy = (d.endy(self) + d.starty(self))/2
			
			p += "Q"+cx+","+cy+" "
			p += d.endx(self)+","+d.endy(self)


			return p
		});
}