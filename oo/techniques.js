
GLO.GLO.prototype.Technique_Force_Directed = function(color_by_attr){
	this.display_edges_as_straight_lines()
	this.show_all_edges()
	this.size_nodes_by_constant()
	this.size_edges_by_constant()
	this.color_edges_by_constant()
	this.color_nodes_by(color_by_attr)
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