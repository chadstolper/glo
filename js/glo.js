/*
	For each function, the final parameter is an optional options
	parameter. It should be an object{} with any
	combination of the three options:
		* within:		discrete attribute name as string
		* allgens:	boolean value, true to apply to all
								generations in current canvas
		* allparts:	boolean value, true to apply
								true to apply to all gens in all
								parititions

	For some functions, there are additional optional values
		* by: a sorting function used for index-based positioning
*/



// 2	aggregate edges by {discrete} and {discrete} using {method}
// 29	aggregate edges by {discrete} using {method}
/*
	Aggregates edges by attributes using method.
	* attr can be either a string for the attribute or a list
			of attributes.
*/
function aggregate_edges_by(attr,method,opts) {}


// 52	aggregate nodes by {discrete} and {discrete} using {method}
// 113	aggregate nodes by {discrete} using {method}
/*
	Aggregates nodes by attribute(s) using method.
	* attr can be either a string for the attribute or a list
			of attributes.
*/
function aggregate_nodes_by(attr,method,opts){}



// 28	align edges {dir}
/*
	Aligns edges to a specificed direction.
	Shorthand for position_edges_by(constant)
*/
function align_edges(dir,opts){}

//433	align nodes {dir}
/*
	Aligns nodes to a specified direction.
	Shorthand for position_nodes_by(constant)
*/
function align_nodes(dir,opts){}

//123	apply force-directed algorithm to nodes
/*
	
*/
function apply_force_directed_algorithm_to_nodes(opts){}

//107	clone edges
/*
	Clones the active generation of edges and selects the new
	generation as the active generation
*/
function clone_edges(opts){}

//234	clone nodes
/*
	Clones the active generation of nodes and selects the new
	generation as the active generation
*/
function clone_nodes(opts){}

//29	color convex hulls by {attr}
/*

*/
function color_convex_hulls_by(attr,opts){}

/*
	Colors hulls by a constant
	constant should be an HTML-recognizable color string
*/
function color_convex_hulls_by_constant(constant,opts){}


//249	color edges by {attr}
//28	color edges by {attr}->{attr}
/*
	Colors edges by an appropriate color choice for attr:
		discrete
		continuous
		divergent
	attr can also be a 2-item array where the first item is the
	source-end color and the second item is the target-end color
*/
function color_edges_by(attr,opts){}


//196	color edges by {constant}
/*
	Colors edges by a constant
	constant should be an HTML-recognizable color string
*/
function color_edges_by_constant(constant,opts){}

//144	color nodes by {attr}
/*
	Colors nodes by an appropriate color choice for attr:
		discrete
		continuous
		divergent
*/
function color_nodes_by(attr,opts){}

//149	color nodes by {constant}
/*
	Colors nodes by a constant
	constant should be an HTML-recognizable color string
*/
function color_nodes_by_constant(constant,opts){}

//84	deaggregate edges
/*
	Deaggregates the active generation and selects the generation
	previously aggregated to create the aggregation.
	If active generation is not aggregated, then nop
*/
function deaggregate_edges(opts){}

//107	deaggregate nodes
/*
	Deaggregates the active generation and selects the generation
	previously aggregated to create the aggregation.
	If active generation is not aggregated, then nop
*/
function deaggregate_nodes(opts){}

//28	display edges as bars
/*
	
*/
function display_edges_as_bars(opts){}

//213	display edges as curved lines
/*
	
*/
function display_edges_as_curved_lines(opts){}

//28	display edges as in-out-links
/*
	
*/
function display_edges_as_in_out_links(opts){}

//72	display edges as outer links
/*
	Curved edges that avoid crossing through the vis,
	prefering to go outside of the glyphs
*/
function display_edges_as_outer_links(opts){}

//148	display edges as squares
/*
	
*/
function display_edges_as_squares(opts){}

//165	display edges as straight lines
/*
	
*/
function display_edges_as_straight_lines(opts){}

//28	display edges as y->x right-angles
/*
	dirarr is a 2d array of directions (left,right,top,bottom)
	the angle is drawn from either the min or the max of x
	to either the min or the max of y based upon
*/
function display_edges_as_right_angles(opts){}

//28	display edges as {attr} labels
/*
	
*/
function display_edges_as_labels(attr,opts){}

//28	display nodes as arcs
/*
	
*/
function display_nodes_as_arcs(opts){}

//89	display nodes as bars
/*
	
*/
function display_nodes_as_bars(opts){}

//208	display nodes as circles
/*
	
*/
function display_nodes_as_circles(opts){}

//237	display nodes as {attr} labels
/*
	
*/
function display_nodes_as_labels(attr,opts){}

//29	draw convex hulls
/*
	within value in opts, otherwise convex hull for
	all nodes
*/
function show_convex_hulls(opts){}

//29	evenly distribute edges on {axis} (by {attr})
/*
	opts includes by option
*/
function evenly_distribute_edges_on(axis,opts){}

//641	evenly distribute nodes on {axis} (by {attr})
/*
	opts includes by option
*/
function evenly_distribute_nodes_on(axis,opts){}

