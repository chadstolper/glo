/**
	NodeGeneration object.
	Constructor adds itself to its home canvas's node_generation dict
*/
GLO.NodeGeneration = function(canvas, nodes, is_aggregated){
	this.canvas = canvas
	this.nodes = nodes
	this.is_aggregated = is_aggregated || false

	this.gen_id = this.canvas.glo._next_node_gen()

	this.canvas.node_generations.set(this.gen_id,this)

	this.edge_generation_listeners = new Set()


	this.default_x_scale = d3.scale.linear()
			.range([this.canvas.left(),this.canvas.right()])
			.domain([0,1])

	this.default_y_scale = d3.scale.linear()
			.range([this.canvas.bottom(),this.canvas.top()])
			.domain([0,1])

	this.x_scale = this.default_x_scale.copy()

	this.y_scale = this.default_y_scale.copy()


	this.group_by_map = new Map() //attr_string-->(vals-->node_group)

	this._highlight_neighbors = false

	return this
}

GLO.NodeGeneration.prototype.default_r = 5
GLO.NodeGeneration.prototype.default_fill = "#333"
GLO.NodeGeneration.prototype.max_r = 45
GLO.NodeGeneration.prototype.min_r = 2
GLO.NodeGeneration.prototype.discrete_range_padding = 1.0;


GLO.NodeGeneration.prototype.get_group_by_groups = function(attr){
	var self = this

	var node_groups

	if(this.group_by_map.has(attr)){
		node_groups = this.group_by_map.get(attr)
	}else{
		node_groups = new Map()

		var vals = this.nodes.map(function(d){
			return d[attr]
		})

		for(var val in vals){
			val = vals[val]
			nodes = this.nodes.filter(function(d){
				return (d[attr] == val)
			})
			node_group = new GLO.NodeGroup(nodes,this)
			node_groups.set(val,node_group)
		}

		this.group_by_map.set(attr, node_groups)
	}


	return node_groups
}


GLO.NodeGeneration.prototype.scale = function(oleft,oright,otop,obottom,nleft,nright,ntop,nbottom){
	var self = this
	var scaler_x = d3.scale.linear()
												.domain([oleft,oright])
												.range([nleft,nright])
	var scaler_y = d3.scale.linear()
												.domain([obottom,otop])
												.range([nbottom,ntop])

	self.nodes.forEach(function(d){
		d.x_list[self.gen_id] = scaler_x(d.x_list[self.gen_id])
		d.y_list[self.gen_id] = scaler_y(d.y_list[self.gen_id])
	})

	//TODO: UPDATE XSCALES AND YSCALES
	self.x_scale.range([nleft,nright])
	self.y_scale.range([nbottom,ntop])

	for(var group of self.group_by_map.values()){
		for(var node_group of group.values()){
			node_group.coordinates.x(scaler_x(node_group.coordinates.x()))
			node_group.coordinates.y(scaler_y(node_group.coordinates.y()))
			node_group.coordinates.width(
				scaler_x(node_group.coordinates.right())
				-scaler_x(node_group.coordinates.left())
				)
			node_group.coordinates.height(
				scaler_y(node_group.coordinates.bottom())
				-scaler_y(node_group.coordinates.top())
				)
		}
	}

	this.canvas.update_axes()
	self.update()
	return self
}


GLO.NodeGeneration.prototype.clone = function(canvas){
	if(typeof canvas == "undefined"){
		canvas = this.canvas
	}

	var self = this

	var clone_gen = new GLO.NodeGeneration(canvas, this.nodes, this.is_aggregated)

	clone_gen.nodes.forEach(function(d){
			//INTERNAL PROPERTIES
		d.x_list[clone_gen.gen_id] = d.x_list[self.gen_id]
		d.y_list[clone_gen.gen_id] = d.y_list[self.gen_id]
		d.r_list[clone_gen.gen_id] = d.r_list[self.gen_id]
		d.rho_list[clone_gen.gen_id] = d.rho_list[self.gen_id]
		d.theta_list[clone_gen.gen_id] = d.theta_list[self.gen_id]

		// d.hover_list.set(clone_gen.gen_id, false)
		d.fill_list[clone_gen.gen_id] = d.fill_list[self.gen_id]
	})

	clone_gen.x_scale = self.x_scale.copy()
	clone_gen.y_scale = self.y_scale.copy()

	//Clone Groups
	clone_gen.group_by_map = new Map()
	for (var [attr, group_map] of self.group_by_map.entries()) {
		var new_group_map = new Map()
		for (var [val, group] of group_map){
			new_group_map.set(val, group.clone(clone_gen))
		}
		clone_gen.group_by_map.set(attr, new_group_map)
	}

	if(this.is_aggregated){

		var agg_source_clone = this.aggregate_source_generation.clone(canvas)
		clone_gen.aggregate_source_generation = agg_source_clone
		agg_source_clone.aggregate_target_generation = clone_gen
		agg_source_clone.has_aggregate = true

		clone_gen.aggregate_node_map = new Map()
		for(var [n,list] of this.aggregate_node_map){
			clone_gen.aggregate_node_map.set(n,list)
		}
	}


	clone_gen
		.init_svg()
		.init_draw()
		.is_displayed(self.is_displayed())
		.highlight_neighbors(self.highlight_neighbors())
		.update()

	clone_gen.canvas.active_node_generation(clone_gen)

	return clone_gen
}

