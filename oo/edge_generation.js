GLO.EdgeGeneration = function(canvas, edges, is_aggregated){
	this.canvas = canvas
	this.edges = edges
	this.is_aggregated = is_aggregated || false

	this.gen_id = this.canvas.glo._next_edge_gen()

	this.canvas.edge_generations[this.gen_id] = this

	this.hscale = d3.scale.linear()
		.range([3,this.max_link_curve_r])
		.domain([0,Math.min(this.canvas.canvas_width(),this.canvas.canvas_height())])

	this._edge_format = "straight_lines"
	this._show_mode = "show_all_edges"

	return this
}

GLO.EdgeGeneration.prototype.default_stroke_width = 2;
GLO.EdgeGeneration.prototype.default_stroke = "black";
GLO.EdgeGeneration.prototype.default_opacity = 0.5

GLO.EdgeGeneration.prototype.max_link_curve_r = 11


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
	var self = this

	if(typeof this.edge_glyphs === "undefined"){ return this; }

	// if(this.edge_format()){
	// 	this[this.edge_format()]()
	// }

	this[this.show_mode()]()

	this.edge_glyphs.transition()
		.style("stroke-width", function(d){
			return d.stroke_width_list[self.gen_id]
		})
		.style("stroke", function(d){
			return d.stroke_list[self.gen_id]
		})
		.style("display", function(d){
			return d.display_list[self.gen_id]
		})
		.style("opacity", self.default_opacity)
		.call(this[this.edge_format()].bind(self))


	return this
}



GLO.EdgeGeneration.prototype.color_by_constant = function(constant){
	var self = this

	this.edges.forEach(function(d){
		d.stroke_list[self.gen_id] = constant
	})

	this.update()
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
		.style("display", function(d){
			d.display_list[self.gen_id] = null
			return d.display_list[self.gen_id]
		})
		.on("mouseover",function(d){
			self.source_generation().select('[nodeid="'+d.source.id+'"]')
				.attr("fill", function(n){
					return d3.rgb(n.fill_list[self.source_generation().gen_id]).brighter()
				} )
			self.target_generation().select('[nodeid="'+d.target.id+'"]')
				.attr("fill", function(n){
					return d3.rgb(n.fill_list[self.target_generation().gen_id]).brighter()
				} )
		})
		.on("mouseout",function(d){
			self.source_generation().select('[nodeid="'+d.source.id+'"]')
				.attr("fill", function(n){
					return n.fill_list[self.source_generation().gen_id]
				} )
			self.target_generation().select('[nodeid="'+d.target.id+'"]')
				.attr("fill", function(n){
					return n.fill_list[self.target_generation().gen_id]
				} )
		})
		

	this.edge_format("straight_lines")

	return this
}


GLO.EdgeGeneration.prototype.edge_format = function(value){
	if(typeof value === "undefined"){
		return this._edge_format
	}
	this._edge_format = value
	this.update()
	return this
}


GLO.EdgeGeneration.prototype.straight_lines = function(selection){
	var self = this

	selection
		.attr("d", function(d) {
			var p = "M"+ d.startx(self) + "," + d.starty(self)

			//control point
			var cx = (d.endx(self) + d.startx(self))/2
			var cy = (d.endy(self) + d.starty(self))/2
			
			p += "Q"+cx+","+cy+" "
			p += d.endx(self)+","+d.endy(self)


			return p
		})
		.call(this.directional_gradient.bind(self))


	return this
}





GLO.EdgeGeneration.prototype.curved_lines = function(selection){
	var self = this

	selection
		.attr("d", function(d) {
			var p = "M"+ d.startx(self) + "," + d.starty(self)

			//control point
			var cx = (d.endx(self) + d.startx(self))/2
			var cy = (d.endy(self) + d.starty(self))/2
			var dist = Math.abs(d.endx(self)-d.startx(self))+Math.abs(d.endy(self)-d.starty(self))
			var h = self.hscale(dist)
			var rise = Math.abs(d.endy(self)-d.starty(self))
			var run = Math.abs(d.endx(self)-d.startx(self))
			var dx, dy
			
			dx = (rise/(rise+run))*h
			dy = -(run/(rise+run))*h
			
			//Curve up or curve down
			var direction
			var ydir = (d.startx(self)<d.endx(self))?1:-1
			dy *= ydir
			var xdir = (d.starty(self)<d.endy(self))?1:-1
			dx *= xdir

			var cx_prime = cx + (dx*h)
			var cy_prime = cy + (dy*h)
			
			p += "Q"+cx_prime+","+cy_prime+" "
			p += d.endx(self)+","+d.endy(self)


			return p
		})
		.call(this.directional_gradient.bind(self))

	return this
}


GLO.EdgeGeneration.prototype.directional_gradient = function(selection){
	var self = this

	selection.style("stroke",function(d){
		if(d.endx(self)==d.startx(self)){
			if(d.endy(self)<d.starty(self)){
				return "url(#up)"
			}else{
				return "url(#down)"
			}
		}
		if(d.endy(self)==d.starty(self)){
			 if(d.endx(self)<d.startx(self)){
				return "url(#right)"
			}else{
				return "url(#left)"
			}
		}
		if(d.endx(self)<d.startx(self)){
			if(d.endy(self)<d.starty(self)){
				return "url(#nxny)"
			}else{
				return "url(#nxpy)"
			}
		}else{
			if(d.endy(self)<d.starty(self)){
				return "url(#pxny)"
			}else{
				return "url(#pxpy)"
			}
		}
	})

	return this
}



GLO.EdgeGeneration.prototype.show_mode = function(value){
	if(typeof value === "undefined"){
		return this._show_mode
	}
	this._show_mode = value

	this.update()
	return this
}



GLO.EdgeGeneration.prototype.show_all_edges = function(){
	var self = this

	this.edges.forEach(function(d){
		d.display_list[self.gen_id] = null
	})

	return this
}


GLO.EdgeGeneration.prototype.show_incident_edges = function(){
	var self = this

	this.edges.forEach(function(d){
		var source_hover = d.source.hover_list[self.source_generation().gen_id]
		var target_hover = d.target.hover_list[self.target_generation().gen_id]
		if(source_hover || target_hover){
			d.display_list[self.gen_id] = null
		}else{
			d.display_list[self.gen_id] = "none"
		}
	})

	return this
}