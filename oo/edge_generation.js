GLO.EdgeGeneration = function(canvas, edges, is_aggregated){
	this.canvas = canvas
	this.edges = edges
	this.is_aggregated = is_aggregated || false

	this.gen_id = this.canvas.glo._next_edge_gen()

	this.canvas.edge_generations[this.gen_id] = this

	return this
}

GLO.EdgeGeneration.prototype.default_width = 1;



GLO.EdgeGeneration.prototype.source_generation = function(value){
	if(!value){
		return this._source_generation
	}
	this._source_generation = value
	return this
}

GLO.EdgeGeneration.prototype.target_generation = function(value){
	if(!value){
		return this._target_generation
	}
	this._target_generation = value
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
		.classed("edgegen",this.gen_id)
		.attr("stroke-width", this.default_width)
		.on("mouseover",function(d){
			d3.select('.node.gen-'+self.source_generation().gen_id()+'[nodeid="'+d.source.id+'"]')
				.attr("fill", "lightgrey" )
			d3.select('.node.gen-'+self.target_generation().gen_id()+'[nodeid="'+d.target.id+'"]')
				.attr("fill", "lightgrey" )
		})
		.on("mouseout",function(d){
			d3.select('.node.gen-'+self.source_generation().gen_id()+'[nodeid="'+d.source.id+'"]')
				.attr("fill", "black" )
			d3.select('.node.gen-'+self.source_generation().gen_id()+'[nodeid="'+d.target.id+'"]')
				.attr("fill", "black" )
		})
		.each(function(d){
				d.startx = function(){ return this.source.x_list[self.source_generation().gen_id]; }
				d.starty = function(){ return this.source.y_list[self.source_generation().gen_id]; }
				d.endx = function(){ return this.target.x_list[self.target_generation().gen_id]; }
				d.endy = function(){ return this.target.y_list[self.target_generation().gen_id]; }
		})

	this.straight_edges()
}


GLO.EdgeGeneration.prototype.straight_edges = function(){
	this.edge_glyphs
		.attr("d", function(d) {
			var p = "M"+ d.startx() + "," + d.starty()

			//control point
			var cx = (d.endx() + d.startx())/2
			var cy = (d.endy() + d.starty())/2
			
			p += "Q"+cx+","+cy+" "
			p += d.endx()+","+d.endy()


			return p
		});
}