GLO.NodeGeneration.prototype.is_displayed = function(value){
	if(typeof value == "undefined"){
		return this._is_displayed
	}
	this._is_displayed = value
	if(this._is_displayed==false){
		this.node_g.style("display", "none")
	}else{
		this.node_g.style("display", null)
	}
	return this
}

GLO.NodeGeneration.prototype.deaggregate = function(){
	if(!this.is_aggregated){ return this; }

	var self = this

	var source_gen = this.aggregate_source_generation

	//Remove the glyphs
	self.node_g.remove()

	//Remove pointer to the generation
	self.canvas.node_generations.delete(self.gen_id)

	if(self.canvas.x_axis_gen()==self){
		self.canvas.x_axis_gen(source_gen)
	}
	if(self.canvas.y_axis_gen()==self){
		self.canvas.y_axis_gen(source_gen)
	}

	self.canvas.active_node_generation(source_gen)
	source_gen.has_aggregate = false
	delete self.aggregate_target_generation
	source_gen.highlight_neighbors(self.highlight_neighbors())
	source_gen.is_displayed(true)
	source_gen.update()

	return source_gen
}

GLO.NodeGeneration.prototype.get_root_source_gen = function(){
	if(!this.is_aggregated){
		return this
	}
	return this.aggregate_source_generation.get_root_source_gen()
}

GLO.NodeGeneration.prototype.get_leaf_target_gen = function(){
	if(!this.has_aggregate){
		return this
	}
	return this.aggregate_target_generation.get_leaf_target_gen()
}


GLO.NodeGeneration.prototype.aggregate = function(attr, method){
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
			return d[attr]
		}
	}else{// attr is list
		key_fn = function(d,attrs){
			var str = ""
			for(var attr in attrs){
				attr = attrs[attr]
				str+=d[attr]+"&"
			}
			return str
		}
	}

	var agg_nodes = new Map()
	this.nodes.forEach(function(d){
		var key = key_fn(d,attr)
		if(!agg_nodes[key]){
			agg_nodes[key] = []
		}
		agg_nodes[key].push(d)
	})



	var new_nodes = new Map()
	for(var key in agg_nodes){
		var list = agg_nodes[key]

		var new_node = {}

		new_node.x_list = new Map()
		new_node.y_list = new Map()
		new_node.r_list = new Map()
		new_node.rho_list = new Map()
		new_node.theta_list = new Map()

		// new_node.in_edges = new Set()
		// new_node.out_edges = new Set()

		// new_node.hover_list = new Map()
		new_node.hover_value = false
		new_node.in_hover_value = false
		new_node.out_hover_value = false
		new_node.fill_list = new Map()

		new_node.label = key.slice(0,-1) //slice is to remove last &

		new_nodes.set(key, new_node)
	}

	var new_nodes_arr = [...new_nodes.values()]

	var agg_gen = new GLO.NodeGeneration(this.canvas, new_nodes_arr, true)
	agg_gen.aggregate_node_map = new Map() //(node in this gen,past gen) --> list(nodes in old gen)


	//Update properties from this to the aggregate
	agg_gen.aggregate_source_generation = this
	this.aggregate_target_generation = agg_gen
	this.has_aggregate = true
	agg_gen.x_scale = this.x_scale.copy()
	agg_gen.y_scale = this.y_scale.copy()

	// agg_gen.aggregate_source_generation.shift(this)

	var id_counter = 0
	for(var key in agg_nodes){
		var list = agg_nodes[key]
		var new_node = new_nodes.get(key)


		agg_gen.aggregate_node_map.set(new_node, list)


		//INTERNAL PROPERTIES
		new_node.id = id_counter++

		new_node.x_list[agg_gen.gen_id] = agg_fn(list.map(function(d){
			return d.x_list[self.gen_id]
		}))
		new_node.y_list[agg_gen.gen_id] = agg_fn(list.map(function(d){
			return d.y_list[self.gen_id]
		}))
		new_node.r_list[agg_gen.gen_id] = agg_fn(list.map(function(d){
			return d.r_list[self.gen_id]
		}))
		new_node.rho_list[agg_gen.gen_id] = agg_fn(list.map(function(d){
			return d.rho_list[self.gen_id]
		}))
		new_node.theta_list[agg_gen.gen_id] = agg_fn(list.map(function(d){
			return d.theta_list[self.gen_id]
		}))

		// new_node.hover_list.set(agg_gen.gen_id, false)
		new_node.fill_list[agg_gen.gen_id] = list[0].fill_list[this.gen_id]

		// list.forEach(function(d){
		// 	d.in_edges.forEach(function(e){
		// 		new_node.in_edges.add(e)
		// 	})
		// 	d.out_edges.forEach(function(e){
		// 		new_node.out_edges.add(e)
		// 	})
		// })

		//EXTERNAL PROPERTIES
		var node_attrs = this.canvas.glo.node_attr()
		for(var prop in node_attrs){
			if(node_attrs[prop]=="continuous"){
				new_node[prop] = agg_fn(list.map(function(d){
					return d[prop]
				}))
			}else{
				new_node[prop] = list[0][prop]
			}
		}

		//AGGREGATE PROPERTY (ALWAYS SUM)
		new_node.count = d3.sum(list.map(function(d){
			return d.count
		}))
		new_node.degree = d3.sum(list.map(function(d){
			return d.degree
		}))
		new_node.in_degree = d3.sum(list.map(function(d){
			return d.in_degree
		}))
	}

	
	this.canvas.active_node_generation(agg_gen)
	if(this.canvas.x_axis_gen()==this){
		this.canvas.x_axis_gen(agg_gen)
	}
	if(this.canvas.y_axis_gen()==this){
		this.canvas.y_axis_gen(agg_gen)
	}
	agg_gen
		.init_svg()
		.init_draw()
		.is_displayed(self.is_displayed())
		.highlight_neighbors(self.highlight_neighbors())
		.update()

	this.is_displayed(false)

	return agg_gen

}


