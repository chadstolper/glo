//GLO Namespace
var GLO = GLO || {};

GLO.Coordinates = function(x,y,width,height){
	if(Array.isArray(x)){
		this._x = d3.min(x)
		this._width = d3.max(x) - this._x
		this._y = d3.min(y)
		this._height = d3.max(y) - this._y
		return this
	}

	this._x = x
	this._y = y
	this._width = width
	this._height = height
	return this
}

GLO.Coordinates.prototype.clone = function(){
	return new GLO.Coordinates(this._x,this._y,this._width,this._height)
}

GLO.Coordinates.prototype.bounding_box_area = function(X,Y){
	var min_x = d3.min(X)
	var min_y = d3.min(Y)
	var max_x = d3.max(X)
	var max_y = d3.max(Y)

	return (max_x-min_x)*(max_y-min_y)
}


GLO.Coordinates.prototype.map_x = function(x){
	return this.x()+x
}

GLO.Coordinates.prototype.map_y = function(y){
	return this.y()+y
}

GLO.Coordinates.prototype.x = function(value){
	if(!value){
		return this._x
	}
	this._x = value
	return this
}

GLO.Coordinates.prototype.y = function(value){
	if(!value){
		return this._y
	}
	this._y = value
	return this
}


GLO.Coordinates.prototype.width = function(value){
	if(!value){
		return this._width
	}
	this.old_width = this.width()
	this._width = value
	return this
}

GLO.Coordinates.prototype.height = function(value){
	if(!value){
		return this._height
	}
	this._height = value
	return this
}

GLO.Coordinates.prototype.area = function(){
	return this.width()*this.height()
}

GLO.Coordinates.prototype.top = function(){
	return this.map_y(0)
}

GLO.Coordinates.prototype.bottom = function(){
	return this.map_y(this.height())
}

GLO.Coordinates.prototype.middle = function(){
	return this.map_y(this.height()/2)
}

GLO.Coordinates.prototype.left = function(){
	return this.map_x(0)
}

GLO.Coordinates.prototype.center = function(){
	return this.map_x(this.width()/2)
}

GLO.Coordinates.prototype.right = function(){
	return this.map_x(this.width())
}
GLO.NodeGroup = function(nodes, node_gen, cloning){
	this.nodes = nodes
	this.gen = node_gen

	if(typeof cloning == "undefined" || cloning == false){
		var self = this
		var X = this.nodes.map(function(d){return d.x_list[self.gen.gen_id]; })
		var Y = this.nodes.map(function(d){return d.y_list[self.gen.gen_id]; })
		this.coordinates = new GLO.Coordinates(X,Y)
	}
	
	return this
}


GLO.NodeGroup.prototype.clone = function(new_node_gen){
	var self = this
	var clone_group = new GLO.NodeGroup(self.nodes,new_node_gen,true)
	clone_group.coordinates = self.coordinates.clone()
	if(self.x_scale) clone_group.x_scale = self.x_scale.copy()
	if(self.y_scale) clone_group.y_scale = self.y_scale.copy()
	if(self.rho_scale) clone_group.rho_scale = self.rho_scale.copy()
	if(self.theta_scale) clone_group.theta_scale = self.theta_scale.copy()
	return clone_group
}


GLO.NodeGroup.prototype.update_coordinates = function(){
	TODO("update_coordinates")
}


GLO.NodeGroup.prototype.rho_shift = function(d,new_rho){
	var self = this
	var old_x = d.x_list[self.gen.gen_id]
	var old_y = d.y_list[self.gen.gen_id]
	var old_x_normed = old_x-self.coordinates.center()
	var old_y_normed = old_y-self.coordinates.middle()
	var polars = cartesian2polar(old_x_normed, old_y_normed)
	polars.rho = new_rho
	var new_coords = polar2cartesian(polars.rho, polars.theta)
	new_coords.x += self.coordinates.center()
	new_coords.y += self.coordinates.middle()
	return new_coords
}

GLO.NodeGroup.prototype.theta_shift = function(d,new_theta){
	var self = this
	var old_x = d.x_list[self.gen.gen_id]
	var old_y = d.y_list[self.gen.gen_id]
	var old_x_normed = old_x-self.coordinates.center()
	var old_y_normed = old_y-self.coordinates.middle()
	var polars = cartesian2polar(old_x_normed, old_y_normed)
	polars.theta = new_theta
	var new_coords = polar2cartesian(polars.rho, polars.theta)
	new_coords.x += self.coordinates.center()
	new_coords.y += self.coordinates.middle()
	return new_coords
}

GLO.NodeGroup.prototype.position_on = function(axis,val){
	if(_.isNumber(val)){
		this.position_by_constant(axis,val)
	}else{
		this.position_by_attr(axis,val)
	}
	return this
}


GLO.NodeGroup.prototype.position_by_attr = function(axis,attr){
	var type = this.gen.canvas.glo.node_attr()[attr]
	if(type == "continuous"){
		this.position_by_continuous(axis,attr)
	}else if(type == "discrete" || type=="color"){
		this.position_by_discrete(axis,attr)
	}else{
		throw "Undefined Attribute Error"
	}

	return this
}

GLO.NodeGroup.prototype.position_by_continuous = function(axis,attr){
	var self = this

	var scale = d3.scale.linear()
		.domain(d3.extent(this.nodes.map(function(d){
			return d[attr]
		})))


	if(axis=="x"){
		this.x_scale = scale
			.range([this.coordinates.left(),this.coordinates.right()])
		
		this.nodes.forEach(function(d){
			d.x_list[self.gen.gen_id] = scale(d[attr])
		})
	}
	if(axis=="y"){
		this.y_scale = scale
			.range([this.coordinates.bottom(),this.coordinates.top()])
		
		this.nodes.forEach(function(d){
			d.y_list[self.gen.gen_id] = scale(d[attr])
		})
	}
	if(axis=="rho"){
		this.rho_scale = scale
			.range([1,Math.min(this.coordinates.width(),this.coordinates.height())/2])
	
		this.nodes.forEach(function(d){
			d.rho_list[self.gen.gen_id] = scale(d[attr])
			var new_coords = self.rho_shift(d, d.rho_list[self.gen.gen_id])
			d.x_list[self.gen.gen_id] = new_coords.x
			d.y_list[self.gen.gen_id] = new_coords.y
		})
	}
	if(axis=="theta"){
		this.theta_scale = scale
			.range([3*Math.PI/2,7*Math.PI/2])

		this.nodes.forEach(function(d){
			if(d.x_list[self.gen_id]==self.coordinates.center() && d.y_list[self.gen_id]==self.coordinates.middle()){
				d.x_list[self.gen_id] = self.coordinates.center()+0.0001
				d.y_list[self.gen_id] = self.coordinates.middle()+0.0001
			}
			d.theta_list[self.gen.gen_id] = scale(d[attr])
			var new_coords = self.theta_shift(d, d.theta_list[self.gen.gen_id])
			d.x_list[self.gen.gen_id] = new_coords.x
			d.y_list[self.gen.gen_id] = new_coords.y
		})
	}

	// this.gen.set_axes(axis)
	this.gen.update()
	return this
}

GLO.NodeGroup.prototype.position_by_discrete = function(axis,attr){
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
			.rangePoints([this.coordinates.left(),this.coordinates.right()],this.gen.discrete_range_padding)
		
		this.nodes.forEach(function(d){
			d.x_list[self.gen.gen_id] = scale(d[attr])
		})
	}
	if(axis=="y"){
		this.y_scale = scale
			.rangePoints([this.coordinates.bottom(),this.coordinates.top()],this.gen.discrete_range_padding)
		
		this.nodes.forEach(function(d){
			d.y_list[self.gen.gen_id] = scale(d[attr])
		})
	}
	if(axis=="rho"){
		this.rho_scale = scale
			.rangePoints([1,Math.min(this.coordinates.width(),this.coordinates.height())/2],this.gen.discrete_range_padding)
	
		this.nodes.forEach(function(d){
			d.rho_list[self.gen.gen_id] = scale(d[attr])
			var new_coords = self.rho_shift(d, d.rho_list[self.gen.gen_id])
			d.x_list[self.gen.gen_id] = new_coords.x
			d.y_list[self.gen.gen_id] = new_coords.y
		})
	}
	if(axis=="theta"){
		this.theta_scale = scale
			.rangePoints([3*Math.PI/2,7*Math.PI/2],this.gen.discrete_range_padding)

		this.nodes.forEach(function(d){
			if(d.x_list[self.gen_id]==self.coordinates.center() && d.y_list[self.gen_id]==self.coordinates.middle()){
				d.x_list[self.gen_id] = self.coordinates.center()+0.0001
				d.y_list[self.gen_id] = self.coordinates.middle()+0.0001
			}
			d.theta_list[self.gen.gen_id] = scale(d[attr])
			var new_coords = self.theta_shift(d, d.theta_list[self.gen.gen_id])
			d.x_list[self.gen.gen_id] = new_coords.x
			d.y_list[self.gen.gen_id] = new_coords.y
		})
	}

	// this.gen.set_axes(axis)
	this.gen.update()
	return this
}


GLO.NodeGroup.prototype.position_by_preset_constant = function(axis){
	var self = this

	var constant
	if(axis=="x"){
		constant = this.coordinates.center()
	}else if(axis=="y"){
		constant = this.coordinates.middle()
	}else if(axis=="rho"){
		constant = .95*(Math.min(this.coordinates.width(),this.coordinates.height())/2)
	}else if(axis=="theta"){
		constant = 90
	}else{
		throw "Unsupported Axis: "+axis
	}

	this.position_by_constant(axis,constant)
	return this
}



GLO.NodeGroup.prototype.position_by_constant = function(axis,constant){
	var self = this

	var scale = d3.scale.linear()

	if(axis=="x"){
		this.x_scale = scale
		this.nodes.forEach(function(d){
			d.x_list[self.gen.gen_id] = constant
		})
	}

	if(axis=="y"){
		this.y_scale = scale
		this.nodes.forEach(function(d){
			d.y_list[self.gen.gen_id] = constant
		})
	}

	if(axis=="rho"){
		this.rho_scale = scale
		this.nodes.forEach(function(d){
			d.rho_list[self.gen.gen_id] = constant
			var new_coords = self.rho_shift(d, d.rho_list[self.gen.gen_id])
			d.x_list[self.gen.gen_id] = new_coords.x
			d.y_list[self.gen.gen_id] = new_coords.y
		})
	}

	if(axis=="theta"){
		this.theta_scale = scale

		this.nodes.forEach(function(d){
			if(d.x_list[self.gen_id]==self.coordinates.center() && d.y_list[self.gen_id]==self.coordinates.middle()){
				d.x_list[self.gen_id] = self.coordinates.center()+0.0001
				d.y_list[self.gen_id] = self.coordinates.middle()+0.0001
			}
			d.theta_list[self.gen.gen_id] = constant*(Math.PI/180)
			var new_coords = self.theta_shift(d, d.theta_list[self.gen.gen_id])
			d.x_list[self.gen.gen_id] = new_coords.x
			d.y_list[self.gen.gen_id] = new_coords.y
		})
	}

	// this.gen.set_axes(axis)
	this.gen.update()
	return this
}


