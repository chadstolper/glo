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

	return this
}

GLO.NodeGeneration.prototype.default_r = 5


GLO.NodeGeneration.prototype.update = function(){
	var self = this
	this.nodes.forEach(function(d){
		d.x_list[self.gen_id] = d.x
		d.y_list[self.gen_id] = d.y
	})
	this.node_glyphs
		.attr("cx", function(d){ return d.x_list[self.gen_id]; })
		.attr("cy", function(d){ return d.y_list[self.gen_id]; })

	return this
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
			d.x_list[self.gen_id] = self.canvas.width()/2
			return d.x_list[self.gen_id];
		})
		.attr("cy", function(d) {
			d.y_list[self.gen_id] = self.canvas.height()/2
			return d.y_list[self.gen_id];
		})
		.each(function(d){
			d.radius_list[self.gen_id] = 0
			d.theta_list[self.gen_id] = Math.PI/2
		})
		.attr("fill", "black")

	return this
}