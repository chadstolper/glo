var figure_logo = function(glo){
	glo
		.color_nodes_by("modularity_class")
		.size_nodes_by_constant()
		.color_edges_by_constant()
		.size_edges_by_constant()
		.show_edges_as_faded()
		.partition_on("x",{parts:3})

		.select_canvas(0)
		.evenly_distribute_nodes_on("rho",{by:"modularity_class"})
		.evenly_distribute_nodes_on("theta",{by:"modularity_class"})

		.select_canvas(1)
		.display_edges_as_squares()
		.align_nodes("left")
		.evenly_distribute_nodes_on("y",{by:"modularity_class"})
		.clone_nodes()
		.set_target_generation(3)
		.align_nodes("bottom")
		.evenly_distribute_nodes_on("x",{by:"modularity_class"})

		.select_canvas(2)
		.evenly_distribute_nodes_on("theta",{by:"modularity_class"})
		.position_nodes_by_constant_on("rho")
		.display_edges_as_curved_lines()

}