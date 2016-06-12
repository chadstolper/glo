
GLO.GLO.prototype.Technique_Force_Directed = function(){
	this.display_edges_as_straight_lines()
	this.show_all_edges()
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.color_edges_by_constant()
	this.apply_force_directed_algorithm_to_nodes()

	return this
}


GLO.GLO.prototype.Technique_Matrix_Plot = function(sort_attr,edge_color_attr){
	if(sort_attr==null){
		delete sort_attr
	}
	this.size_nodes_by_constant()
	this.evenly_distribute_nodes_on("y",{by:sort_attr,invert:true})
	this.align_nodes("left")
	this.clone_nodes()
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
		delete internal_sort_attr
	}
	this.show_all_edges()
	this.display_edges_as_straight_lines()
	this.color_edges_by_constant()
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.evenly_distribute_nodes_on("theta",{by:group_by_attr})
	this.position_nodes_by_constant_on("rho")
	this.evenly_distribute_nodes_on("theta",{by:internal_sort_attr, group_by:group_by_attr})
	this.position_nodes_by_constant_on("rho",{group_by:group_by_attr})

	return this
}



GLO.GLO.prototype.Technique_Circle_Graph = function(sort_attr){
	this.show_all_edges()
	this.display_edges_as_straight_lines()
	this.color_edges_by_constant()
	this.size_edges_by_constant()
	this.size_nodes_by_constant()
	this.evenly_distribute_nodes_on("theta",{by:sort_attr})
	this.position_nodes_by_constant_on("rho")

	return this
}


GLO.GLO.prototype.Technique_GeneVis_A = function(position_attr){
	this.hide_edges()
	this.position_nodes_on("theta",position_attr)
	this.position_nodes_by_constant_on("rho")
	this.size_nodes_by_constant()

	return this
}

GLO.GLO.prototype.Technique_GeneVis_B = function(discrete1,attr2){
	this.show_all_edges()
	this.display_edges_as_curved_lines()
	this.size_edges_by_constant()
	this.color_edges_by_constant()
	this.position_nodes_on("y",discrete1)
	this.position_nodes_on("x",attr2)

	return this
}

GLO.GLO.prototype.Technique_Arc_Diagram = function(sort_attr){
	this.display_edges_as_curved_lines()
	this.size_edges_by_constant()
	this.color_edges_by_constant()
	this.show_all_edges()
	this.align_nodes("middle")
	this.evenly_distribute_nodes_on("x",{by:sort_attr})

	return this
}


GLO.GLO.prototype.Technique_Matrix_Browswer = function(){
	TODO("Matrix_Browswer")
}

GLO.GLO.prototype.Technique_Matrix_With_Bars = function(){
	TODO("Matrix_With_Bars")
}

GLO.GLO.prototype.Technique_Matrix_Explorer = function(sort_attr,edge_color_attr){
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.partition_on("x")
	this.evenly_distribute_nodes_on("y",{by:sort_attr,invert:true})
	this.align_nodes("left")
	this.clone_nodes()
	this.align_nodes("top")
	this.evenly_distribute_nodes_on("x",{by:sort_attr})
	this.set_target_generation(2)
	this.display_edges_as_squares()
	this.show_all_edges()
	this.color_edges_by(edge_color_attr)
	this.select_canvas(0)
	this.display_edges_as_straight_lines()
	this.show_all_edges()
	this.color_edges_by_constant()
	this.apply_force_directed_algorithm_to_nodes()

	return this
}

GLO.GLO.prototype.Technique_NetLens = function(){
	TODO("Netlens")
}

GLO.GLO.prototype.Technique_Semantic_Substrates = function(discrete1,size_nodes_by_attr){
	this.color_nodes_by(discrete1)
	this.show_incident_edges()
	this.size_nodes_by(size_nodes_by_attr)
	this.position_nodes_on("y", discrete1)
	this.show_axis("y")
	this.evenly_distribute_nodes_on("x",{within:discrete1})
	this.display_edges_as_curved_lines()

	return this
}