//58	filter partition canvas on {axis} by {discrete}
/*
	opts includes by option
	if not included, then equiv. to partition(2)
*/
function filter_partition_on(axis,opts){}

//79	hide edges
/*
	
*/
function hide_edges(opts){}

//56	hide meta {axis} axis
/*
	meta axis used for filter_partitions
*/
function hide_meta_axis(axis,opts){}

//213	hide {axis} axis
/*
	
*/
function hide_axis(axis,opts){}

//28	highlight in-out neighbors
/*
	Highlights in- and out- neighbors differently
*/
function highlight_in_out_neighbors(opts){}

/*
	Highlights neighbors
*/
function highlight_neighbors(opts){}



//198	partition canvas on {axis} (by {num})
/*
	Partitions the current display along the given axis
	all gens in the current display are cloned into the new display.
	Default is a 2-way split; the by option can be used to specify a
	larger number. Splits are always even.
*/
function partition_on(axis,opts){}

//168	position edges by {attr},{attr}
/*
	
*/
function position_edges_by(xattr,yattr,opts){}

//728	position nodes on {axis} by {attr}
//145	position nodes on {axis} by {constant}
/*
	attr is either a string attrID or a numerical constant
*/
function position_nodes_on(axis,attr,opts){}

//29	position nodes {dir} on {axis} (by {attr})
/*
	Utilizes by from opts
*/
function position_nodes_stacked_on(axis,opts){}

//156	remove all cloned edges
/*
	Removes all edges except a single generation and sets that
	generation as active.
*/
function remove_all_cloned_edges(opts){}

//219	remove all cloned nodes
/*
	Removes all nodes except a single generation and sets that
	generation as active.
*/
function remove_all_cloned_nodes(opts){}

//28	remove all edge waypoints
/*
	
*/
function remove_all_edge_waypoints(opts){}

//115	remove all partitions
/*
	Removes all partitions. Generations in removed partitions
	are cloned into the remaining partition
*/
function remove_all_partitions(opts){}

//55	remove canvas {num}
/*
	TODO: Figure this out
*/
function remove_canvas(canvas,opts){}

//28	remove convex hulls
/*
	
*/
function hide_convex_hulls(opts){}

//41	remove edge generation {num}
/*
	Removes the provided edge generation
	Cannot remove the only generation. If so, nop.
	If gen is active generation, selects a different generation
*/
function remove_edge_generation(gen,opts){}

//39	remove node generation {num}
/*
	Removes the provided node generation
	Cannot remove the only generation. If so, nop.
	If gen is active generation, selects a different generation
*/
function remove_node_generation(gen,opts){}

//162	rotate nodes {num} degrees
/*
	Rotates nodes clockwise deg degrees
*/
function rotate_nodes(deg,opts){}

//175	select canvas {num}
/*
	Selects the provided canvas
	Selects the most recent active generations of that canvas
*/
function select_canvas(canvas,opts){}

//3	select column {num}
/*
	Selects the active generations of all canvases in col
*/
function select_column(col,opts){}

//36	select edge generation {num}
/*
	
*/
function select_edge_generation(gen,opts){}

//88	select node generation {num}
/*
	
*/
function select_node_generation(gen,opts){}

//117	select row {num}
/*
	Selects the active generations of all canvases in row
*/
function select_row(row,opts){}

//28	set edge waypoint edge generation {num}
/*
	
*/
function set_edge_waypoint_edge_generation(gen,opts){}

//78	set source generation {num}
/*
	
*/
function set_source_generation(gen,opts){}

//217	set target generation {num}
/*
	
*/
function set_target_generation(gen,opts){}

//152	show all edges
/*
	
*/
function show_all_eges(opts){}

//27	show edges as faded
/*
	
*/
function show_edges_as_faded(opts){}

//28	show edges as solid
/*
	
*/
function show_edges_as_solid(opts){}

//28	show faded and incident edges
/*
	All edges as shown as faded, except for incident edges
	to mousedover node shown as solid
*/
function show_faded_and_incident_edges(opts){}

//79	show incident edges
/*
	All edges hidden, except for incident edges
	to mousedover node shown as solid
*/
function show_incident_edges(opts){}

//56	show meta {axis} axis
/*
	
*/
function show_meta_axis(axis,opts){}

//224	show {axis} axis
/*
	
*/
function show_axis(axis,opts){}

//202	size edges by {attr}
//29	size edges by {attr} and {attr}
//199	size edges by {constant}
/*
	attr can be either an attrID, 2-element array of attrIDs,
	3-element array of attrIDs, or a number.
	2-element is source-end-->target-end.
	3-element is source-end, middle, target-end.
	number is a constant

	If non-line-based edge display (e.g. label, square, bar), only
	first attrID is used.
*/
function size_edges_by_attr(attr,opts){}


/*
	
*/
function size_edges_by_constant(constant,opts){}

//242	size nodes by {attr}
//162	size nodes by {constant}
/*
	attr can be either an attrID or a number
*/
function size_nodes_by(attr,opts){}


//28	stop highlight in-out neighbors
/*
	
*/
function stop_highlighting(opts){}