GLO.NodeGeneration.prototype.select = function(str){
	return this.node_g.select(str)
}

GLO.NodeGeneration.prototype.selectAll = function(str){
	return this.node_g.selectAll(str)
}

GLO.NodeGeneration.prototype.update_all = function(){
	var self = this
	this.canvas.glo.update_all_node_generations()
}

GLO.NodeGeneration.prototype.update = function(){
	var self = this

	if(this.is_aggregated){
		for(var [n,list] of this.aggregate_node_map){
			n.hover_value = false
			n.in_hover_value = false
			n.out_hover_value = false
			for(var d in list){
				d = list[d]

				//Currently choosing to propigate only
				//position, selection
				d.x_list[self.aggregate_source_generation.gen_id] = n.x_list[self.gen_id]
				d.y_list[self.aggregate_source_generation.gen_id] = n.y_list[self.gen_id]
				// d.r_list[self.aggregate_source_generation.gen_id] = n.r_list[self.gen_id]
				// d.fill_list[self.aggregate_source_generation.gen_id] = n.fill_list[self.gen_id]
				n.hover_value = n.hover_value || d.hover_value
				n.in_hover_value = n.in_hover_value || d.in_hover_value
				n.out_hover_value = n.out_hover_value || d.out_hover_value
			}
		}

		this.aggregate_source_generation.x_scale = this.x_scale.copy()
		this.aggregate_source_generation.y_scale = this.y_scale.copy()

		this.aggregate_source_generation.update()
	}

	this.node_glyphs.transition()
		.attr("cx", function(d){ return d.x_list[self.gen_id]; })
		.attr("cy", function(d){ return d.y_list[self.gen_id]; })
		.attr("r", function(d){ return d.r_list[self.gen_id]; })
		.attr("fill", function(d){ return d.fill_list[self.gen_id]; })
	
	this.node_glyphs.attr("stroke", function(d){
			if(d.hover_value == true){
				return "black"
			}else if(self.highlight_neighbors() == true && (d.in_hover_value == true || d.out_hover_value == true)){
				return "black"
			}else{
				return "white"
			}
		})
		.attr("stroke-width", function(d){
			if(d.hover_value == true){
				return 3
			}else{
				return 1
			}
		})

	for(let edge_gen of this.edge_generation_listeners){
		edge_gen.update()
	}

	return this
}


GLO.NodeGeneration.prototype.highlight_neighbors = function(value){
	if(typeof value === "undefined"){
		return this._highlight_neighbors
	}

	this._highlight_neighbors = value
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

	this.node_glyphs = this.node_g.selectAll(".node")
		.data(this.nodes, function(d){return d.id})
	this.node_glyphs.enter().append("circle")
		.classed("node",true)
		.classed("gen-"+this.gen_id,true)
		.attr("nodeid", function(d){return d.id})

	return this
}



GLO.NodeGeneration.prototype.init_props = function(){
	var self = this

	this.is_displayed(true)

	this.nodes
		.forEach(function(d){
			d.r_list[self.gen_id] = self.default_r
			d.x_list[self.gen_id] = self.canvas.center()
			d.y_list[self.gen_id] = self.canvas.middle()
			d.rho_list[self.gen_id] = 0
			d.theta_list[self.gen_id] = Math.PI/2
			d.fill_list[self.gen_id] = self.default_fill
			d.hover_value = false
			d.in_hover_value = false
			d.out_hover_value = false
		})


	return this
}


GLO.NodeGeneration.prototype.down_propagate_hover = function(){
	var self = this
	if(this.is_aggregated){
		for(var [n,list] of this.aggregate_node_map){
			for(var d in list){
				d = list[d]
				d.hover_value = n.hover_value
				// d.out_hover_value = n.out_hover_value
				// d.in_hover_value = n.in_hover_value
			}
		}
	}
	return this
}

