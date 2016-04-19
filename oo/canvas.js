/**
	Canvas object with width, height, and buffers.
	Stores node and edge generations.
*/
GLO.Canvas = function(glo,width,height,x_offset,y_offset){
	this.glo = glo;
	this.width = width;
	this.height = height;
	this.x_offset = x_offset || 0
	this.y_offset = y_offset || 0

	this.x_buffer = 0
	this.y_buffer = 0

	this.node_generations = {}
	this.edge_generations = {}

	this.xscale;
	this.yscale;

	return this
}


GLO.Canvas.prototype.axis_size = 20;



GLO.Canvas.prototype.x_buffer = function(value){
	if(!value){
		return this.x_buffer
	}
	this.x_buffer = value
	return this
}


GLO.Canvas.prototype.y_buffer = function(value){
	if(!value){
		return this.y_buffer
	}
	this.y_buffer = value
	return this
}


GLO.Canvas.prototype.x_offset = function(value){
	if(!value){
		return this.x_offset
	}
	this.x_offset = value
	return this
}


GLO.Canvas.prototype.y_offset = function(value){
	if(!value){
		return this.y_offset
	}
	this.y_offset = value
	return this
}





GLO.Canvas.prototype.init_svg = function(){
	this.chart = this.glo.svg.append("g")
		.attr("transform","translate("+this.x_offset + this.x_buffer+","+this.y_offset + this.y_buffer+")")

	this.x_axis_g = this.chart.append("g")
		.attr("class","x axis")
		.attr("transform","translate("+x_buffer+","+ (this.height+this.y_buffer+this.axis_size) + ")")

	this.y_axis_g = this.chart.append("g")
		.attr("class","y axis")
		.attr("transform","translate("+(this.x_buffer-this.axis_size)+","+this.y_buffer+")")


	//append edgeg first so that it is under the nodes
	this.edge_g = this.chart.append("g")
	this.node_g = this.chart.append("g")

}


GLO.Canvas.prototype.init_draw = function(){
	//Initialize node glyphs in center of display
	node_generations[0] = node = nodeg.selectAll(".node.gen-0")
			.data(graph.nodes, function(d){return d.id})
		.enter().append("circle")
			.classed("node",true)
			.classed("gen-"+0,true)
			.attr("nodeid", function(d){return d.id})
			.each(function(d){
				d.x = width/2
				d.y = height/2
			})
			.attr("r",function(d){
				if(modes.node_r=="constant"){
					d.r_list[0] = node_r_constant
				}else if(modes.node_r=="degree"){
					d.r_list[0] = d.degree+2
				}
				return d.r_list[0]
			})
			.attr("cx", function(d) { d.x_list[modes.active_generation]= d.x; return d.x_list[modes.active_generation]; })
			.attr("cy", function(d) { d.y_list[modes.active_generation] = d.y; return d.y_list[modes.active_generation]; })
			.each(function(d){
				d.radius_list[0] = Math.min(width,height)*.45
				d.theta_list[0] = Math.PI/2
			})
			.attr("fill", function(d){ return d3.rgb(color(d.modularity_class)).darker(); })
			.on("mouseover",function(d){
				d3.select(this).attr("fill",function(d){ return color(d.modularity_class); })
			})
			.on("mouseout",function(d){
				d3.select(this).attr("fill", function(d){ return d3.rgb(color(d.modularity_class)).darker(); })
			})
	node.append("title")
		.text(function(d){ return d.label; })


	//Initialize Edge Glyphs
	link = link_generations[0] = linkg.selectAll(".link[generation='0']")
			.data(graph.edges, function(d){return d.id})
		.enter().append("svg:path")
			.classed("link",true)
			.attr("generation",0)
			.attr("stroke-width", function(d) { return Math.sqrt(d.weight); })
			// .attr("class", function(d) { return "link " + d.type; })
			// .attr("marker-end", function(d) { return "url(#arrow)"; })
			.on("mouseover",function(d){
				d3.select('.node.gen-'+modes.source_generation+'[nodeid="'+d.source.id+'"]').attr("fill", color(d.source.modularity_class) )
				d3.select('.node.gen-'+modes.target_generation+'[nodeid="'+d.target.id+'"]').attr("fill", color(d.target.modularity_class) )
			})
			.on("mouseout",function(d){
				d3.select('.node.gen-'+modes.source_generation+'[nodeid="'+d.source.id+'"]').attr("fill", d3.rgb(color(d.source.modularity_class)).darker() )
				d3.select('.node.gen-'+modes.target_generation+'[nodeid="'+d.target.id+'"]').attr("fill", d3.rgb(color(d.target.modularity_class)).darker() )
			})
			.each(function(d){
					d.startx = function(){ return this.source.x_list[modes.source_generation]; }
					d.starty = function(){ return this.source.y_list[modes.source_generation]; }
					d.endx = function(){ return this.target.x_list[modes.target_generation]; }
					d.endy = function(){ return this.target.y_list[modes.target_generation]; }
			})
	link.call(link_function)
	select_generation(0)
}