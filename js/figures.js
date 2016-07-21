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