GLO.NodeGeneration.prototype.init_draw = function(){
	var self = this
	
	
	this.node_glyphs
		.attr("r",function(d){
			return d.r_list[self.gen_id]
		})
		.attr("cx", function(d) {
			return d.x_list[self.gen_id];
		})
		.attr("cy", function(d) {
			return d.y_list[self.gen_id];
		})
		.attr("fill", function(d){
			return d.fill_list[self.gen_id]
		})
		.on('mouseover', function(d){
			d.hover_value = true
			if(!self.is_aggregated){
				d.out_edges.forEach(function(e){
					e.target.in_hover_value = true
				})
				d.in_edges.forEach(function(e){
					e.source.out_hover_value = true
				})
			}else{
				self.aggregate_node_map.get(d).forEach(function(n){
					n.out_edges.forEach(function(e){
						e.target.in_hover_value = true
					})
					n.in_edges.forEach(function(e){
						e.source.out_hover_value = true
					})
				})
			}
			
			self.down_propagate_hover()
			self.update()
			self.update_all()
		})
		.on('mouseout', function(d){
			d.hover_value = false
			if(!self.is_aggregated){
				d.out_edges.forEach(function(e){
					e.target.in_hover_value = false
				})
				d.in_edges.forEach(function(e){
					e.source.out_hover_value = false
				})
			}else{
				self.aggregate_node_map.get(d).forEach(function(n){
					n.out_edges.forEach(function(e){
						e.target.in_hover_value = false
					})
					n.in_edges.forEach(function(e){
						e.source.out_hover_value = false
					})
				})
			}
			self.down_propagate_hover()
			self.update()
			self.update_all()
		})
		.append("title")
			.text(function(d){
				return d.label
			})

	return this
}

GLO.NodeGeneration.prototype.size_by_preset_constant = function(){
	var self = this

	this.nodes.forEach(function(d){
		d.r_list[self.gen_id] = self.default_r
	})

	this.update()
	return this
}

GLO.NodeGeneration.prototype.size_by_constant = function(constant){
	var self = this

	this.nodes.forEach(function(d){
		d.r_list[self.gen_id] = constant
	})

	this.update()
	return this
}

GLO.NodeGeneration.prototype.size_by = function(attr){
	var self = this
	var type = this.canvas.glo.node_attr()[attr]
	if(type=="continuous"){
		this.size_by_continuous(attr)
	}else if(type=="discrete"){
		this.size_by_discrete(attr)
	}else{
		throw "Unrecognized Type Error"
	}

	return this
}

