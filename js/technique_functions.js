var create_force_directed = function(){
  setTimeout(size_nodes_by_degree,0);
}

var create_semantic_substrates = function(){
  setTimeout(position_y_by_modularity_class,transition_duration*0);
  setTimeout(scatter_on_x,transition_duration*1);
  setTimeout(transition_links_to_curved,transition_duration*2);
  setTimeout(show_selected_links,transition_duration*3);
}

var create_arc_diagram = function(){
  setTimeout(position_y_middle,transition_duration*0);
  setTimeout(evenly_position_on_x,transition_duration*1);
  setTimeout(transition_links_to_curved,transition_duration*2);
}

var create_pivotgraph = function(){
  setTimeout(transition_x_by_gender,transition_duration*0);
  setTimeout(position_y_by_modularity_class,transition_duration*1);
  setTimeout(aggregate_nodes_by_gender_and_category,transition_duration*2);
  setTimeout(transition_links_to_curved,transition_duration*3);
  setTimeout(draw_x_axis,transition_duration*4);
  setTimeout(draw_y_axis,transition_duration*5);
}

var create_matrix = function(){
  setTimeout(position_x_left,transition_duration*0);
  setTimeout(evenly_position_on_y,transition_duration*1);
  setTimeout(clone_active_set,transition_duration*2);
  setTimeout(evenly_position_on_x,transition_duration*3);
  setTimeout(position_y_bottom,transition_duration*4);
  setTimeout(set_target_generation_1,transition_duration*5);
  setTimeout(transition_links_to_circle,transition_duration*6);
}

var create_scatterplot = function(){
  setTimeout(transition_x_by_betweenness,transition_duration*0);
  setTimeout(transition_y_by_degree,transition_duration*1);
  setTimeout(draw_x_axis,transition_duration*2);
  setTimeout(draw_y_axis,transition_duration*3);
  setTimeout(size_nodes_by_degree,transition_duration*4);
  setTimeout(hide_links,transition_duration*5);

}