GLO.NodeGroup.prototype.distribute = function(axis,by_prop,opts){
	var self = this


	if(typeof by_prop === "undefined" || by_prop == null){
		by_prop = "id"
	}

	var invert = false
	if(typeof opts !== "undefined" && typeof opts.invert !== "undefined"){
		invert = opts.invert
	}


	self.nodes.sort(function(a,b){
		var val
		if(_.isNumber(a[by_prop])){
			val = a[by_prop]-b[by_prop]
		}else{
			val = a[by_prop].localeCompare(b[by_prop])
		}
		if (val==0){
			val = a.id-b.id
		}
		if(invert){
			val *= -1
		}
		return val
	}).forEach(function(d,i){
		d.index = i
	})

	var scale = d3.scale.ordinal()
		.domain(_.range(self.nodes.length))

	if(axis=="x"){
		this.x_scale = scale
			.rangePoints([this.coordinates.left(),this.coordinates.right()],this.gen.discrete_range_padding)
		
		this.nodes.forEach(function(d){
			d.x_list[self.gen.gen_id] = scale(d.index)
		})
	}
	if(axis=="y"){
		this.y_scale = scale
			.rangePoints([this.coordinates.bottom(),this.coordinates.top()],this.gen.discrete_range_padding)
		
		this.nodes.forEach(function(d){
			d.y_list[self.gen.gen_id] = scale(d.index)
		})
	}
	if(axis=="rho"){
		this.rho_scale = scale
			.rangePoints([1,Math.min(this.coordinates.width(),this.coordinates.height())/2],this.gen.discrete_range_padding)
	
		this.nodes.forEach(function(d){
			d.rho_list[self.gen.gen_id] = scale(d.index)
			var new_coords = self.rho_shift(d, d.rho_list[self.gen.gen_id])
			d.x_list[self.gen.gen_id] = new_coords.x
			d.y_list[self.gen.gen_id] = new_coords.y
		})
	}
	if(axis=="theta"){
		this.theta_scale = scale
			.rangePoints([3*Math.PI/2,7*Math.PI/2],this.gen.discrete_range_padding)

		this.nodes.forEach(function(d){
			if(d.x_list[self.gen_id]==self.coordinates.center() && d.y_list[self.gen_id]==self.coordinates.middle()){
				d.x_list[self.gen_id] = self.coordinates.center()+0.0001
				d.y_list[self.gen_id] = self.coordinates.middle()+0.0001
			}
			d.theta_list[self.gen.gen_id] = scale(d.index)
			var new_coords = self.theta_shift(d, d.theta_list[self.gen.gen_id])
			d.x_list[self.gen.gen_id] = new_coords.x
			d.y_list[self.gen.gen_id] = new_coords.y
		})
	}

	// this.gen.set_axes(axis)
	this.gen.update()
	return this
}



/**
	Returns a map of discrete_val --> [nodes]
*/
GLO.NodeGroup.prototype._group_by = function(discrete){
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


GLO.NodeGroup.prototype.distribute_on_within = function(axis,within_prop,by_prop,opts){
	var self = this

	if(typeof by_prop === "undefined"){
		by_prop = "id"
	}

	var invert = false
	if(typeof opts !== "undefined" && typeof opts.invert !== "undefined"){
		invert = opts.invert
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
				val = a.id-b.id
			}
			if(invert==true){
				val = -1*val
			}
			return val
		}).forEach(function(d,i){
			d.index = i
		})

		var scale = d3.scale.ordinal()
			.domain(_.range(nodes.length))

		if(axis=="x"){
			scale
				.rangePoints([this.coordinates.left(),this.coordinates.right()],this.gen.discrete_range_padding)
			
			nodes.forEach(function(d){
				d.x_list[self.gen.gen_id] = scale(d.index)
			})
		}
		if(axis=="y"){
			scale
				.rangePoints([this.coordinates.bottom(),this.coordinates.top()],this.gen.discrete_range_padding)
			
			nodes.forEach(function(d){
				d.y_list[self.gen.gen_id] = scale(d.index)
			})
		}
		if(axis=="rho"){
			rho_scale = scale
				.rangePoints([1,Math.min(this.coordinates.width(),this.coordinates.height())/2],this.gen.discrete_range_padding)
		
			this.nodes.forEach(function(d){
				d.rho_list[self.gen.gen_id] = scale(d.index)
				var new_coords = self.rho_shift(d, d.rho_list[self.gen.gen_id])
				d.x_list[self.gen.gen_id] = new_coords.x
				d.y_list[self.gen.gen_id] = new_coords.y
			})
		}
		if(axis=="theta"){
			theta_scale = scale
				.rangePoints([3*Math.PI/2,7*Math.PI/2],this.gen.discrete_range_padding)

			nodes.forEach(function(d){
				d.theta_list[self.gen.gen_id] = scale(d.index)
				var new_coords = self.theta_shift(d, d.theta_list[self.gen.gen_id])
				d.x_list[self.gen.gen_id] = new_coords.x
				d.y_list[self.gen.gen_id] = new_coords.y
			})
		}

	}//end for(var dis in groups)


	// //Clear scales if necessary
	// if(axis=="x"){
	// 	var xscale = d3.scale.linear()
	// 		.range([this.coordinates.left(),this.coordinates.right()])
	// 		.domain([0,1])

	// 	this.x_scale = xscale
	// 	if(this.coordinates.x_axis_gen()==this){
	// 		this.coordinates.x_axis_gen(this)
	// 	}
	// }
	
	// if(axis=="y"){
	// 	var yscale = d3.scale.linear()
	// 		.range([this.coordinates.bottom(),this.coordinates.top()])
	// 		.domain([0,1])

	// 	this.y_scale = yscale

		
	// 	if(this.coordinates.y_axis_gen()==this){
	// 		this.coordinates.y_axis_gen(this)
	// 	}
	// }

	
	this.gen.update()
	return this

}






GLO.NodeGroup.prototype.align = function(dir){
	var self = this

	if(dir=="top"){
		this.nodes
			.forEach(function(d){
				d.y_list[self.gen.gen_id] = self.coordinates.top()-self.gen.default_r
			})
	}

	if(dir=="middle"){
		this.nodes
			.forEach(function(d){
				d.y_list[self.gen.gen_id] = self.coordinates.middle()
			})
	}

	if(dir=="bottom"){
		this.nodes
			.forEach(function(d){
				d.y_list[self.gen.gen_id] = self.coordinates.bottom()+self.gen.default_r
			})
	}

	if(dir=="left"){
		this.nodes
			.forEach(function(d){
				d.x_list[self.gen.gen_id] = self.coordinates.left()-self.gen.default_r
			})
	}

	if(dir=="center"){
		this.nodes
			.forEach(function(d){
				d.x_list[self.gen.gen_id] = self.coordinates.center()
			})
	}

	if(dir=="right"){
		this.nodes
			.forEach(function(d){
				d.x_list[self.gen.gen_id] = self.coordinates.right()+self.gen.default_r
			})
	}

	// if(dir=="top" || dir=="middle" || dir=="bottom"){
	// 	this.canvas.y_axis_gen(this)
	// }
	// if(dir=="left" || dir=="center" || dir=="right"){
	// 	this.canvas.x_axis_gen(this)
	// }

	this.gen.update()

	return this

}
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

	this._x_buffer = 10
	this._y_buffer = 20

	this.node_generations = new Map()
	this.edge_generations = new Map()

	this._show_x_axis = false
	this._show_y_axis = false

	this.id = this.glo._next_canvas_id()
	this.glo.canvases.set(this.id, this)
	this.glo.active_canvas(this.id)

	return this
}


GLO.Canvas.prototype.y_axis_width = 35;
GLO.Canvas.prototype.x_axis_height = 15;


GLO.Canvas.prototype.extra_x = function(){
	return this._x_buffer*2 + this.y_axis_width
}

GLO.Canvas.prototype.extra_y = function(){
	return this._y_buffer*2 + this.x_axis_width
}

GLO.Canvas.prototype.scale = function(axis,value){
	if(axis!="x" && axis!="y"){
		throw "Invalid axis to scale canvas: "+axis
		return this
	}
	var old_left = this.left()
	var old_right = this.right()
	var old_top = this.top()
	var old_bottom = this.bottom()
	if(axis == "x"){
		this.width(this.width()*value)
	}
	if(axis == "y"){
		this.height(this.height()*value)
	}
	for(var gen of this.node_generations.values()){
		gen.scale(old_left,old_right,old_top,old_bottom,this.left(),this.right(),this.top(),this.bottom())
	}
	// this["_scale_"+axis] *= value
	// this.redraw()
	return this
}

GLO.Canvas.prototype.unscale = function(axis){
	if(typeof axis == "undefined"){
		this._scale_x = 1
		this._scale_y = 1
		this.redraw()
		return this
	}
	this["_scale_"+axis] = 1
	this.redraw()
	return this
}

GLO.Canvas.prototype.redraw = function(){

}


GLO.Canvas.prototype.width = function(value){
	if(!value){
		return this._width
	}
	this._width = value
	return this
}

GLO.Canvas.prototype.canvas_width = function(){
	return this.width()-2*this.x_buffer()-this.y_axis_width
}