GLO.NodeGeneration.prototype.size_by_discrete = function(attr){
	var self = this

	var scale = d3.scale.ordinal()
		.domain(this.nodes.map(function(d){
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

	this.r_scale = scale
		.rangePoints([this.min_r,this.max_r])
	
	this.nodes.forEach(function(d){
		d.r_list[self.gen_id] = scale(d[attr])
	})

	this.update()
	return this
}


GLO.NodeGeneration.prototype.size_by_continuous = function(attr){
	var self = this

	var accessor = function(d){ return Math.PI * Math.sqrt(d[attr])}

	var extent = d3.extent(this.nodes.map(function(d){
		return accessor(d)
	}))


	var range_min, range_max
	if(extent[0]<this.max_r){
		range_min = Math.max(this.min_r,extent[0])
	}else{
		range_min = this.min_r
	}

	if(extent[1]>this.min_r){
		range_max = Math.min(this.max_r,extent[1])
	}else{
		range_max = this.max_r
	}
	

	var scale = d3.scale.linear()
		.domain(extent)
		.range([range_min,range_max])
	

	this.nodes.forEach(function(d){
		d.r_list[self.gen_id] = scale(accessor(d))
	})

	this.r_scale = scale

	this.update()
	return this

}


GLO.NodeGeneration.prototype.color_by_preset_constant = function(){
	var self = this

	this.nodes.forEach(function(d){
		d.fill_list[self.gen_id] = self.default_fill
	})

	this.update()
	return this
}




GLO.NodeGeneration.prototype.color_by_constant = function(constant){
	var self = this

	this.nodes.forEach(function(d){
		d.fill_list[self.gen_id] = constant
	})

	this.update()
	return this
}





GLO.NodeGeneration.prototype.color_by = function(attr){
	var self = this
	var type = this.canvas.glo.node_attr()[attr]
	if(type=="color"){
		this.color_by_color_attr(attr)
	}else if(type=="continuous"){
		this.color_by_continuous(attr)
	}else if(type=="discrete"){
		this.color_by_discrete(attr)
	}else{
		throw "Unrecognized Type Error"
	}

	return this
}

GLO.NodeGeneration.prototype.color_by_continuous = function(attr){
	var self = this

	var extent = d3.extent(this.nodes.map(function(d){
		return d[attr]
	}))


	var scale = d3.scale.linear()
	if(extent[0]<=0 && extent[1]>=0){
		scale
			.domain([extent[0], 0, extent[1]])
			.range(["red", "white", "black"])
	}else if(extent[0]>0){
		scale
			.domain(extent)
			.range(["white", "black"])
	}else{// externt[0]<0
		scale
			.domain(extent)
			.range(["red", "white"])
	}
	

	this.nodes.forEach(function(d){
		d.fill_list[self.gen_id] = scale(d[attr])
	})

	this.fill_scale = scale

	this.update()
	return this
}

GLO.NodeGeneration.prototype.color_by_discrete = function(attr){
	var self = this

	var scale = d3.scale.category10()

	this.nodes.forEach(function(d){
		d.fill_list[self.gen_id] = scale(d[attr])
	})

	this.fill_scale = scale

	this.update()
	return this
}

GLO.NodeGeneration.prototype.color_by_color_attr = function(attr){
	var self = this

	this.nodes.forEach(function(d){
		d.fill_list[self.gen_id] = d[attr]
	})

	this.update()
	return this
}



GLO.NodeGeneration.prototype.apply_force_directed = function(edges){
	var self = this
	var force = cola.d3adaptor()
	// var force = d3.layout.force()
		// .linkDistance(30)
		.size([self.canvas.canvas_width(),self.canvas.canvas_height()])
		.nodes(self.nodes)
		.links(edges)
		.jaccardLinkLengths(40,0.7)
		// .avoidOverlaps(true)

		.on('tick', function(){
			self.nodes.forEach(function(d){
				d.x_list[self.gen_id] = d.x
				d.y_list[self.gen_id] = d.y
			})
			self.update()
		})
		.on("end", function(){
			console.log("Force-Directed Finished")
		})
		// .start()
		.start(10,15,20)

	var xscale = d3.scale.linear()
		.range([this.canvas.left(),this.canvas.right()])
		.domain([0,1])

	this.x_scale = xscale

	var yscale = d3.scale.linear()
		.range([this.canvas.bottom(),this.canvas.top()])
		.domain([0,1])

	this.y_scale = yscale

	this.set_axes("rho") //cop-out

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

GLO.NodeGeneration.prototype.position_on = function(axis,val,opts){
	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var groups = this.get_group_by_groups(opts.group_by)
		groups.forEach(function(group){
			group.position_on(axis,val)
		})
		return this
	}

	if(_.isNumber(val)){
		this.position_by_constant(axis,val)
	}else{
		this.position_by_attr(axis,val)
	}
	return this
}

GLO.NodeGeneration.prototype.position_by_attr = function(axis,attr,opts){
	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var groups = this.get_group_by_groups(opts.group_by)
		groups.forEach(function(group){
			group.position_by_attr(axis,attr)
		})
		return this
	}

	var type = this.canvas.glo.node_attr()[attr]
	if(type == "continuous"){
		this.position_by_continuous(axis,attr)
	}else if(type == "discrete" || type=="color"){
		this.position_by_discrete(axis,attr)
	}else{
		throw "Undefined Attribute Error"
	}

	return this
}

GLO.NodeGeneration.prototype.position_by_continuous = function(axis,attr,opts){
	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var groups = this.get_group_by_groups(opts.group_by)
		groups.forEach(function(group){
			group.position_by_continuous(axis,attr)
		})
		return this
	}

	var self = this

	var scale = d3.scale.linear()
		.domain(d3.extent(this.nodes.map(function(d){
			return d[attr]
		})))


	if(axis=="x"){
		this.x_scale = scale
			.range([this.canvas.left(),this.canvas.right()])
		
		this.nodes.forEach(function(d){
			d.x_list[self.gen_id] = scale(d[attr])
		})
	}
	if(axis=="y"){
		this.y_scale = scale
			.range([this.canvas.bottom(),this.canvas.top()])
		
		this.nodes.forEach(function(d){
			d.y_list[self.gen_id] = scale(d[attr])
		})
	}
	if(axis=="rho"){
		this.rho_scale = scale
			.range([1,Math.min(this.canvas.canvas_width(),this.canvas.canvas_height())/2])
	
		this.nodes.forEach(function(d){
			d.rho_list[self.gen_id] = scale(d[attr])
			var new_coords = self.rho_shift(d, d.rho_list[self.gen_id])
			d.x_list[self.gen_id] = new_coords.x
			d.y_list[self.gen_id] = new_coords.y
		})
	}
	if(axis=="theta"){
		this.theta_scale = scale
			.range([3*Math.PI/2,7*Math.PI/2])

		this.nodes.forEach(function(d){
			if(d.x_list[self.gen_id]==self.canvas.center() && d.y_list[self.gen_id]==self.canvas.middle()){
				d.x_list[self.gen_id] = self.canvas.center()+0.0001
				d.y_list[self.gen_id] = self.canvas.middle()+0.0001
			}
			d.theta_list[self.gen_id] = scale(d[attr])
			var new_coords = self.theta_shift(d, d.theta_list[self.gen_id])
			d.x_list[self.gen_id] = new_coords.x
			d.y_list[self.gen_id] = new_coords.y
		})
	}

	this.set_axes(axis)

	this.update()
	return this
}

GLO.NodeGeneration.prototype.position_by_discrete = function(axis,attr,opts){
	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var groups = this.get_group_by_groups(opts.group_by)
		groups.forEach(function(group){
			group.position_by_discrete(axis,attr)
		})
		return this
	}

	var self = this

	var scale = d3.scale.ordinal()
		.domain(this.nodes.map(function(d){
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

	if(axis=="x"){
		this.x_scale = scale
			.rangePoints([this.canvas.left(),this.canvas.right()],this.discrete_range_padding)
		
		this.nodes.forEach(function(d){
			d.x_list[self.gen_id] = scale(d[attr])
		})
	}
	if(axis=="y"){
		this.y_scale = scale
			.rangePoints([this.canvas.bottom(),this.canvas.top()],this.discrete_range_padding)
		
		this.nodes.forEach(function(d){
			d.y_list[self.gen_id] = scale(d[attr])
		})
	}
	if(axis=="rho"){
		this.rho_scale = scale
			.rangePoints([1,Math.min(this.canvas.canvas_width(),this.canvas.canvas_height())/2],this.discrete_range_padding)
	
		this.nodes.forEach(function(d){
			d.rho_list[self.gen_id] = scale(d[attr])
			var new_coords = self.rho_shift(d, d.rho_list[self.gen_id])
			d.x_list[self.gen_id] = new_coords.x
			d.y_list[self.gen_id] = new_coords.y
		})
	}
	if(axis=="theta"){
		this.theta_scale = scale
			.rangePoints([3*Math.PI/2,7*Math.PI/2],this.discrete_range_padding)

		this.nodes.forEach(function(d){
			if(d.x_list[self.gen_id]==self.canvas.center() && d.y_list[self.gen_id]==self.canvas.middle()){
				d.x_list[self.gen_id] = self.canvas.center()+0.0001
				d.y_list[self.gen_id] = self.canvas.middle()+0.0001
			}
			d.theta_list[self.gen_id] = scale(d[attr])
			var new_coords = self.theta_shift(d, d.theta_list[self.gen_id])
			d.x_list[self.gen_id] = new_coords.x
			d.y_list[self.gen_id] = new_coords.y
		})
	}

	this.set_axes(axis)

	this.update()
	return this
}

GLO.NodeGeneration.prototype.position_by_preset_constant = function(axis,opts){
	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var groups = this.get_group_by_groups(opts.group_by)
		groups.forEach(function(group){
			group.position_by_preset_constant(axis)
		})
		return this
	}

	var self = this

	var constant
	if(axis=="x"){
		constant = this.canvas.center()
	}else if(axis=="y"){
		constant = this.canvas.middle()
	}else if(axis=="rho"){
		constant = .95*(Math.min(this.canvas.canvas_width(),this.canvas.canvas_height())/2)
	}else if(axis=="theta"){
		constant = 90
	}else{
		throw "Unsupported Axis: "+axis
	}

	this.position_by_constant(axis,constant)
	return this
}

GLO.NodeGeneration.prototype.position_by_constant = function(axis,constant,opts){
	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var groups = this.get_group_by_groups(opts.group_by)
		groups.forEach(function(group){
			group.position_by_constant(axis,constant)
		})
		return this
	}

	var self = this

	var scale = d3.scale.linear()

	if(axis=="x"){
		this.x_scale = scale
		this.nodes.forEach(function(d){
			d.x_list[self.gen_id] = constant
		})
	}

	if(axis=="y"){
		this.y_scale = scale
		this.nodes.forEach(function(d){
			d.y_list[self.gen_id] = constant
		})
	}

	if(axis=="rho"){
		this.rho_scale = scale
		this.nodes.forEach(function(d){
			d.rho_list[self.gen_id] = constant
			var new_coords = self.rho_shift(d, d.rho_list[self.gen_id])
			d.x_list[self.gen_id] = new_coords.x
			d.y_list[self.gen_id] = new_coords.y
		})
	}

	if(axis=="theta"){
		this.theta_scale = scale

		this.nodes.forEach(function(d){
			if(d.x_list[self.gen_id]==self.canvas.center() && d.y_list[self.gen_id]==self.canvas.middle()){
				d.x_list[self.gen_id] = self.canvas.center()+0.0001
				d.y_list[self.gen_id] = self.canvas.middle()+0.0001
			}
			d.theta_list[self.gen_id] = constant*(Math.PI/180)
			var new_coords = self.theta_shift(d, d.theta_list[self.gen_id])
			d.x_list[self.gen_id] = new_coords.x
			d.y_list[self.gen_id] = new_coords.y
		})
	}

	this.set_axes(axis)

	this.update()
	return this
}


GLO.NodeGeneration.prototype.stack = function(direction,opts){
	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var groups = this.get_group_by_groups(opts.group_by)
		groups.forEach(function(group){
			group.position_by_preset_constant(direction,opts)
		})
		return this
	}

	var self = this

	var by_prop
	if(typeof opts === "undefined" || typeof opts.by === "undefined"){
		by_prop = "id"
	}else{
		by_prop = opts.by
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

	var axis, baseline
	var scale = d3.scale.ordinal()
			.domain(_.range(self.nodes.length))
	var total_length = self.nodes.length*2*self.default_r

	if(direction=="top"){
		axis = "y"
		baseline = self.canvas.top()+self.default_r
		endpoint = baseline + 
		scale.rangePoints([baseline,baseline+total_length],0)
		// stack_fn = function(i){ return baseline+(i*2*self.default_r); }
		self.y_axis = scale
	}
	if(direction=="bottom"){
		axis = "y"
		baseline = self.canvas.bottom()-self.default_r
		scale.rangePoints([baseline, baseline-total_length],0)
		self.y_axis = scale
		// stack_fn = function(i){ return baseline-(i*2*self.default_r); }
	}
	if(direction=="left"){
		axis = "x"
		baseline = self.canvas.left()+self.default_r
		scale.rangePoints([baseline, baseline+total_length],0)
		// stack_fn = function(i){ return baseline+(i*2*self.default_r); }
		self.x_axis = scale
	}
	if(direction=="right"){
		axis = "x"
		baseline = self.canvas.right()-self.default_r
		scale.rangePoints([baseline, baseline-total_length],0)
		// stack_fn = function(i){ return baseline-(i*2*self.default_r); }
		self.x_axis = scale
	}

	self.nodes.forEach(function(d,i){
		d[axis+"_list"][self.gen_id] = scale(i)
	})

	this.set_axes(axis)

	self.update()
	return self
}


GLO.NodeGeneration.prototype.distribute = function(axis,by_prop,opts){
	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var groups = this.get_group_by_groups(opts.group_by)
		groups.forEach(function(group){
			if(by_prop)
				group.distribute(axis,by_prop)
			else
				group.distribute(axis)
		})
		return this
	}

	var self = this


	if(typeof by_prop === "undefined" || by_prop == null){
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
			.rangePoints([this.canvas.left(),this.canvas.right()],this.discrete_range_padding)
		
		this.nodes.forEach(function(d){
			d.x_list[self.gen_id] = scale(d.index)
		})
	}
	if(axis=="y"){
		this.y_scale = scale
			.rangePoints([this.canvas.bottom(),this.canvas.top()],this.discrete_range_padding)
		
		this.nodes.forEach(function(d){
			d.y_list[self.gen_id] = scale(d.index)
		})
	}
	if(axis=="rho"){
		this.rho_scale = scale
			.rangePoints([1,Math.min(this.canvas.canvas_width(),this.canvas.canvas_height())/2],this.discrete_range_padding)
	
		this.nodes.forEach(function(d){
			d.rho_list[self.gen_id] = scale(d.index)
			var new_coords = self.rho_shift(d, d.rho_list[self.gen_id])
			d.x_list[self.gen_id] = new_coords.x
			d.y_list[self.gen_id] = new_coords.y
		})
	}
	if(axis=="theta"){
		this.theta_scale = scale
			.rangePoints([3*Math.PI/2,7*Math.PI/2],this.discrete_range_padding)

		this.nodes.forEach(function(d){
			if(d.x_list[self.gen_id]==self.canvas.center() && d.y_list[self.gen_id]==self.canvas.middle()){
				d.x_list[self.gen_id] = self.canvas.center()+0.0001
				d.y_list[self.gen_id] = self.canvas.middle()+0.0001
			}
			d.theta_list[self.gen_id] = scale(d.index)
			var new_coords = self.theta_shift(d, d.theta_list[self.gen_id])
			d.x_list[self.gen_id] = new_coords.x
			d.y_list[self.gen_id] = new_coords.y
		})
	}

	this.set_axes(axis)

	this.update()
	return this
}