GLO.GLO.prototype.Technique_PivotGraph = function(discrete1,discrete2,agg_method,size_attr,edge_size_attr){
	if(typeof size_attr == "undefined" || size_attr == null){
		size_attr = "count"
	}
	if(typeof edge_size_attr == "undefined" || edge_size_attr == null){
		edge_size_attr = "count"
	}
	this.color_nodes_by(discrete1)
	this.aggregate_nodes_by([discrete1,discrete2],agg_method)
	this.size_nodes_by(size_attr)
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

GLO.GLO.prototype.Technique_MatLink = function(sort_attr,edge_color_attr){
	if(sort_attr==null){
		delete sort_attr
	}
	this.size_nodes_by_constant()
	this.evenly_distribute_nodes_on("y",{by:sort_attr, invert:true})
	this.align_nodes("left")
	this.display_edges_as_curved_lines()
	this.show_incident_edges()
	this.clone_nodes()
	this.clone_edges()
	this.set_source_generation(1)
	this.set_target_generation(1)
	this.clone_edges()
	this.align_nodes("top")
	this.evenly_distribute_nodes_on("x",{by:sort_attr})
	this.set_source_generation(0)
	this.display_edges_as_squares()
	this.show_all_edges()
	this.size_edges_by_constant()
	this.color_edges_by(edge_color_attr)

	return this
}


GLO.GLO.prototype.Technique_ListView = function(discrete1, sort_attr){
	if(sort_attr==null){
		delete sort_attr
	}
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.color_edges_by_constant()
	this.position_nodes_on("x",discrete1)
	this.position_nodes_evenly_stacked("bottom",{by:sort_attr,within:discrete1})
	this.display_edges_as_curved_lines()
	this.show_faded_and_incident_edges()
	this.show_axis("x")

	return this
}


GLO.GLO.prototype.Techniques_Edge_Label_Centric = function(){
	TOOD("Edge Label Centric")
}


GLO.GLO.prototype.Technique_Honeycomb = function(discretes, agg_method, edge_color_attr, sort_attr){
	if(sort_attr==null){
		delete sort_attr
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

	this.aggregate_nodes_by(discretes,agg_method)
	this.align_nodes("left")
	this.size_nodes_by("count")
	this.evenly_distribute_nodes_on("y",{by:sort_attr})
	this.clone_nodes()
	this.align_nodes("bottom")
	this.evenly_distribute_nodes_on("x",{by:sort_attr})
	this.set_target_generation(3)
	this.aggregate_edges_by(edge_agg_array, agg_method)
	this.display_edges_as_squares()
	this.color_edges_by(edge_color_attr)

	return this
}


GLO.GLO.prototype.Technique_GraphDice_Segment = function(attr1, attr2, size_nodes_attr){
	this.position_nodes_on("x", attr1)
	this.position_nodes_on("y", attr2)
	this.size_nodes_by(size_nodes_attr)
	this.display_edges_as_curved_lines()
	this.show_all_edges()
	this.show_axis("x")
	this.show_axis("y")

	return this
}


GLO.GLO.prototype.Technique_GraphDice_3x3 = function(attr1, attr2, attr3, size_nodes_attr){
	/*
		0 1 2
		3 5 7
		4 6 8
	*/

	this.size_nodes_by(size_nodes_attr)
	this.size_edges_by_constant()
	this.position_nodes_on("x",attr1)
	this.position_nodes_on("y",attr1)
	this.display_edges_as_curved_lines()
	this.show_axis("x")
	this.show_axis("y")
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

GLO.GLO.prototype.Technique_Radial_Chord = function(){
	TODO("Radial Chord")
	return this
}

GLO.GLO.prototype.Technique_EdgeMap_FD = function(size_nodes_attr){
	TODO("EdgeMap FD")
	return this
}

GLO.GLO.prototype.Technique_EdgeMap_Arc = function(size_nodes_attr,sort_attr){
	TODO("EdgeMap Arc")
	return this
}

GLO.GLO.prototype.Technique_Hive_Plot = function(discrete1, attr2){
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.color_edges_by_constant()

	this.position_nodes_on("theta",discrete1)
	this.position_nodes_on("rho", attr2)
	this.display_edges_as_curved_lines()

	this.show_faded_and_incident_edges()

	return this
}


GLO.GLO.prototype.Technique_Hive_Panel_2x3 = function(discrete1, discrete2, attr1, attr2, attr3){
	/*
		0 1 2
		3 4 5
	*/


	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.color_edges_by_constant()
	this.display_edges_as_curved_lines()
	this.show_faded_and_incident_edges()

	this.position_nodes_on("theta",discrete1)
	this.position_nodes_on("rho", attr1)

	this.partition_on("x",{parts:3})
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

	return this
}


GLO.GLO.prototype.Technique_Scatternet = function(attr1, attr2, color_nodes_attr){
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

	return this
}


GLO.GLO.prototype.Technique_Citevis = function(discrete,color_attr,sort_attr){
	if(sort_attr==null){
		delete sort_attr
	}
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
	this.color_nodes_by(discrete)
	this.position_nodes_on("x", attr1)
	this.position_nodes_on("y", attr2)
	this.show_axis("x")
	this.show_axis("y")
	this.display_edges_as_curved_lines()
	this.partition_on("x",{parts:2})
	this.hide_axis("x")
	this.hide_axis("y")
	this.aggregate_nodes_by(discrete,"mean")
	this.aggregate_edges_by(["source."+discrete,"target."+discrete],"mean")
	this.size_nodes_by("count")
	this.size_edges_by("count")

	return this
}


GLO.GLO.prototype.Technique_NodeTrix = function(discrete){
	this.color_nodes_by("modularity_class")
	this.display_edges_as_curved_lines()

	this.color_nodes_by(discrete)
	this.position_nodes_by_constant_on("rho")
	this.evenly_distribute_nodes_on("theta",{by:discrete})

	this.position_nodes_by_constant_on("rho",{group_by:discrete})
	this.evenly_distribute_nodes_on("theta",{group_by:discrete})

	this.align_nodes("left",{group_by:discrete})
	this.evenly_distribute_nodes_on("y",{group_by:discrete,invert:true})
	this.clone_nodes()
	this.evenly_distribute_nodes_on("x",{group_by:discrete})
	this.align_nodes("top",{group_by:discrete})
	this.set_target_generation(1)

	this.show_faded_and_incident_edges()
	this.display_edges_as_curved_lines()
	this.display_edges_as_squares({group_by:discrete})
	this.show_all_edges({group_by:discrete})

	this.clone_edges()
	this.hide_edges({group_by:discrete})
	this.set_source_generation(1)
	this.set_target_generation(0)

	return this
}