GLO.Canvas.prototype.canvas_height = function(){
	return this.height()-2*this.y_buffer()-this.x_axis_height
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


GLO.Canvas.prototype.show_x_axis = function(value){
	if(typeof value === "undefined"){
		return this._show_x_axis
	}
	this._show_x_axis = value

	this.update_axes()

	return this
}

GLO.Canvas.prototype.show_y_axis = function(value){
	if(typeof value === "undefined"){
		return this._show_y_axis
	}
	this._show_y_axis = value

	this.update_axes()

	return this
}

GLO.Canvas.prototype.x_axis_gen = function(value){
	if(typeof value === "undefined"){
		return this._x_axis_gen
	}
	this._x_axis_gen = value

	this.update_axes()

	return this
}

GLO.Canvas.prototype.y_axis_gen = function(value){
	if(typeof value === "undefined"){
		return this._y_axis_gen
	}
	this._y_axis_gen = value

	this.update_axes()

	return this
}

GLO.Canvas.prototype.update_axes = function(){
	if(this.show_x_axis()==true){
		this.draw_x_axis()
	}else{
		this.x_axis_g.html("")
	}

	if(this.show_y_axis()==true){
		this.draw_y_axis()
	}else{
		this.y_axis_g.html("")
	}

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
	return this.height()-this.y_buffer()-this.x_axis_height
}

GLO.Canvas.prototype.middle = function(){
	return (this.height()-2*this.y_buffer()-this.x_axis_height)/2
}

GLO.Canvas.prototype.left = function(){
	return this.y_axis_width + this.x_buffer()
}

GLO.Canvas.prototype.center = function(){
	return this.y_axis_width+this.x_buffer()+(this.width()-this.y_axis_width-2*this.x_buffer())/2
}

GLO.Canvas.prototype.right = function(){
	return this.width()-this.x_buffer()
}



GLO.Canvas.prototype._draw_debug_markers = function(){
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
}


GLO.Canvas.prototype.clone = function(x_offset, y_offset){
	var self = this
	var new_canvas = new GLO.Canvas(self.glo,self.width(),self.height(),x_offset, y_offset)
	new_canvas.init_empty()

	var orig_to_clone_map = new Map() //old_gen_id --> new_gen
	var orig_to_clone_map_edges = new Map()
	for(var gen of self.node_generations.values()){
		var clone_gen = gen.clone(new_canvas)
		orig_to_clone_map.set(gen.gen_id, clone_gen)
	}
	for(var gen of self.edge_generations.values()){
		var clone_gen = gen.clone(new_canvas)
		orig_to_clone_map_edges.set(gen.gen_id, clone_gen)
		clone_gen.source_generation(orig_to_clone_map.get(clone_gen.source_generation().gen_id))
		clone_gen.target_generation(orig_to_clone_map.get(clone_gen.target_generation().gen_id))
	}

	new_canvas.active_node_generation(orig_to_clone_map.get(self.active_node_generation().gen_id))
	new_canvas.active_edge_generation(orig_to_clone_map_edges.get(self.active_edge_generation().gen_id))

	new_canvas.x_axis_gen(orig_to_clone_map.get(self.x_axis_gen().gen_id))
	new_canvas.y_axis_gen(orig_to_clone_map.get(self.y_axis_gen().gen_id))
	
	new_canvas.show_x_axis(self.show_x_axis())
	new_canvas.show_y_axis(self.show_y_axis())

	return new_canvas
}

GLO.Canvas.prototype.init = function(){
	this.chart = this.glo.svg.append("g")
		.attr("transform","translate("+this.x_offset()+","+this.y_offset()+")")


	// this._draw_debug_markers()




	this.x_axis_g = this.chart.append("g")
		.attr("class","x axis")
		.attr("transform","translate("+0+","+ this.bottom() + ")")

	this.y_axis_g = this.chart.append("g")
		.attr("class","y axis")
		.attr("transform","translate("+(this.x_buffer()+this.y_axis_width)+","+0+")")



	//append edgeg first so that it is under the nodes
	var init_edges = new GLO.EdgeGeneration(this,this.glo.edges(),false)
	init_edges.init_svg()
	this.active_edge_generation(init_edges)



	var init_nodes = new GLO.NodeGeneration(this,this.glo.nodes(),false);
	init_nodes.init_svg().init_props().init_draw()
	this.active_node_generation(init_nodes)
	this.x_axis_gen(init_nodes)
	this.y_axis_gen(init_nodes)

	init_edges
		.source_generation(init_nodes)
		.target_generation(init_nodes)
		.init_props()
		.init_draw()

	return this
}

GLO.Canvas.prototype.update_chart = function(){
	this.chart
		.attr("transform","translate("+this.x_offset()+","+this.y_offset()+")")
}


GLO.Canvas.prototype.init_empty = function(){
	this.chart = this.glo.svg.append("g")
		.attr("transform","translate("+this.x_offset()+","+this.y_offset()+")")


	// this._draw_debug_markers()




	this.x_axis_g = this.chart.append("g")
		.attr("class","x axis")
		.attr("transform","translate("+0+","+ this.bottom() + ")")

	this.y_axis_g = this.chart.append("g")
		.attr("class","y axis")
		.attr("transform","translate("+(this.x_buffer()+this.y_axis_width)+","+0+")")


	return this
}


GLO.Canvas.prototype.draw_x_axis = function(){
	var xaxis = d3.svg.axis()
		.scale(this.x_axis_gen().x_scale)
		.orient("bottom")

	this.x_axis_g.call(xaxis)

	return this
}

GLO.Canvas.prototype.draw_y_axis = function(){
	var yaxis = d3.svg.axis()
		.scale(this.y_axis_gen().y_scale)
		.orient("left")

	this.y_axis_g.call(yaxis)

	return this
}



GLO.Canvas.prototype.partition = function(axis,scaler){
	var self = this

	var width = self.width()
	var height = self.height()
	self.scale(axis, 1/scaler)
	
	for(var i=1; i<scaler; i++){
		var x_offset = 0
		var y_offset = 0
		if(axis=="x"){
			x_offset = self.x_offset() + ((width/scaler)*i)
			y_offset = self.y_offset()
		}
		if(axis=="y"){
			x_offset = self.x_offset()
			y_offset = self.y_offset() + ((height/scaler)*i)
		}
		var new_canvas = self.clone(x_offset, y_offset)
	}

}
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
	if(extent[0]<0 && extent[1]>=0){
		scale
			.domain([extent[0], 0, extent[1]])
			.range(["red", "#FDFDFD", "#000"])
	}else if(extent[0]>=0){
		scale
			.domain(extent)
			.range(["#FDFDFD", "#000"])
	}else{// extent[0]=0
		scale
			.domain(extent)
			.range(["red", "#FDFDFD"])
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

	self.nodes.forEach(function(d){
		d.x = self.canvas.center()
		d.y = self.canvas.middle()
	})

	var force = cola.d3adaptor()
	// var force = d3.layout.force()
		// .linkDistance(30)
		.size([self.canvas.canvas_width(),self.canvas.canvas_height()])
		.nodes(self.nodes)
		.links(edges)
		// .jaccardLinkLengths(40,0.7)
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
			if(d.x_list[self.gen_id]-self.canvas.center() <.001 && d.y_list[self.gen_id]-self.canvas.middle()<.001){
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
			if(d.x_list[self.gen_id]-self.canvas.center() <.001 && d.y_list[self.gen_id]-self.canvas.middle()<.001){
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
			if(d.x_list[self.gen_id]-self.canvas.center() <.001 && d.y_list[self.gen_id]-self.canvas.middle()<.001){
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

	var invert = false
	if(typeof opts === "undefined" || typeof opts.invert == true){
		invert = true
	}

	self.nodes.sort(function(a,b){
		var val
		if(_.isNumber(a[by_prop])){
			val = a[by_prop]-b[by_prop]
		}else{
			val = a[by_prop].localeCompare(b[by_prop])
		}
		if (val==0){
			val = a.id-b.id
		}
		if(invert==true){
			val = -1*val
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
				group.distribute(axis,by_prop,opts)
			else
				group.distribute(axis,null,opts)
		})
		return this
	}

	var self = this


	if(typeof by_prop === "undefined" || by_prop == null){
		by_prop = "id"
	}

	var invert = false
	if(typeof opts !== "undefined" && typeof opts.invert !== "undefined"){
		invert = opts.invert
	}

	self.nodes.sort(function(a,b){
		var val
		if(_.isNumber(a[by_prop])){
			val = a[by_prop]-b[by_prop]
		}else{
			val = a[by_prop].localeCompare(b[by_prop])
		}
		if (val==0){
			val = a.id-b.id
		}
		if(invert){
			val *= -1
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
			if(d.x_list[self.gen_id]-self.canvas.center() <.001 && d.y_list[self.gen_id]-self.canvas.middle()<.001){
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
			group.distribute_on_within(axis,within_prop,by_prop,opts)
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

	invert = false
	if(typeof opts !== "undefined" && typeof opts.invert !== "undefined"){
		invert = opts.invert
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
				val = a.id-b.id
			}
			if(invert==true){
				val = -1*val
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

	if(typeof by_prop === "undefined" || by_prop == null){
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
				if(d.x_list[self.gen_id]-self.canvas.center() <.001 && d.y_list[self.gen_id]-self.canvas.middle()<.001){
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
GLO.EdgeGeneration = function(canvas, edges, is_aggregated){
	this.canvas = canvas
	this.edges = edges
	this.is_aggregated = is_aggregated || false

	this.gen_id = this.canvas.glo._next_edge_gen()

	this.canvas.edge_generations.set(this.gen_id, this)



	this._edge_format = "straight_lines"
	this._show_mode = "show_all_edges"

	this._is_displayed = true

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
		if(this._source_generation.gen_id != this._target_generation.gen_id){
			this._source_generation.remove_listener(this)
		}
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
		if(this._target_generation.gen_id != this._source_generation.gen_id){
			this._target_generation.remove_listener(this)
		}
	}
	this._target_generation = value.get_root_source_gen()
	this._target_generation.add_listener(this)
	this.update()
	return this
}



GLO.EdgeGeneration.prototype.update = function(){
	var self = this

	if(typeof this.edge_glyphs === "undefined"){ return this; }

	var min_dimension = Math.min(this.canvas.canvas_width(),this.canvas.canvas_height())
	this.max_link_curve_r = .5 * Math.sqrt(min_dimension)
	this.hscale = d3.scale.linear()
		.range([3,this.max_link_curve_r])
		.domain([0,min_dimension])

	if(this.is_aggregated){
		for(var [n,list] of this.aggregate_edge_map){
			for(var d in list){
				d = list[d]
				d.show_mode_list[self.aggregate_source_generation.gen_id] = n.show_mode_list[self.gen_id]
				d.edge_format_list[self.aggregate_source_generation.gen_id] = n.edge_format_list[self.gen_id]
			}
		}

		this.aggregate_source_generation.source_generation(this.source_generation())
		this.aggregate_source_generation.target_generation(this.target_generation())
	}

	
	this.edge_glyphs.transition()
		.each(function(d){
			self[d.show_mode_list[self.gen_id]](d)
			self[d.edge_format_list[self.gen_id]+"_fill"](d)
		})
		.attr("d", function(d){
			return self[d.edge_format_list[self.gen_id]](d)
		})
		.style("fill", function(d){
			return d.fill_list[self.gen_id]
		})
		.style("stroke-width", function(d){
			return d.stroke_width_list[self.gen_id]
		})
		.style("stroke", function(d){
			return d.stroke_list[self.gen_id]
		})
		

	this.edge_glyphs
		.style("display", function(d){
			return d.display_list[self.gen_id]
		})
		.style("opacity", function(d){
			return d.opacity_list[self.gen_id]
		})

		

	return this
}


GLO.EdgeGeneration.prototype.color_by_preset_constant = function(){
	var self = this

	this.edges.forEach(function(d){
		d.color_list[self.gen_id] = self.default_stroke
	})

	this.update()
	return this
}




GLO.EdgeGeneration.prototype.color_by_constant = function(constant){
	var self = this

	this.edges.forEach(function(d){
		d.color_list[self.gen_id] = constant
	})

	this.update()
	return this
}


GLO.EdgeGeneration.prototype.color_by = function(attr){
	var self = this

	var type, short_attr
	if(attr == "source" || attr == "target"){
		type = "color"
	}else{
		type = this.canvas.glo.edge_attr()[attr]
	}

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

GLO.EdgeGeneration.prototype.color_by_continuous = function(attr){
	var self = this

	var extent = d3.extent(this.edges.map(function(d){
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
	

	this.edges.forEach(function(d){
		d.color_list[self.gen_id] = scale(d[attr])
	})

	this.color_scale = scale

	this.update()
	return this
}

GLO.EdgeGeneration.prototype.color_by_discrete = function(attr){
	var self = this

	var scale = d3.scale.category10()

	this.edges.forEach(function(d){
		d.color_list[self.gen_id] = scale(d[attr])
	})

	this.color_scale = scale

	this.update()
	return this
}

GLO.EdgeGeneration.prototype.color_by_color_attr = function(attr){
	var self = this

	if(attr == "source" || attr == "target"){
		this.edges.forEach(function(d){
			d.color_list[self.gen_id] = d[attr].fill_list[self[attr+"_generation"]().gen_id]
		})
	}else{
		this.edges.forEach(function(d){
			d.color_list[self.gen_id] = d[attr]
		})
	}

	

	this.update()
	return this
}


GLO.EdgeGeneration.prototype.size_by_preset_constant = function(constant){
	var self = this
	this.edges.forEach(function(d){
		d.stroke_width_list[self.gen_id] = self.default_stroke_width
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


GLO.EdgeGeneration.prototype.is_displayed = function(value){
	if(typeof value == "undefined"){
		return this._is_displayed
	}
	this._is_displayed = value
	if(this._is_displayed==false){
		this.edge_g.style("display", "none")
	}else{
		this.edge_g.style("display", null)
	}
	return this
}



GLO.EdgeGeneration.prototype.clone = function(canvas){
	if(typeof canvas == "undefined"){
		canvas = this.canvas
	}

	var self = this

	var clone_gen = new GLO.EdgeGeneration(canvas, this.edges, this.is_aggregated)

	clone_gen.edges.forEach(function(d){
			//INTERNAL PROPERTIES
		d.stroke_width_list[clone_gen.gen_id] = d.stroke_width_list[self.gen_id]
		d.display_list[clone_gen.gen_id] = d.display_list[self.gen_id]
		d.color_list[clone_gen.gen_id] = d.color_list[self.gen_id]
		d.stroke_list[clone_gen.gen_id] = d.stroke_list[self.gen_id]
		d.fill_list[clone_gen.gen_id] = d.fill_list[self.gen_id]
		d.edge_format_list[clone_gen.gen_id] = d.edge_format_list[self.gen_id]
		d.show_mode_list[clone_gen.gen_id] = d.show_mode_list[self.gen_id]
	})

	// clone_gen.edge_format(self.edge_format())

	// clone_gen.show_mode(self.show_mode())
	clone_gen.source_generation(self.source_generation())
	clone_gen.target_generation(self.target_generation())

	if(this.is_aggregated){
		var agg_source_clone = this.aggregate_source_generation.clone(canvas)
		clone_gen.aggregate_source_generation = agg_source_clone

		clone_gen.aggregate_edge_map = new Map()
		for(var [n,list] of this.aggregate_edge_map){
			clone_gen.aggregate_edge_map.set(n,list)
		}
	}

	clone_gen
		.init_svg()
		.init_draw()
		.is_displayed(self.is_displayed())
		.update()

	clone_gen.canvas.active_edge_generation(clone_gen)

	return clone_gen
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
	source_gen.is_displayed(true)
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

		new_edge.color_list = new Map()
		new_edge.stroke_list = new Map()
		new_edge.stroke_width_list = new Map()
		new_edge.display_list = new Map()
		new_edge.fill_list = new Map()
		new_edge.opacity_list = new Map()
		new_edge.show_mode_list = new Map()
		new_edge.edge_format_list = new Map()

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
		new_edge.fill_list[agg_gen.gen_id] = list[0].fill_list[self.gen_id]
		new_edge.color_list[agg_gen.gen_id] = list[0].color_list[self.gen_id]

		new_edge.edge_format_list[agg_gen.gen_id] = list[0].edge_format_list[self.gen_id]
		new_edge.show_mode_list[agg_gen.gen_id] = list[0].show_mode_list[self.gen_id]


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


	agg_gen.source_generation(self.source_generation())
	agg_gen.target_generation(self.target_generation())

	this.canvas.active_edge_generation(agg_gen)

	agg_gen
		.init_svg()
		.init_draw()
		.is_displayed(self.is_displayed())
		.update()

	self.is_displayed(false)

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
			d.color_list[self.gen_id] = self.default_stroke
			d.display_list[self.gen_id] = null
			d.fill_list[self.gen_id] = "none"
			d.show_mode_list[self.gen_id] = "show_all_edges"
			d.edge_format_list[self.gen_id] = "straight_lines"

		})

	return this
}

GLO.EdgeGeneration.prototype.init_draw = function(){
	var self = this

	this.edge_glyphs.enter().append("svg:path")
		.classed("edge",true)
		.classed("edgegen-"+this.gen_id, true)
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
		.style("fill", function(d){
			return d.fill_list[self.gen_id]
		})
		.style("stroke-width", function(d){
			return d.stroke_width_list[self.gen_id]
		})
		.style("stroke", function(d){
			return d.stroke_list[self.gen_id]
		})
		.style("display", function(d){
			return d.display_list[self.gen_id]
		})
		.attr("d", function(d){

		})


	return this
}



GLO.EdgeGeneration.prototype.internal_external_edges = function(attr){
	var internal = []
	var external = []

	this.edges.forEach(function(d){
		if(d.source[attr]==d.target[attr]){
			internal.push(d)
		}else{
			external.push(d)
		}
	})

	return {"internal":internal, "external":external}
}



GLO.EdgeGeneration.prototype.edge_format = function(value,opts){
	var self = this
	if(typeof value === "undefined"){
		throw "Still asking for global edge_format"
		return this._edge_format
	}
	this._edge_format = value

	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var internal_edges = self.internal_external_edges(opts.group_by).internal
		internal_edges.forEach(function(d){
			d.edge_format_list[self.gen_id] = value
		})
		this.update()
		return this
	}

	this.edges.forEach(function(d){
		d.edge_format_list[self.gen_id] = value
	})

	this.update()
	return this
}


GLO.EdgeGeneration.prototype.squares = function(d){
	// TODO("position_edges_by") //x->y is hardcoded
	// TODO("size_edges_by") //Currently hard-coding square size

	var self = this

	var small_dimension = Math.min(self.canvas.canvas_width(),self.canvas.canvas_height())
	var large_node_length = Math.max(self.target_generation().get_leaf_target_gen().nodes.length,self.source_generation().get_leaf_target_gen().nodes.length)

	var square_size = small_dimension/large_node_length
	var half_square_size = square_size / 2


	// |---
	// |    non-relative move (M)
	var p = "M"
	p+= ""+(d.endx(self)-half_square_size)
	p+= ","
	p+= ""+(d.starty(self)-half_square_size)

	// ---|
	//    | relative move (m)
	p+=" l"
	p+= ""+(square_size)
	p+= ","
	p+= "0"

	//    |
	// ---| relative move (m)
	p+=" l"
	p+= "0"
	p+= ","
	p+= ""+(square_size)

	// |   
	// |--- relative move (m)
	p+=" l"
	p+= "-"+(square_size) //negative since moving left
	p+= ","
	p+= "0"

	p+= " z"


	return p
}

GLO.EdgeGeneration.prototype.squares_fill = function(d){
	var self = this
	d.fill_list[self.gen_id] = d.color_list[self.gen_id]
	d.stroke_list[self.gen_id] = null
}




GLO.EdgeGeneration.prototype.straight_lines = function(d){
	var self = this

	var p = "M"+ d.startx(self) + "," + d.starty(self)

	//control point
	var cx = (d.endx(self) + d.startx(self))/2
	var cy = (d.endy(self) + d.starty(self))/2
	
	p += " Q"+cx+","+cy+" "
	p += d.endx(self)+","+d.endy(self)


	return p
}

GLO.EdgeGeneration.prototype.straight_lines_fill = function(d){
	var self = this
	d.stroke_list[self.gen_id] = d.color_list[self.gen_id]
	d.fill_list[self.gen_id] = "none"
}


GLO.EdgeGeneration.prototype.curved_lines = function(d){
	var self = this

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
	if(rise==0 && run==0){
		dx = 0
		dy = 0
	}
	
	//Curve up or curve down
	var direction
	var ydir = (d.startx(self)<d.endx(self))?-1:1
	dy *= ydir
	var xdir = (d.starty(self)<d.endy(self))?-1:1
	dx *= xdir

	var cx_prime = cx + (dx*h)
	var cy_prime = cy + (dy*h)
	
	p += " Q"+cx_prime+","+cy_prime+" "
	p += d.endx(self)+","+d.endy(self)

	return p
}


GLO.EdgeGeneration.prototype.curved_lines_fill = function(d){
	var self = this
	d.stroke_list[self.gen_id] = d.color_list[self.gen_id]
	d.fill_list[self.gen_id] = "none"
}


GLO.EdgeGeneration.prototype.clear_directional_gradient = function(selection){
	var self = this

	selection.style("stroke", function(d){
		// return d.stroke_list[self.gen_id]
		return null
	})

	return this
}

GLO.EdgeGeneration.prototype.directional_gradient = function(selection){
	var self = this

	selection.each(function(d){
		if(d.endx(self).toFixed(12)==d.startx(self).toFixed(12)){
			if(d.endy(self)<d.starty(self)){
				d.stroke_list[self.gen_id] = "url(#up)"
			}else{
				d.stroke_list[self.gen_id] = "url(#down)"
			}
		}
		if(d.endy(self).toFixed(12)==d.starty(self).toFixed(12)){
			 if(d.endx(self)<d.startx(self)){
				d.stroke_list[self.gen_id] = "url(#right)"
			}else{
				d.stroke_list[self.gen_id] = "url(#left)"
			}
		}
		if(d.endx(self).toFixed(12)<d.startx(self).toFixed(12)){
			if(d.endy(self)<d.starty(self)){
				d.stroke_list[self.gen_id] = "url(#nxny)"
			}else{
				d.stroke_list[self.gen_id] = "url(#nxpy)"
			}
		}else{
			if(d.endy(self).toFixed(12)<d.starty(self).toFixed(12)){
				d.stroke_list[self.gen_id] = "url(#pxny)"
			}else{
				d.stroke_list[self.gen_id] = "url(#pxpy)"
			}
		}
	})

	return this
}



GLO.EdgeGeneration.prototype.show_mode = function(value,opts){
	var self = this
	if(typeof value === "undefined"){
		throw "Still asking for global show_mode"
		return this._show_mode
	}
	this._show_mode = value

	if(typeof opts !== "undefined" && typeof opts.group_by !== "undefined"){
		var internal_edges = self.internal_external_edges(opts.group_by).internal
		internal_edges.forEach(function(d){
			d.show_mode_list[self.gen_id] = value
		})
		this.update()
		return this
	}

	
	this.edges.forEach(function(d){
		d.show_mode_list[self.gen_id] = value
	})
	this.update()
	return this
}



GLO.EdgeGeneration.prototype.show_all_edges = function(d){
	var self = this
	d.display_list[self.gen_id] = null
	d.opacity_list[self.gen_id] = self.default_opacity
}

GLO.EdgeGeneration.prototype.show_faded_edges = function(d){
	var self = this
	d.display_list[self.gen_id] = null
	d.opacity_list[self.gen_id] = 0.05
}


GLO.EdgeGeneration.prototype.show_incident_edges = function(d){
	var self = this
	var source_hover = d.source.hover_value
	var target_hover = d.target.hover_value
	if(source_hover || target_hover){
		d.display_list[self.gen_id] = null
	}else{
		d.display_list[self.gen_id] = "none"
	}
	d.opacity_list[self.gen_id] = self.default_opacity
}

GLO.EdgeGeneration.prototype.show_faded_and_incident_edges = function(d){
	var self = this
	var source_hover = d.source.hover_value
	var target_hover = d.target.hover_value

	d.display_list[self.gen_id] = null

	if(source_hover || target_hover){
		d.opacity_list[self.gen_id] = self.default_opacity
	}else{
		d.opacity_list[self.gen_id] = 0.05
	}
}

GLO.EdgeGeneration.prototype.hide_edges = function(d){
	var self = this
	d.display_list[self.gen_id] = "none"
	d.opacity_list[self.gen_id] = self.default_opacity
}
// http://stackoverflow.com/questions/32219051/how-to-convert-cartesian-coordinates-to-polar-coordinates-in-js
function cartesian2polar(x, y){
	var distance = Math.sqrt(x*x + y*y)
	var radians = Math.atan2(y,x) //This takes y first
	var polarCoor = { rho:distance, theta:radians }
	return polarCoor
}

// http://stackoverflow.com/questions/8898720/cartesian-to-polar-coordinates
function polar2cartesian(rho, theta) {
	var x = rho * Math.cos(theta);
	var y= rho * Math.sin(theta);
	return {x:x, y:y}
}

/**
	Top-level glo object storing 
*/
GLO.GLO = function(svg){
	this.svg = svg;
	this._width = parseInt(svg.style("width"))
	this._height = parseInt(svg.style("height"))

	this.node_gen_counter = 0
	this.edge_gen_counter = 0
	this.canvas_id_counter = 0

	this.canvases = new Map()
	new GLO.Canvas(this,this.width(),this.height())
	// this.canvases.set(0, new GLO.Canvas(this,this.width(),this.height()))

	// this._active_canvas = 0

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
	if(typeof value == "undefined"){
		return this.canvases.get(this._active_canvas)
	}
	this._active_canvas = value
	return this
}

GLO.GLO.prototype.active_canvas_set = function(){
	var canvi = new Set()
	canvi.add (this.active_canvas())
	return canvi
}


GLO.GLO.prototype.correct_node_gens = function(opts){
	if(typeof opts !== "undefined"){
		if(typeof opts.all_canvases !== "undefined" && opts.all_canvases == true){
			if(typeof opts.all_gens !== "undefined" && opts.all_gens == true){
				return this.all_node_generations()
			}else{
				return this.all_active_node_generations()
			}
		}
		if(typeof opts.all_gens !== "undefined" && opts.all_gens == true){
				return this.current_node_generations()
		}
	}
	return this.active_node_generation()
}

GLO.GLO.prototype.correct_edge_gens = function(opts){
	if(typeof opts !== "undefined"){
		if(typeof opts.all_canvases !== "undefined" && opts.all_canvases == true){
			if(typeof opts.all_gens !== "undefined" && opts.all_gens == true){
				return this.all_edge_generations()
			}else{
				return this.all_active_edge_generations()
			}
		}
		if(typeof opts.all_gens !== "undefined" && opts.all_gens == true){
				return this.current_edge_generations()
		}
	}
	return this.active_edge_generation()
}

GLO.GLO.prototype.correct_canvases = function(opts){
	if(typeof opts !== "undefined"){
		if(typeof opts.all_canvases !== "undefined" && opts.all_canvases == true){
			return new Set(this.canvases.values())
		}
	}
	return this.active_canvas_set()
}


GLO.GLO.prototype.all_active_node_generations = function(){
	var gens = new Set()
	this.canvases.forEach(function(canvas){
		gens.add( canvas.active_node_generation() )
	})
	return gens
}


GLO.GLO.prototype.all_active_edge_generations = function(){
	var gens = new Set()
	this.canvases.forEach(function(canvas){
		gens.add( canvas.active_edge_generation() )
	})
	return gens
}


GLO.GLO.prototype.all_node_generations = function(){
	var gens = new Set()
	this.canvases.forEach(function(canvas){
		canvas.node_generations.forEach(function(gen){
			gens.add( gen )
		})
	})
	return gens
}

GLO.GLO.prototype.all_edge_generations = function(){
	var gens = new Set()
	this.canvases.forEach(function(canvas){
		canvas.edge_generations.forEach(function(gen){
			gens.add( gen )
		})
	})
	return gens
}


GLO.GLO.prototype.active_node_generation = function(){
	var gens = new Set()
	gens.add( this.active_canvas().active_node_generation() )
	return gens
}

GLO.GLO.prototype.active_edge_generation = function(){
	var gens = new Set()
	gens.add( this.active_canvas().active_edge_generation() )
	return gens
}

GLO.GLO.prototype.current_node_generations = function(){
	return new Set(this.active_canvas().node_generations.values())
}

GLO.GLO.prototype.current_edge_generations = function(){
	return new Set(this.active_canvas().edge_generations.values())
}

GLO.GLO.prototype._next_node_gen = function(){
	return this.node_gen_counter++;
}

GLO.GLO.prototype._next_edge_gen = function(){
	return this.edge_gen_counter++;
}

GLO.GLO.prototype._next_canvas_id = function(){
	return this.canvas_id_counter++;
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
		e.opacity_list = new Map()

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

		d.hover_value = false
		d.in_hover_value = false
		d.out_hover_value = false

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
function print(x) {
	console.log(x);
}
function TODO(x) {
	print("TODO: "+x)
}
function SHOULDDO(x){
	TODO(x)
}

/*
	For each function, the final parameter is an optional options
	parameter. It should be an object{} with any
	combination of the three options:
		* group_by:	discrete attribute name as string
		* all_gens:	boolean value, true to apply to all
								generations in current canvas
		* all_canvases:	boolean value, true to apply
										true to apply to all gens in all
										parititions

	For some functions, there are additional optional values
		* by: a sorting function used for index-based positioning
		* parts: number of partitions
		* invert: invert the sorting function
*/


/*************************
	******AGGREGATION*******
/*************************

// 2	aggregate edges by {discrete} and {discrete} using {method}
// 29	aggregate edges by {discrete} using {method}
/*
	Aggregates edges by attributes using method.
	* attr can be either a string for the attribute or a list
			of attributes.
*/
GLO.GLO.prototype.aggregate_edges_by = function(attr,method,opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.aggregate(attr,method)
	})
	return this
}

//84	deaggregate edges
/*
	Deaggregates the active generation and selects the generation
	previously aggregated to create the aggregation.
	If active generation is not aggregated, then nop
*/
GLO.GLO.prototype.deaggregate_edges = function(opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.deaggregate()
	})
	return this
}



// 52	aggregate nodes by {discrete} and {discrete} using {method}
// 113	aggregate nodes by {discrete} using {method}
/*
	Aggregates nodes by attribute(s) using method.
	* attr can be either a string for the attribute or a list
			of strings for attributes.
*/
GLO.GLO.prototype.aggregate_nodes_by = function(attr,method,opts){
	this.correct_node_gens(opts).forEach(function(gen){
		gen.aggregate(attr,method)
	})
	return this
}

//107	deaggregate nodes
/*
	Deaggregates the active generation and selects the generation
	previously aggregated to create the aggregation.
	If active generation is not aggregated, then nop
*/
GLO.GLO.prototype.deaggregate_nodes = function(opts){
	this.correct_node_gens(opts).forEach(function(gen){
		gen.deaggregate()
	})
	return this
}










/*************************
	******POSITIONING*******
/*************************



// 28	align edges {dir}
/*
	Aligns edges to a specificed direction.
	Shorthand for position_edges_by(constant)
*/
GLO.GLO.prototype.align_edges = function(dir,opts){
	TODO("align_edges")
	return this
}

//433	align nodes {dir}
/*
	Aligns nodes to a specified direction.
	Shorthand for position_nodes_by(constant)
*/
GLO.GLO.prototype.align_nodes = function(dir,opts){
	this.correct_node_gens(opts).forEach(function(gen){
		gen.align(dir,opts)
	})
	return this
}


//168	position edges by {attr},{attr}
/*
	Valid:
		source,target (assume x or y based on pos in args)
		source.x,target.y (e.g.)
		mean,mean -> mean(x),mean(y)
		mean(x),mean(y)
		mean(y),mean(x)

	Ideally enable mean(x)
*/
GLO.GLO.prototype.position_edges_by = function(xattr,yattr,opts){
	TODO("position_edges_by")
	return this
}

//728	position nodes on {axis} by {attr}

/*
	val is either a string attrID or a numerical constant
	theta constants are expressed in degrees, not radians
*/
GLO.GLO.prototype.position_nodes_on = function(axis,val,opts){
	if(opts && opts.invert){
		SHOULDDO("Invert flag for position (done for distribute)")
	}

	this.correct_node_gens(opts).forEach(function(gen){
		gen.position_on(axis,val,opts)
	})
	return this
}

//145	position nodes on {axis} by {constant}
GLO.GLO.prototype.position_nodes_by_constant_on = function(axis,opts){
	this.correct_node_gens(opts).forEach(function(gen){
		gen.position_by_preset_constant(axis,opts)
	})
	return this
}

//29	position nodes {dir} on {axis} (by {attr})
/*
	Utilizes by from opts
*/
GLO.GLO.prototype.position_nodes_evenly_stacked = function(direction,opts){
	SHOULDDO("position_nodes_evenly_stacked --- group_by")

	if(opts && opts.within){
		this.correct_node_gens(opts).forEach(function(gen){
			gen.stack_within(direction,opts.within,opts)
		})
		return this
	}

	this.correct_node_gens(opts).forEach(function(gen){
		gen.stack(direction,opts)
	})
	return this
}


//29	evenly distribute edges on {axis} (by {attr})
/*
	opts includes by option
*/
GLO.GLO.prototype.evenly_distribute_edges_on = function(axis,opts){
	TODO("evenly_distribute_edges_on")
	return this
}

//641	evenly distribute nodes on {axis} (by {attr})
/*
	opts includes by option
*/
GLO.GLO.prototype.evenly_distribute_nodes_on = function(axis,opts){
	if(opts && opts.within){
		this.correct_node_gens(opts).forEach(function(gen){
			if(opts && opts.by){
				gen.distribute_on_within(axis,opts.within,opts.by,opts)
			}else{
				gen.distribute_on_within(axis,opts.within,null,opts)
			}
		})
		return this
	}

	this.correct_node_gens(opts).forEach(function(gen){
		if(opts && opts.by){
			gen.distribute(axis,opts.by,opts)
		}else{
			gen.distribute(axis,null,opts)
		}
	})
	

	return this

}



//123	apply force-directed algorithm to nodes
/*
	
*/
GLO.GLO.prototype.apply_force_directed_algorithm_to_nodes = function(opts){
	var self = this
	this.correct_node_gens(opts).forEach(function(gen){
		gen.apply_force_directed(self.edges())
	})
	return this
}






/*************************
	******CLONING*******
/*************************



//107	clone edges
/*
	Clones the active generation of edges and selects the new
	generation as the active generation
*/
GLO.GLO.prototype.clone_edges = function(opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.clone()
	})
	return this
}

//234	clone nodes
/*
	Clones the active generation of nodes and selects the new
	generation as the active generation
*/
GLO.GLO.prototype.clone_nodes = function(opts){
	this.correct_node_gens(opts).forEach(function(gen){
		gen.clone()
	})
	return this
}



//36	select edge generation {num}
/*
	
*/
GLO.GLO.prototype.select_edge_generation = function(gen,opts){
	if(typeof opts !== "undefined"){
		opts.all_canvases = false
	}else{
		opts = {all_canvases: false}
	}
	var edge_gen = this.active_canvas().edge_generations.get(gen)
	this.active_canvas().active_edge_generation(edge_gen)
	return this
}

//88	select node generation {num}
/*
	
*/
GLO.GLO.prototype.select_node_generation = function(gen,opts){
	if(typeof opts !== "undefined"){
		opts.all_canvases = false
	}else{
		opts = {all_canvases: false}
	}
	var node_gen = this.active_canvas().node_generations.get(gen)
	this.active_canvas().active_node_generation(node_gen)
	return this
}



//78	set source generation {num}
/*
	
*/
GLO.GLO.prototype.set_source_generation = function(gen,opts){
	if(typeof opts !== "undefined"){
		opts.all_canvases = false
	}else{
		opts = {all_canvases: false}
	}
	var gen_inst = this.active_canvas().node_generations.get(gen)
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.source_generation(gen_inst)
	})
	return this
}

//217	set target generation {num}
/*
	
*/
GLO.GLO.prototype.set_target_generation = function(gen,opts){
	if(typeof opts !== "undefined"){
		opts.all_canvases = false
	}else{
		opts = {all_canvases: false}
	}
	var gen_inst = this.active_canvas().node_generations.get(gen)
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.target_generation(gen_inst)
	})
	return this
}





//41	remove edge generation {num}
/*
	Removes the provided edge generation
	Cannot remove the only generation. If so, nop.
	If gen is active generation, selects a different generation
*/
GLO.GLO.prototype.remove_edge_generation = function(gen,opts){
	TODO("remove_edge_generation")
	return this
}

//39	remove node generation {num}
/*
	Removes the provided node generation
	Cannot remove the only generation. If so, nop.
	If gen is active generation, selects a different generation
*/
GLO.GLO.prototype.remove_node_generation = function(gen,opts){
	TODO("remove_node_generation")
	return this
}



//156	remove all cloned edges
/*
	Removes all edges except a single generation and sets that
	generation as active.
*/
GLO.GLO.prototype.remove_all_cloned_edges = function(opts){
	TODO("remove_all_cloned_edges")
	return this
}

//219	remove all cloned nodes
/*
	Removes all nodes except a single generation and sets that
	generation as active.
*/
GLO.GLO.prototype.remove_all_cloned_nodes = function(opts){
	TODO("remove_all_cloned_nodes")
	return this
}














/*************************
	*****GLYPHS******
/*************************





//29	draw convex hulls
/*
	group_by value in opts, otherwise convex hull for
	all nodes
*/
GLO.GLO.prototype.show_convex_hulls = function(opts){
	TODO("show_convex_hulls")
	return this
}

//28	remove convex hulls
/*
	
*/
GLO.GLO.prototype.hide_convex_hulls = function(opts){
	TODO("hide_convex_hulls")
	return this
}



//152	show all edges
/*
	
*/
GLO.GLO.prototype.show_all_edges = function(opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.show_mode("show_all_edges",opts)
	})
	return this
}

//27	show edges as faded
/*
	
*/
GLO.GLO.prototype.show_edges_as_faded = function(opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.show_mode("show_faded_edges",opts)
	})
	return this
}

//28	show edges as solid
/*
	
*/
GLO.GLO.prototype.show_edges_as_solid = function(opts){
	TODO("show_edges_as_solid")
	return this
}

//28	show faded and incident edges
/*
	All edges as shown as faded, except for incident edges
	to mousedover node shown as solid
*/
GLO.GLO.prototype.show_faded_and_incident_edges = function(opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.show_mode("show_faded_and_incident_edges",opts)
	})
	return this
}

