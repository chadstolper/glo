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


GLO.NodeGroup.prototype.distribute = function(axis,by_prop){
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


GLO.NodeGroup.prototype.distribute_on_within = function(axis,within_prop,by_prop){
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
				d.y_list[self.gen.gen_id] = self.coordinates.top()
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
				d.y_list[self.gen.gen_id] = self.coordinates.bottom()
			})
	}

	if(dir=="left"){
		this.nodes
			.forEach(function(d){
				d.x_list[self.gen.gen_id] = self.coordinates.left()
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
				d.x_list[self.gen.gen_id] = self.coordinates.right()
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