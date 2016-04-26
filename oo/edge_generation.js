GLO.EdgeGeneration = function(canvas, edges, is_aggregated){
	this.canvas = canvas
	this.edges = edges
	this.is_aggregated = is_aggregated || false

	this.gen_id = this.canvas.glo._next_edge_gen()

	this.canvas.edge_generations.set(this.gen_id, this)

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

GLO.EdgeGeneration.prototype.min_stroke_width = 1
GLO.EdgeGeneration.prototype.max_stroke_width = 50

GLO.EdgeGeneration.prototype.max_link_curve_r = 11


GLO.EdgeGeneration.prototype.source_generation = function(value){
	if(!value){
		return this._source_generation
	}
	if(this._source_generation){
		this._source_generation.remove_listener(this)
	}
	this._source_generation = value.get_root_source_gen()
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
	this._target_generation = value.get_root_source_gen()
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

GLO.EdgeGeneration.prototype.size_by_constant = function(constant){
	var self = this
	this.edges.forEach(function(d){
		d.stroke_width_list[self.gen_id] = constant
	})

	this.update()
	return this
}

GLO.EdgeGeneration.prototype.size_by = function(attr){
	var self = this
	var type = this.canvas.glo.edge_attr()[attr]
	if(type=="continuous"){
		this.size_by_continuous(attr)
	}else if(type=="discrete"){
		this.size_by_discrete(attr)
	}else{
		throw "Unrecognized Type Error"
	}

	return this
}

GLO.EdgeGeneration.prototype.size_by_discrete = function(attr){
	var self = this

	var scale = d3.scale.ordinal()
		.domain(this.edges.map(function(d){
			return d[attr]
		}).sort(function(a,b){
			var val
			if(_.isNumber(a)){
				val = a-b
			}else{
				val = a.localeCompare(b)
			}
			return val
		}))

	this.stroke_width_scale = scale
		.rangePoints([this.min_stroke_width,this.max_stroke_width])
	
	this.edges.forEach(function(d){
		d.stroke_width_list[self.gen_id] = scale(d[attr])
	})

	this.update()
	return this
}


GLO.EdgeGeneration.prototype.size_by_continuous = function(attr){
	var self = this

	var extent = d3.extent(this.edges.map(function(d){
		return d[attr]
	}))


	var scale = d3.scale.linear()
		.domain(extent)
		.range([this.min_stroke_width,this.max_stroke_width])
	

	this.edges.forEach(function(d){
		d.stroke_width_list[self.gen_id] = scale(d[attr])
	})

	this.stroke_width_scale = scale

	this.update()
	return this

}

GLO.EdgeGeneration.prototype.deaggregate = function(){
	if(!this.is_aggregated){ return this; }

	var self = this

	var source_gen = this.aggregate_source_generation
	//Remove the glyphs
	self.edge_g.remove()

	//Remove pointer to the generation
	self.canvas.edge_generations.delete(self.gen_id)


	self.canvas.active_edge_generation(source_gen)
	source_gen.edge_g.style("display", null)
	source_gen.update()

	return source_gen
}


GLO.EdgeGeneration.prototype.get_root_source_gen = function(){
	if(!this.is_aggregated){
		return this
	}
	return this.aggregate_source_generation.get_root_source_gen()
}

GLO.EdgeGeneration.prototype.aggregate = function(attr,method){
	var self = this

	var agg_fn
	if(method.toLowerCase()=="sum"){
		agg_fn = d3.sum
	}else if(method.toLowerCase()=="mean"){
		agg_fn = d3.mean
	}else if(method.toLowerCase()=="median"){
		agg_fn = d3.median
	}else{
		throw "Unrecognized aggregation method. Not aggregating."
		return this
	}

	var key_fn
	if(typeof attr == "string"){
		key_fn = function(d,attr){
			if(attr.startsWith("source.")){
				return d.source[attr.substr(6)]
			}
			if(attr.startsWith("target.")){
				return d.target[attr.substr(6)]
			}
			return d[attr]
		}
	}else{// attr is list
		key_fn = function(d,attrs){
			var str = ""
			for(var attr in attrs){
				attr = attrs[attr]
				var val
				if(attr.startsWith("source.")){
					val = d.source[attr.substr(7)]
					
				}else if(attr.startsWith("target.")){
					val = d.target[attr.substr(7)]
				}else{
					val = d[attr]
				}
				str+=val+"&"
			}
			return str
		}
	}

	var agg_edges = new Map()
	this.edges.forEach(function(d){
		var key = key_fn(d,attr)
		if(!agg_edges[key]){
			agg_edges[key] = []
		}
		agg_edges[key].push(d)
	})

	var new_edges = new Map()
	for(var key in agg_edges){
		var list = agg_edges[key]

		var new_edge = {}

		new_edge.stroke_list = new Map()
		new_edge.stroke_width_list = new Map()
		new_edge.display_list = new Map()

		new_edge.startx = function(edge_gen){ return this.source.x_list[edge_gen.source_generation().gen_id]; }
		new_edge.starty = function(edge_gen){ return this.source.y_list[edge_gen.source_generation().gen_id]; }
		new_edge.endx = function(edge_gen){ return this.target.x_list[edge_gen.target_generation().gen_id]; }
		new_edge.endy = function(edge_gen){ return this.target.y_list[edge_gen.target_generation().gen_id]; }


		new_edges.set(key, new_edge)
	}

	var new_edge_arr = [...new_edges.values()]

	var agg_gen = new GLO.EdgeGeneration(this.canvas, new_edge_arr, true)
	agg_gen.aggregate_edge_map = new Map() //(edge in this gen,past gen) --> list(nodes in old gen)

	agg_gen.aggregate_source_generation = this

	var id_counter = 0
	for(var key in agg_edges){
		var list = agg_edges[key]
		var new_edge = new_edges.get(key)

		agg_gen.aggregate_edge_map.set(new_edge, list)

				//INTERNAL PROPERTIES
		new_edge.id = id_counter++

		new_edge.stroke_width_list[agg_gen.gen_id] = agg_fn(list.map(function(d){
			return d.stroke_width_list[self.gen_id]
		}))
		new_edge.display_list[agg_gen.gen_id] = list[0].display_list[self.gen_id]
		new_edge.stroke_list[agg_gen.gen_id] = list[0].stroke_list[self.gen_id]

		//THIS PROBABLY ISN'T OPTIMAL!!!!!
		new_edge.source = list[0].source
		new_edge.target = list[0].target

		//EXTERNAL PROPERTIES
		var edge_attrs = this.canvas.glo.edge_attr()
		for(var prop in edge_attrs){
			if(edge_attrs[prop]=="continuous"){
				new_edge[prop] = agg_fn(list.map(function(d){
					return d[prop]
				}))
			}else{
				new_edge[prop] = list[0][prop]
			}
		}

		//AGGREGATE PROPERTY (ALWAYS SUM)
		new_edge.count = d3.sum(list.map(function(d){
			return d.count
		}))
	}

	agg_gen.edge_format(self.edge_format())
	agg_gen.show_mode(self.show_mode())

	agg_gen.source_generation(self.source_generation())
	agg_gen.target_generation(self.target_generation())

	this.edge_g.style("display", "none")
	this.canvas.active_edge_generation(agg_gen)

	agg_gen.init_svg().init_draw().update()

	return agg_gen
}



GLO.EdgeGeneration.prototype.init_svg = function(){
	this.edge_g = this.canvas.chart.insert("g", ":first-child")
		.classed("edgeg",true)

	this.edge_glyphs = this.edge_g.selectAll(".edge")
		.data(this.edges, function(d){return d.id})
	


	return this
}

GLO.EdgeGeneration.prototype.init_props = function(){
	var self = this

	this.edges
		.forEach(function(d){
			d.stroke_width_list[self.gen_id] = self.default_stroke_width
			d.stroke_list[self.gen_id] = self.default_stroke
			d.display_list[self.gen_id] = null

		})

	return this
}

GLO.EdgeGeneration.prototype.init_draw = function(){
	var self = this

	this.edge_glyphs.enter().append("svg:path")
		.classed("edge",true)
		.classed("edgegen-"+this.gen_id, true)
		.style("fill", "none")
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


	this.edge_glyphs
		.style("stroke-width", function(d){
			return d.stroke_width_list[self.gen_id]
		})
		.style("stroke", function(d){
			return d.stroke_list[self.gen_id]
		})
		.style("display", function(d){
			return d.display_list[self.gen_id]
		})


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
		if(d.endx(self).toFixed(12)==d.startx(self).toFixed(12)){
			if(d.endy(self)<d.starty(self)){
				return "url(#up)"
			}else{
				return "url(#down)"
			}
		}
		if(d.endy(self).toFixed(12)==d.starty(self).toFixed(12)){
			 if(d.endx(self)<d.startx(self)){
				return "url(#right)"
			}else{
				return "url(#left)"
			}
		}
		if(d.endx(self).toFixed(12)<d.startx(self).toFixed(12)){
			if(d.endy(self)<d.starty(self)){
				return "url(#nxny)"
			}else{
				return "url(#nxpy)"
			}
		}else{
			if(d.endy(self).toFixed(12)<d.starty(self).toFixed(12)){
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