//79	show incident edges
/*
	All edges hidden, except for incident edges
	to mousedover node shown as solid
*/
GLO.GLO.prototype.show_incident_edges = function(opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.show_mode("show_incident_edges",opts)
	})
	return this
}


//79	hide edges
/*
	
*/
GLO.GLO.prototype.hide_edges = function(opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.show_mode("hide_edges",opts)
	})
	return this
}

//28	display edges as bars
/*
	
*/
GLO.GLO.prototype.display_edges_as_bars = function(opts){
	TODO("display_edges_as_bars")
	return this
}

//213	display edges as curved lines
/*
	
*/
GLO.GLO.prototype.display_edges_as_curved_lines = function(opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.edge_format("curved_lines",opts)
	})
	return this
}

//28	display edges as in-out-links
/*
	
*/
GLO.GLO.prototype.show_edges_as_in_out_links = function(opts){
	TODO("show_edges_as_in_out_links. Falling back to show incident edges")
	this.show_incident_edges(opts)
	return this
}


//148	display edges as squares
/*
	
*/
GLO.GLO.prototype.display_edges_as_squares = function(opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.edge_format("squares",opts)
	})
	return this
}

//165	display edges as straight lines
/*
	
*/
GLO.GLO.prototype.display_edges_as_straight_lines = function(opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.edge_format("straight_lines", opts)
	})
	return this
}

