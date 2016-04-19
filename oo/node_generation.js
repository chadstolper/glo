/**
	NodeGeneration object
*/
GLO.NodeGeneration = function(gen_id, nodes, canvas, is_aggregated){
	this.nodes = nodes
	this.gen_id = gen_id
	this.is_aggregated = is_aggregated || false

}

GLO.NodeGeneration.prototype.init_svg = function(){
	this.node_g = this.chart.append("g")
		.classed("nodeg",true)


	this.node_glyphs = this.node_g.selectAll(".node")
		.data(this.nodes, function(d){return d.id})
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

}

GLO.NodeGeneration.prototype.init_draw = function(){

}