//TODO: REMEMBER TO IGNORE GROUP-BY CASES
GLO.NodeGeneration.prototype.set_axes = function(axis){
	if(axis=="x"){
		this.canvas.x_axis_gen(this)
	}
	if(axis=="y"){
		this.canvas.y_axis_gen(this)
	}
	if(axis=="rho" || axis=="theta"){
		this.x_scale = this.default_x_scale.copy()
		this.y_scale = this.default_y_scale.copy()
		this.canvas.update_axes()
	}
	return this
}


/**
	Returns a map of discrete_val --> [nodes]
*/
GLO.NodeGeneration.prototype._group_by = function(discrete){
	var self = this

	var groups = new Map()

	this.nodes.forEach(function(d){
		if(!groups[d[discrete]]){
			groups[d[discrete]] = []
		}
		groups[d[discrete]].push(d)
	})

	return groups
}




GLO.NodeGeneration.prototype.stack_within = function(direction,within_prop,opts){
	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var groups = this.get_group_by_groups(opts.group_by)
		groups.forEach(function(group){
			group.distribute_on_within(axis,within_prop,by_prop)
		})
		return this
	}

	var self = this

	var by_prop
	if(typeof opts === "undefined" || typeof opts.by === "undefined"){
		by_prop = "id"
	}else{
		by_prop = opts.by
	}


	var groups = this._group_by(within_prop) //within_prop-->[nodes] map



	var axis, baseline
	var scale = d3.scale.ordinal()
			.domain(_.range(self.nodes.length))
	var total_length = self.nodes.length*2*self.default_r

	if(direction=="top"){
		axis = "y"
		baseline = self.canvas.top()+self.default_r
		endpoint = baseline + 
		scale.rangePoints([baseline,baseline+total_length],0)
		// stack_fn = function(i){ return baseline+(i*2*self.default_r); }
	}
	if(direction=="bottom"){
		axis = "y"
		baseline = self.canvas.bottom()-self.default_r
		scale.rangePoints([baseline, baseline-total_length],0)
		// stack_fn = function(i){ return baseline-(i*2*self.default_r); }
	}
	if(direction=="left"){
		axis = "x"
		baseline = self.canvas.left()+self.default_r
		scale.rangePoints([baseline, baseline+total_length],0)
		// stack_fn = function(i){ return baseline+(i*2*self.default_r); }
	}
	if(direction=="right"){
		axis = "x"
		baseline = self.canvas.right()-self.default_r
		scale.rangePoints([baseline, baseline-total_length],0)
		// stack_fn = function(i){ return baseline-(i*2*self.default_r); }
	}



	for(var dis in groups){
		var nodes = groups[dis]
		nodes.sort(function(a,b){
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



		nodes.forEach(function(d){
			d[axis+"_list"][self.gen_id] = scale(d.index)
		})

	}//end for(var dis in groups)


	//Clear scales if necessary
	if(axis=="x"){
		var xscale = d3.scale.linear()
			.range([this.canvas.left(),this.canvas.right()])
			.domain([0,1])

		this.x_scale = xscale
		if(this.canvas.x_axis_gen()==this){
			this.canvas.x_axis_gen(this)
		}
	}
	
	if(axis=="y"){
		var yscale = d3.scale.linear()
			.range([this.canvas.bottom(),this.canvas.top()])
			.domain([0,1])

		this.y_scale = yscale

		
		if(this.canvas.y_axis_gen()==this){
			this.canvas.y_axis_gen(this)
		}
	}

	

	this.update()
	return this

}







GLO.NodeGeneration.prototype.distribute_on_within = function(axis,within_prop,by_prop,opts){
	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var groups = this.get_group_by_groups(opts.group_by)
		groups.forEach(function(group){
			group.distribute_on_within(axis,within_prop,by_prop)
		})
		return this
	}

	var self = this

	if(typeof by_prop === "undefined"){
		by_prop = "id"
	}

	var groups = this._group_by(within_prop) //within_prop-->[nodes] map

	for(var dis in groups){
		var nodes = groups[dis]
		nodes.sort(function(a,b){
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
			.domain(_.range(nodes.length))

		if(axis=="x"){
			scale
				.rangePoints([this.canvas.left(),this.canvas.right()],this.discrete_range_padding)
			
			nodes.forEach(function(d){
				d.x_list[self.gen_id] = scale(d.index)
			})
		}
		if(axis=="y"){
			scale
				.rangePoints([this.canvas.bottom(),this.canvas.top()],this.discrete_range_padding)
			
			nodes.forEach(function(d){
				d.y_list[self.gen_id] = scale(d.index)
			})
		}
		if(axis=="rho"){
			rho_scale = scale
				.rangePoints([1,Math.min(this.canvas.canvas_width(),this.canvas.canvas_height())/2],this.discrete_range_padding)
		
			nodes.forEach(function(d){
				d.rho_list[self.gen_id] = scale(d.index)
				var new_coords = self.rho_shift(d, d.rho_list[self.gen_id])
				d.x_list[self.gen_id] = new_coords.x
				d.y_list[self.gen_id] = new_coords.y
			})
		}
		if(axis=="theta"){
			theta_scale = scale
				.rangePoints([3*Math.PI/2,7*Math.PI/2],this.discrete_range_padding)

			nodes.forEach(function(d){
				if(d.x_list[self.gen_id]==self.canvas.center() && d.y_list[self.gen_id]==self.canvas.middle()){
					d.x_list[self.gen_id] = self.canvas.center()+0.0001
					d.y_list[self.gen_id] = self.canvas.middle()+0.0001
				}
				d.theta_list[self.gen_id] = scale(d.index)
				var new_coords = self.theta_shift(d, d.theta_list[self.gen_id])
				d.x_list[self.gen_id] = new_coords.x
				d.y_list[self.gen_id] = new_coords.y
			})
		}

	}//end for(var dis in groups)


	//Clear scales if necessary
	if(axis=="x"){
		var xscale = d3.scale.linear()
			.range([this.canvas.left(),this.canvas.right()])
			.domain([0,1])

		this.x_scale = xscale
		if(this.canvas.x_axis_gen()==this){
			this.canvas.x_axis_gen(this)
		}
	}
	
	if(axis=="y"){
		var yscale = d3.scale.linear()
			.range([this.canvas.bottom(),this.canvas.top()])
			.domain([0,1])

		this.y_scale = yscale

		
		if(this.canvas.y_axis_gen()==this){
			this.canvas.y_axis_gen(this)
		}
	}

	

	this.update()
	return this

}




GLO.NodeGeneration.prototype.align = function(dir,opts){
	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var groups = this.get_group_by_groups(opts.group_by)
		groups.forEach(function(group){
			group.align(dir)
		})
		return this
	}

	var self = this

	if(dir=="top"){
		this.nodes
			.forEach(function(d){
				d.y_list[self.gen_id] = self.canvas.top()-2*self.default_r
			})
	}

	if(dir=="middle"){
		this.nodes
			.forEach(function(d){
				d.y_list[self.gen_id] = self.canvas.middle()
			})
	}

	if(dir=="bottom"){
		this.nodes
			.forEach(function(d){
				d.y_list[self.gen_id] = self.canvas.bottom()+2*self.default_r
			})
	}

	if(dir=="left"){
		this.nodes
			.forEach(function(d){
				d.x_list[self.gen_id] = self.canvas.left()-2*self.default_r
			})
	}

	if(dir=="center"){
		this.nodes
			.forEach(function(d){
				d.x_list[self.gen_id] = self.canvas.center()
			})
	}

	if(dir=="right"){
		this.nodes
			.forEach(function(d){
				d.x_list[self.gen_id] = self.canvas.right()+2*self.default_r
			})
	}

	if(dir=="top" || dir=="middle" || dir=="bottom"){
		this.canvas.y_axis_gen(this)
	}
	if(dir=="left" || dir=="center" || dir=="right"){
		this.canvas.x_axis_gen(this)
	}

	this.update()

	return this

}