//28	display edges as y->x right-angles
/*
	dirarr is a 2d array of directions (left,right,top,bottom)
	the angle is drawn from either the min or the max of x
	to either the min or the max of y based upon
*/
GLO.GLO.prototype.display_edges_as_right_angles = function(opts){
	TODO("display_edges_as_right_angles")
	return this
}

//28	display edges as {attr} labels
/*
	
*/
GLO.GLO.prototype.display_edges_as_labels = function(attr,opts){
	TODO("display_edges_as_labels")
	return this
}



//89	display nodes as bars
/*
	
*/
GLO.GLO.prototype.display_nodes_as_bars = function(opts){
	TODO("display_nodes_as_bars")
	return this
}

//208	display nodes as circles
/*
	
*/
GLO.GLO.prototype.display_nodes_as_circles = function(opts){
	TODO("display_nodes_as_circles")
	return this
}

//237	display nodes as {attr} labels
/*
	
*/
GLO.GLO.prototype.display_nodes_as_labels = function(attr,opts){
	TODO("display_nodes_as_labels")
	return this
}



//202	size edges by {attr}
//29	size edges by {attr} and {attr}
//199	size edges by {constant}
/*
	attr can be either an attrID, 2-element array of attrIDs,
	3-element array of attrIDs, or a number.
	2-element is source-end-->target-end.
	3-element is source-end, middle, target-end.
	number is a constant

	If non-line-based edge display (e.g. label, square, bar), only
	first attrID is used.
*/
GLO.GLO.prototype.size_edges_by = function(attr,opts){
	SHOULDDO("size edges by multiple attrs")
	SHOULDDO("size square edges")
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.size_by(attr)
	})
	return this
}


