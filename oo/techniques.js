
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
	this.evenly_distribute_nodes_on("y",{by:sort_attr})
	this.align_nodes("left")
	this.clone_nodes()
	this.align_nodes("bottom")
	this.evenly_distribute_nodes_on("x",{by:sort_attr})
	this.set_target_generation(1)
	this.display_edges_as_squares()
	this.show_all_edges()
	this.size_edges_by_constant()
	this.color_edges_by(edge_color_attr)

	return this
}



GLO.GLO.prototype.Technique_Cluster_Circles = function(group_by_attr, internal_sort_attr){
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
	this.evenly_distribute_nodes_on("y",{by:sort_attr})
	this.align_nodes("left")
	this.clone_nodes()
	this.align_nodes("bottom")
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
	this.evenly_distribute_nodes_on_within("x",discrete1)
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
	this.evenly_distribute_nodes_on("y",{by:sort_attr})
	this.align_nodes("left")
	this.display_edges_as_curved_lines()
	this.show_incident_edges()
	this.clone_nodes()
	this.clone_edges()
	this.set_source_generation(1)
	this.set_target_generation(1)
	this.clone_edges()
	this.align_nodes("bottom")
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
	this.position_nodes_stacked_within("bottom",discrete1,{by:sort_attr})
	this.display_edges_as_curved_lines()

	// this.show_faded_and_incident_edges()
	this.show_edges_as_faded()
	// this.show_all_edges()
	this.clone_edges()
	this.show_incident_edges()
	this.show_axis("x")

	return this
}