GLO.GLO.prototype.size_edges_by_constant = function(attr,opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.size_by_preset_constant()
	})
	return this
}


//242	size nodes by {attr}
/*
	attr is a string attrID
*/
GLO.GLO.prototype.size_nodes_by = function(attr,opts){
	this.correct_node_gens(opts).forEach(function(gen){
		gen.size_by(attr)
	})
	return this
}

//162	size nodes by {constant}
GLO.GLO.prototype.size_nodes_by_constant = function(opts){
	this.correct_node_gens(opts).forEach(function(gen){
		gen.size_by_preset_constant()
	})
	return this
}





//162	rotate nodes {num} degrees
/*
	Rotates nodes clockwise deg degrees
*/
GLO.GLO.prototype.rotate_nodes = function(deg,opts){
	TODO("rotate_nodes")
	return this
}



//28	set edge waypoint edge generation {num}
/*
	
*/
GLO.GLO.prototype.set_edge_waypoint_edge_generation = function(gen,opts){
	TODO("set_edge_waypoint_edge_generation")
	return this
}



//28	remove all edge waypoints
/*
	
*/
GLO.GLO.prototype.remove_all_edge_waypoints = function(opts){
	TODO("remove_all_edge_waypoints")
	return this
}


















/*************************
	******COLORING ELEMENTS*
/*************************


//249	color edges by {attr}
//28	color edges by {attr}->{attr}
/*
	Colors edges by an appropriate color choice for attr:
		discrete
		continuous
		divergent
	attr can also be a 2-item array where the first item is the
	source-end color and the second item is the target-end color
*/
GLO.GLO.prototype.color_edges_by = function(attr,opts){
	SHOULDDO("color_edges_by Multiple Attributes")
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.color_by(attr)
	})
	return this
}


GLO.GLO.prototype.color_edges_by_two = function(attr,opts){
	TODO("color edges by two")
}


//196	color edges by {constant}
/*
	Colors edges by a constant
	constant should be an HTML-recognizable color string
*/
GLO.GLO.prototype.color_edges_by_constant = function(opts){
	this.correct_edge_gens(opts).forEach(function(gen){
		gen.color_by_preset_constant()
	})
	return this
}

//144	color nodes by {attr}
/*
	Colors nodes by an appropriate color choice for attr:
		discrete
		continuous
		divergent
*/
GLO.GLO.prototype.color_nodes_by = function(attr,opts){
	this.correct_node_gens(opts).forEach(function(gen){
		gen.color_by(attr)
	})
	return this
}

//149	color nodes by {constant}
/*
	Colors nodes by a constant
	constant should be an HTML-recognizable color string
*/
GLO.GLO.prototype.color_nodes_by_constant = function(opts){
	this.correct_node_gens(opts).forEach(function(gen){
		gen.color_by_preset_constant()
	})
	return this
}


//29	color convex hulls by {attr}
/*

*/
GLO.GLO.prototype.color_convex_hulls_by = function(attr,opts){
	TODO("color_convex_hulls_by")
	return this
}


/*
	Colors hulls by a constant
	constant should be an HTML-recognizable color string
*/
GLO.GLO.prototype.color_convex_hulls_by_constant = function(constant,opts){
	TODO("color_convex_hulls_by_constant")
	return this
}
















/*************************
		***PARTITIONS**
/*************************


//198	partition canvas on {axis} (by {num})
/*
	Partitions the current display along the given axis
	all gens in the current display are cloned into the new display.
	Default is a 2-way split; the by option can be used to specify a
	larger number (parts). Splits are always even.
*/
GLO.GLO.prototype.partition_on = function(axis,opts){
	var scaler
	if(typeof opts != "undefined" && typeof opts.parts != "undefined"){
		scaler = opts.parts * 1.0
	}else{
		scaler = 2.0
	}

	this.correct_canvases(opts).forEach(function(canvas){
		canvas.partition(axis,scaler)
	})
	return this
}




//58	filter partition canvas on {axis} by {discrete}
/*
	opts includes by option
	if not included, then equiv. to partition(2)
*/
GLO.GLO.prototype.filter_partition_on = function(axis,opts){
	TODO("filter_partition_on")
	return this
}


//175	select canvas {num}
/*
	Selects the provided canvas
	Selects the most recent active generations of that canvas
*/
GLO.GLO.prototype.select_canvas = function(canvas,opts){
	this.active_canvas(canvas)
	return this
}

//3	select column {num}
/*
	Selects the active generations of all canvases in col
*/
GLO.GLO.prototype.select_column = function(col,opts){
	TODO("select_column")
	return this
}


//117	select row {num}
/*
	Selects the active generations of all canvases in row
*/
GLO.GLO.prototype.select_row = function(row,opts){
	TODO("select_row")
	return this
}




//55	remove canvas {num}
/*
	TODO: Figure this out
*/
GLO.GLO.prototype.remove_canvas = function(canvas,opts){
	TODO("remove_canvas")
	return this
}


//115	remove all partitions
/*
	Removes all partitions. Generations in removed partitions
	are cloned into the remaining partition
*/
GLO.GLO.prototype.remove_all_partitions = function(opts){
	TODO("remove_all_partitions")
	return this
}



//56	show meta {axis} axis
/*
	
*/
GLO.GLO.prototype.show_meta_axis = function(axis,opts){
	TODO("show_meta_axis")
	return this
}



//56	hide meta {axis} axis
/*
	meta axis used for filter_partitions
*/
GLO.GLO.prototype.hide_meta_axis = function(axis,opts){
	TODO("hide_meta_axis")
	return this
}





















/*************************
	***DISPLAY PROPERTIES**
/*************************


//224	show {axis} axis
/*
	
*/
GLO.GLO.prototype.show_axis = function(axis,opts){
	this.correct_canvases(opts).forEach(function(canvas){
		if(axis=="x"){
			canvas.show_x_axis(true)
		}else if(axis=="y"){
			canvas.show_y_axis(true)
		}else{
			throw "Invalid axis for showing. Only x and y permitted."
		}
	})
	return this
}


//213	hide {axis} axis
/*
	
*/
GLO.GLO.prototype.hide_axis = function(axis,opts){
	this.correct_canvases(opts).forEach(function(canvas){
		if(axis=="x"){
			canvas.show_x_axis(false)
		}else if(axis=="y"){
			canvas.show_y_axis(false)
		}else{
			throw "Invalid axis for showing. Only x and y permitted."
		}
	})
	return this
}








/*************************
		***INTERACTION**
/*************************


/*
	Highlights neighbors
*/
GLO.GLO.prototype.highlight_neighbors = function(opts){
	this.correct_node_gens(opts).forEach(function(gen){
		gen.highlight_neighbors(true)
	})
	return this
}


//28	highlight in-out neighbors
/*
	Highlights in- and out- neighbors differently
*/
GLO.GLO.prototype.highlight_in_out_neighbors = function(opts){
	TODO("highlight_in_out_neighbors")
	return this
}



//28	stop highlight in-out neighbors
/*
	
*/
GLO.GLO.prototype.stop_highlighting = function(opts){
	this.correct_node_gens(opts).forEach(function(gen){
		gen.highlight_neighbors(false)
	})
	return this
}



GLO.GLO.prototype.Technique_Force_Directed = function(){
	this.display_nodes_as_circles()
	this.display_edges_as_straight_lines()
	this.show_all_edges()
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.color_edges_by_constant()
	this.color_nodes_by_constant()
	this.apply_force_directed_algorithm_to_nodes()

	return this
}


GLO.GLO.prototype.Technique_Matrix_Plot = function(sort_attr,edge_color_attr,label_attr){
	if(sort_attr==null){
    sort_attr = undefined;
	}
	this.color_nodes_by_constant()
	this.size_nodes_by_constant()
	this.evenly_distribute_nodes_on("y",{by:sort_attr,invert:true})
	this.align_nodes("left")
	this.display_nodes_as_labels(label_attr)
	this.clone_nodes()
	this.rotate_nodes(90)
	this.align_nodes("top")
	this.evenly_distribute_nodes_on("x",{by:sort_attr})
	this.set_target_generation(1)
	this.display_edges_as_squares()
	this.show_all_edges()
	this.size_edges_by_constant()
	this.color_edges_by(edge_color_attr)

	return this
}



GLO.GLO.prototype.Technique_Cluster_Circles = function(group_by_attr, internal_sort_attr){
	if(typeof internal_sort_attr == "undefined"){
    internal_sort_attr = undefined;
	}
	this.display_nodes_as_circles()
	this.show_all_edges()
	this.display_edges_as_straight_lines()
	this.color_edges_by_constant()
	this.color_nodes_by_constant()
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.evenly_distribute_nodes_on("theta",{by:group_by_attr})
	this.position_nodes_by_constant_on("rho")
	this.evenly_distribute_nodes_on("theta",{by:internal_sort_attr, group_by:group_by_attr})
	this.position_nodes_by_constant_on("rho",{group_by:group_by_attr})

	return this
}



GLO.GLO.prototype.Technique_Circle_Graph = function(sort_attr){
	this.display_nodes_as_circles()
	this.show_all_edges()
	this.display_edges_as_straight_lines()
	this.color_edges_by_constant()
	this.color_nodes_by_constant()
	this.size_edges_by_constant()
	this.size_nodes_by_constant()
	this.evenly_distribute_nodes_on("theta",{by:sort_attr})
	this.position_nodes_by_constant_on("rho")

	return this
}


GLO.GLO.prototype.Technique_GeneVis_A = function(position_attr){
	this.display_nodes_as_circles()
	this.hide_edges()
	this.position_nodes_on("theta",position_attr)
	this.position_nodes_by_constant_on("rho")
	this.size_nodes_by_constant()
	this.color_nodes_by_constant()

	return this
}

GLO.GLO.prototype.Technique_GeneVis_B = function(discrete1,attr2){
	this.display_nodes_as_circles()
	this.size_nodes_by_constant()
	this.color_nodes_by_constant()
	this.display_nodes_as_circles()
	this.show_all_edges()
	this.display_edges_as_curved_lines()
	this.size_edges_by_constant()
	this.color_edges_by_constant()
	this.position_nodes_on("y",discrete1)
	this.position_nodes_on("x",attr2)

	return this
}

GLO.GLO.prototype.Technique_Arc_Diagram = function(sort_attr, node_color_attr, edge_color_attr){
	this.display_nodes_as_circles()
	this.size_nodes_by_constant()
	this.color_nodes_by(node_color_attr)
	this.display_edges_as_curved_lines()
	this.size_edges_by_constant()
	this.color_edges_by(edge_color_attr)
	this.show_all_edges()
	this.align_nodes("middle")
	this.evenly_distribute_nodes_on("x",{by:sort_attr})

	return this
}


GLO.GLO.prototype.Technique_Matrix_Browser = function(){
	TODO("Matrix_Browswer")
}

GLO.GLO.prototype.Technique_Matrix_With_Bars = function(){
	TODO("Matrix_With_Bars")
}

GLO.GLO.prototype.Technique_Matrix_Explorer = function(sort_attr,edge_attr,label_attr,node_size_attr){
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.color_nodes_by_constant()
	this.show_all_edges()
	this.partition_on("x")
	this.display_nodes_as_bars()
	this.evenly_distribute_nodes_on("y",{by:sort_attr,invert:true})
	this.align_nodes("left")
	this.size_nodes_by(node_size_attr)
	this.clone_nodes()
	this.size_nodes_by_constant()
	this.display_nodes_as_labels(label_attr)
	this.select_node_generation(1)
	this.clone_nodes()
	this.rotate_nodes(90)
	this.align_nodes("top")
	this.evenly_distribute_nodes_on("x",{by:sort_attr})
	this.clone_nodes()
	this.size_nodes_by_constant()
	this.display_nodes_as_labels(node_size_attr)
	this.set_target_generation(4)
	this.display_edges_as_squares()
	this.color_edges_by(edge_attr)
	this.select_canvas(0)
	this.size_nodes_by(node_size_attr)
	this.size_edges_by(edge_attr)
	this.display_edges_as_straight_lines()
	this.color_edges_by_constant()
	this.apply_force_directed_algorithm_to_nodes()

	return this
}

GLO.GLO.prototype.Technique_NetLens = function(){
	TODO("Netlens")
}

GLO.GLO.prototype.Technique_Semantic_Substrates = function(discrete1,size_nodes_by_attr){
	this.display_nodes_as_circles()
	this.color_nodes_by(discrete1)
	this.show_incident_edges()
	this.size_nodes_by(size_nodes_by_attr)
	this.size_edges_by_constant()
	this.color_edges_by("target")
	this.position_nodes_on("y", discrete1)
	this.show_axis("y")
	this.evenly_distribute_nodes_on("x",{within:discrete1})
	this.display_edges_as_curved_lines()

	return this
}

GLO.GLO.prototype.Technique_PivotGraph = function(discrete1,discrete2,agg_method,size_attr,edge_size_attr,node_color_attr){
	if(typeof size_attr == "undefined" || size_attr == null){
		size_attr = "count"
	}
	if(typeof edge_size_attr == "undefined" || edge_size_attr == null){
		edge_size_attr = "count"
	}
	if(typeof node_color_attr == "undefined" || node_color_attr == null){
		node_color_attr = "in_degree"
	}
	this.display_nodes_as_circles()
	this.show_all_edges()
	this.aggregate_nodes_by([discrete1,discrete2],agg_method)
	this.size_nodes_by(size_attr)
	this.color_nodes_by(node_color_attr)
	this.aggregate_edges_by(["source."+discrete1,"source."+discrete2,"target."+discrete1,"target."+discrete2],agg_method)
	this.display_edges_as_curved_lines()
	this.size_edges_by(edge_size_attr)
	this.color_edges_by(edge_size_attr)
	this.position_nodes_on("y",discrete1)
	this.position_nodes_on("x",discrete2)
	this.show_axis("x")
	this.show_axis("y")

	return this
}

GLO.GLO.prototype.Technique_MatLink = function(sort_attr,edge_color_attr,label_attr){
	if(sort_attr==null){
    sort_attr = undefined;
	}
	this.color_nodes_by_constant()
	this.size_nodes_by_constant()
	this.display_nodes_as_labels(label_attr)
	this.evenly_distribute_nodes_on("y",{by:sort_attr, invert:true})
	this.align_nodes("left")
	this.display_edges_as_curved_lines()
	this.color_edges_by_constant()
	this.show_faded_and_incident_edges()
	this.clone_nodes()
	this.clone_edges()
	this.set_source_generation(1)
	this.set_target_generation(1)
	this.clone_edges()
	this.rotate_nodes(90)
	this.align_nodes("top")
	this.evenly_distribute_nodes_on("x",{by:sort_attr})
	this.set_source_generation(0)
	this.display_edges_as_squares()
	this.show_all_edges()
	this.size_edges_by_constant()
	this.color_edges_by_constant()

	return this
}


GLO.GLO.prototype.Technique_ListView = function(discrete1, sort_attr, label_attr){
	if(sort_attr==null){
    sort_attr = undefined;
	}
	this.display_nodes_as_labels(label_attr)
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.color_edges_by_constant()
	this.color_nodes_by_constant()
	this.position_nodes_on("x",discrete1)
	this.position_nodes_evenly_stacked("bottom",{by:sort_attr,within:discrete1})
	this.display_edges_as_straight_lines()
	this.show_faded_and_incident_edges()
	this.hide_edges({group_by:discrete1})
	this.show_axis("x")

	this.clone_edges()
	this.display_edges_as_curved_lines()
	this.hide_edges()
	this.show_faded_and_incident_edges({group_by:discrete1})

	return this
}


GLO.GLO.prototype.Techniques_Edge_Label_Centric = function(){
	TOOD("Edge Label Centric")
}


GLO.GLO.prototype.Technique_Honeycomb = function(discretes, agg_method, edge_color_attr, sort_attr){
	if(sort_attr==null){
    sort_attr = undefined;
	}
	var edge_agg_array = []
	if(Array.isArray(discretes)){
		discretes.forEach(function(attr){
			edge_agg_array.push("source."+attr)
			edge_agg_array.push("target."+attr)
		})
	}else{
		edge_agg_array.push("source."+discretes)
		edge_agg_array.push("target."+discretes)
	}
	this.show_all_edges()
	this.color_nodes_by_constant()
	this.size_nodes_by_constant()
	this.aggregate_nodes_by(discretes,agg_method)
	this.display_nodes_as_labels("label")
	this.align_nodes("left")
	this.evenly_distribute_nodes_on("y",{by:sort_attr, invert:true})
	this.clone_nodes()
	this.align_nodes("top")
	this.evenly_distribute_nodes_on("x",{by:sort_attr})
	this.set_target_generation(3)
	this.aggregate_edges_by(edge_agg_array, agg_method)
	this.display_edges_as_squares()
	this.color_edges_by(edge_color_attr)
	this.size_edges_by_constant()

	return this
}


GLO.GLO.prototype.Technique_GraphDice_Segment = function(attr1, attr2, size_nodes_attr){
	this.display_nodes_as_circles()
	this.position_nodes_on("x", attr1)
	this.position_nodes_on("y", attr2)
	this.size_nodes_by(size_nodes_attr)
	this.color_nodes_by_constant()
	this.display_edges_as_curved_lines()
	this.show_all_edges()
	this.size_edges_by_constant()
	this.color_edges_by_constant()
	this.show_axis("x")
	this.show_axis("y")

	return this
}


GLO.GLO.prototype.Technique_GraphDice_3x3 = function(attr1, attr2, attr3){
	/*
		0 1 2
		3 5 7
		4 6 8
	*/

	this.display_nodes_as_circles()
	this.show_all_edges()
	this.color_nodes_by_constant()
	this.color_edges_by_constant()
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.position_nodes_on("x",attr1)
	this.position_nodes_on("y",attr1)
	this.display_edges_as_curved_lines()
	// this.show_axis("x")
	// this.show_axis("y")
	this.partition_on("x",{parts:3})
	this.select_canvas(1)
	this.position_nodes_on("x",attr2)
	this.select_canvas(2)
	this.position_nodes_on("x",attr3)
	this.partition_on("y",{parts:3,all_canvases:true})

	this.select_canvas(3)
	this.position_nodes_on("y",attr2)
	this.select_canvas(5)
	this.position_nodes_on("y", attr2)
	this.select_canvas(7)
	this.position_nodes_on("y", attr2)

	this.select_canvas(4)
	this.position_nodes_on("y",attr3)
	this.select_canvas(6)
	this.position_nodes_on("y", attr3)
	this.select_canvas(8)
	this.position_nodes_on("y", attr3)

	return this
}


GLO.GLO.prototype.Technique_GMap = function(){
	TODO("GMap")
	return this
}

GLO.GLO.prototype.Technique_Attribute_Matrix = function(){
	TODO("Attribute_Matrix")
	return this
}

GLO.GLO.prototype.Technique_Sankey_Diagram = function(){
	TODO("Sankey Diagram")
	return this
}

GLO.GLO.prototype.Technique_EdgeMap_A = function(node_size_attr, node_color_attr){
	//"EdgeMap FD"

	this.display_nodes_as_circles()
	this.size_nodes_by(node_size_attr)
	this.size_edges_by_constant()
	this.color_nodes_by(node_color_attr)
	this.color_edges_by("source")
	this.display_edges_as_curved_lines()
	this.show_edges_as_in_out_links()
	this.highlight_neighbors()
	this.apply_force_directed_algorithm_to_nodes()

	return this
}

GLO.GLO.prototype.Technique_EdgeMap_B = function(sort_attr,node_size_attr,node_color_attr){
	// "EdgeMap Arc"

	this.display_nodes_as_circles()
	this.size_nodes_by(node_size_attr)
	this.size_edges_by_constant()
	this.color_nodes_by(node_color_attr)
	this.color_edges_by("source")
	this.display_edges_as_curved_lines()
	this.show_edges_as_in_out_links()
	this.align_nodes("middle")
	this.evenly_distribute_nodes_on("x",{by:sort_attr})

	return this
}

GLO.GLO.prototype.Technique_Hive_Plot = function(discrete1, attr2){
	this.display_nodes_as_circles()
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.color_edges_by_constant()
	this.color_nodes_by(discrete1)
	this.position_nodes_on("theta",discrete1)
	this.position_nodes_on("rho", attr2)
	this.display_edges_as_curved_lines()
	this.show_all_edges()
	return this
}


GLO.GLO.prototype.Technique_Hive_Panel_2x3 = function(discrete1, discrete2, attr1, attr2, attr3){
	/*
		0 1 2
		3 4 5
	*/

	this.display_nodes_as_circles()
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	
	this.color_nodes_by(discrete1)
	this.display_edges_as_curved_lines()
	this.show_faded_and_incident_edges()

	this.position_nodes_on("theta",discrete1)
	this.position_nodes_on("rho", attr1)

	this.partition_on("x",{parts:3})
	this.select_canvas(0)
	this.position_nodes_on("rho", attr1)
	this.select_canvas(1)
	this.position_nodes_on("rho", attr2)
	this.select_canvas(2)
	this.position_nodes_on("rho", attr3)

	this.partition_on("y",{parts:2, all_canvases:true})
	this.select_canvas(3)
	this.position_nodes_on("theta",discrete2)
	this.select_canvas(4)
	this.position_nodes_on("theta",discrete2)
	this.select_canvas(5)
	this.position_nodes_on("theta",discrete2)

	this.color_edges_by("source",{all_canvases:true})

	return this
}


GLO.GLO.prototype.Technique_Scatternet = function(attr1, attr2, color_nodes_attr){
	this.display_nodes_as_circles()
	this.display_edges_as_straight_lines()
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.color_edges_by_constant()
	this.color_nodes_by(color_nodes_attr)
	this.position_nodes_on("x", attr1)
	this.position_nodes_on("y", attr2)
	this.show_axis("x")
	this.show_axis("y")
	this.show_incident_edges()
	this.highlight_neighbors()

	return this
}


GLO.GLO.prototype.Technique_Citevis = function(discrete,color_attr,sort_attr){
	if(sort_attr==null){
    sort_attr = undefined;
	}
	this.display_nodes_as_circles()
	this.hide_edges()
	this.highlight_neighbors()
	this.size_nodes_by_constant()
	this.position_nodes_on("y",discrete)
	this.show_axis("y")
	this.position_nodes_evenly_stacked("left",{by:sort_attr, within:discrete, invert:true})
	this.color_nodes_by(color_attr)

	return this
}


GLO.GLO.prototype.Technique_DOSA = function(discrete, attr1, attr2){
	this.display_nodes_as_circles()
	this.color_nodes_by(discrete)
	// this.color_edges_by(["source","target"]) //proper
	this.color_edges_by("target") //working
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.position_nodes_on("x", attr1)
	this.position_nodes_on("y", attr2)
	this.display_edges_as_curved_lines()
	this.partition_on("x")
	this.aggregate_nodes_by(discrete,"mean")
	this.aggregate_edges_by(["source."+discrete,"target."+discrete],"mean")
	this.size_nodes_by("count")
	this.size_edges_by("count")

	return this
}


GLO.GLO.prototype.Technique_NodeTrix = function(discrete, label_attr, node_color_attr, edge_color_attr){
	this.color_nodes_by(node_color_attr)
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.color_edges_by(edge_color_attr)
	this.display_edges_as_curved_lines()
	this.position_nodes_by_constant_on("rho")
	this.evenly_distribute_nodes_on("theta",{by:discrete})
	this.position_nodes_by_constant_on("rho",{group_by:discrete})
	this.evenly_distribute_nodes_on("theta",{group_by:discrete})
	this.display_nodes_as_labels(label_attr)
	this.align_nodes("left",{group_by:discrete})
	this.evenly_distribute_nodes_on("y",{group_by:discrete,invert:true})
	this.clone_nodes()
	this.align_nodes("right",{group_by:discrete})
	this.clone_nodes()
	this.rotate_nodes(90)
	this.evenly_distribute_nodes_on("x",{group_by:discrete})
	this.align_nodes("top",{group_by:discrete})
	this.set_target_generation(2)
	this.clone_nodes()
	this.align_nodes("bottom",{group_by:discrete})
	// this.show_edges_as_faded()
	this.display_edges_as_curved_lines()
	this.display_edges_as_squares({group_by:discrete})
	// this.show_all_edges({group_by:discrete})
	// this.clone_edges()
	// this.hide_edges({group_by:discrete})
	// this.set_source_generation(2)
	// this.set_target_generation(0)
	return this
}
var figure_logo = function(glo){
	//width: 1000
	//height: 400
	glo
		.color_nodes_by("modularity_class")
		.size_nodes_by_constant()
		.color_edges_by_constant()
		.size_edges_by_constant()
		.show_edges_as_faded()
		.partition_on("x",{parts:3})

		.select_canvas(0)
		.evenly_distribute_nodes_on("theta",{by:"modularity_class"})
		.evenly_distribute_nodes_on("rho",{by:"modularity_class"})


		.select_canvas(1)
		.display_edges_as_squares()
		.align_nodes("left")
		.evenly_distribute_nodes_on("y",{by:"modularity_class",invert:true})
		.clone_nodes()
		.set_target_generation(3)
		.align_nodes("bottom")
		.evenly_distribute_nodes_on("x",{by:"modularity_class"})

		.select_canvas(2)
		.evenly_distribute_nodes_on("theta",{by:"modularity_class"})
		.position_nodes_by_constant_on("rho")
		.display_edges_as_curved_lines()

}


var figure_incident_pivotgraph = function(glo){
	glo
		.color_nodes_by("modularity_class")
		.Technique_PivotGraph("modularity_class","gender","mean")
		.show_incident_edges()
}

var figure_array_of_arcs = function(glo){
	glo
		.color_nodes_by("modularity_class")
		.position_nodes_on("y","modularity_class")
		.evenly_distribute_nodes_on("x",{within: "modularity_class"})
		.display_edges_as_curved_lines()
		.hide_edges()
		.show_all_edges({group_by:"modularity_class"})
}


var figure_not_within = function(glo){
	glo
		.color_nodes_by("modularity_class")
		.hide_edges()
		.position_nodes_on("y","modularity_class")
		.evenly_distribute_nodes_on("x",{by:"modularity_class"})
}

var figure_with_within = function(glo){
	glo
		.color_nodes_by("modularity_class")
		.hide_edges()
		.position_nodes_on("y","modularity_class")
		.evenly_distribute_nodes_on("x",{within:"modularity_class",by:"modularity_class"})
}

var figure_groupby_start = function(glo){
	glo
		.color_nodes_by("modularity_class")
		.hide_edges()
		.position_nodes_by_constant_on("rho")
		.evenly_distribute_nodes_on("theta",{by:"modularity_class"})
}

var figure_without_groupby = function(glo){
	glo
		.color_nodes_by("modularity_class")
		.hide_edges()
		.position_nodes_by_constant_on("rho")
		.evenly_distribute_nodes_on("theta",{by:"modularity_class"})
		.align_nodes("center")
}

var figure_with_groupby = function(glo){
	glo
		.color_nodes_by("modularity_class")
		.hide_edges()
		.position_nodes_by_constant_on("rho")
		.evenly_distribute_nodes_on("theta",{by:"modularity_class"})
		.align_nodes("center",{group_by:"modularity_class"})
}


var figure_cosine_curve = function(glo){
	glo
		.color_nodes_by("modularity_class")
		.hide_edges()
		.position_nodes_by_constant_on("rho")
		.evenly_distribute_nodes_on("theta",{by:"modularity_class"})
		.evenly_distribute_nodes_on("x",{by:"modularity_class"})
}

var figure_sideways_sine_curve = function(glo){
	glo
		.color_nodes_by("modularity_class")
		.hide_edges()
		.position_nodes_by_constant_on("rho")
		.evenly_distribute_nodes_on("theta",{by:"modularity_class"})
		.evenly_distribute_nodes_on("y",{by:"modularity_class"})
}


var figure_faded_and_incident_nodetrix = function(glo){
	glo.color_nodes_by("modularity_class")
	glo.size_nodes_by_constant()
	glo.size_edges_by_constant()
	glo.color_edges_by_constant()
	glo.display_edges_as_curved_lines()
	glo.position_nodes_by_constant_on("rho")
	glo.evenly_distribute_nodes_on("theta",{by:"modularity_class"})
	glo.position_nodes_by_constant_on("rho",{group_by:"modularity_class"})
	glo.evenly_distribute_nodes_on("theta",{group_by:"modularity_class"})
	glo.display_nodes_as_labels("label")
	glo.align_nodes("left",{group_by:"modularity_class"})
	glo.evenly_distribute_nodes_on("y",{group_by:"modularity_class",invert:true})
	glo.clone_nodes()
	glo.rotate_nodes(90)
	glo.evenly_distribute_nodes_on("x",{group_by:"modularity_class"})
	glo.align_nodes("top",{group_by:"modularity_class"})
	glo.set_target_generation(1)
	glo.color_edges_by("target")
	glo.show_faded_and_incident_edges()
	glo.display_edges_as_curved_lines()
	glo.display_edges_as_squares({group_by:"modularity_class"})
	glo.show_all_edges({group_by:"modularity_class"})
	glo.clone_edges()
	glo.hide_edges({group_by:"modularity_class"})
	glo.set_source_generation(1)
	glo.set_target_generation(0)
}


var figure_cool = function(glo){
	glo
		.color_nodes_by("modularity_class")
		.evenly_distribute_nodes_on("x")
		.evenly_distribute_nodes_on("y")
		.display_edges_as_curved_lines()

		.color_nodes_by("modularity_class")

		.evenly_distribute_nodes_on("x",{by:"modularity_class"})
		.evenly_distribute_nodes_on("y",{by:"modularity_class"})

		// .position_nodes_by_constant_on("rho")
		// .evenly_distribute_nodes_on("theta",{by:"modularity_class"})

		.position_nodes_by_constant_on("rho",{group_by:"modularity_class"})
		.evenly_distribute_nodes_on("theta",{group_by:"modularity_class"})

		.align_nodes("left",{group_by:"modularity_class"})
		.evenly_distribute_nodes_on("y",{group_by:"modularity_class"})
		.clone_nodes()
		.evenly_distribute_nodes_on("x",{group_by:"modularity_class"})
		.align_nodes("bottom",{group_by:"modularity_class"})
		.set_target_generation(1)

		.show_incident_edges()
		.display_edges_as_curved_lines()
		.display_edges_as_squares({group_by:"modularity_class"})
		.show_all_edges({group_by:"modularity_class"})

		.clone_edges()
		.hide_edges({group_by:"modularity_class"})
		.set_source_generation(1)
		.set_target_generation(0)
}


var cluster_matrix = function(glo, clustering_method, distance_attr){
	glo.Technique_Matrix_Plot(clustering_method, distance_attr)
	glo.color_nodes_by(clustering_method,{all_gens:true})
}


var sem_to_pivot = function(glo){
	var delay = 3000

	setTimeout(function(){
		glo.show_all_edges()
	},delay*0)

	setTimeout(function(){
		glo.position_nodes_on("x","gender")
	},delay*1)

	setTimeout(function(){
		glo.show_axis("x")
	},delay*2)


	setTimeout(function(){
		glo.aggregate_nodes_by(["modularity_class","gender"],"mean")
	},delay*3)

	setTimeout(function(){
		glo.size_nodes_by("count")
	},delay*4)



	setTimeout(function(){
		glo.aggregate_edges_by(["source.modularity_class","source.gender","target.modularity_class","target.gender"],"mean")
	},delay*5)

	setTimeout(function(){
		glo.size_edges_by("count")
	},delay*6)

	setTimeout(function(){
		glo.color_edges_by("count")
	},delay*7)
}
