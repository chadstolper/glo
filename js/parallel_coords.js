var parallel_coordinates = function(){
  setTimeout(function(){ size_nodes_by_constant() }, transition_duration*1);
  setTimeout(function(){ clone_active_set() }, transition_duration*2);
  setTimeout(function(){ clone_active_set() }, transition_duration*3);
  setTimeout(function(){ clone_active_set() }, transition_duration*4);
  setTimeout(function(){ clone_active_set() }, transition_duration*5);
  setTimeout(function(){ position_x_by_property("generation") }, transition_duration*6);
  setTimeout(function(){ position_y_by_property("degree") }, transition_duration*7);
  setTimeout(function(){ select_generation(3) }, transition_duration*8);
  setTimeout(function(){ position_x_by_property("generation") }, transition_duration*9);
  setTimeout(function(){ position_y_by_property("modularity_class") }, transition_duration*10);
  setTimeout(function(){ select_generation(2) }, transition_duration*11);
  setTimeout(function(){ position_x_by_property("generation") }, transition_duration*12);
  setTimeout(function(){ position_y_by_property("page_rank") }, transition_duration*13);
  setTimeout(function(){ select_generation(1) }, transition_duration*14);
  setTimeout(function(){ position_x_by_property("generation") }, transition_duration*15);
  setTimeout(function(){ position_y_by_property("betweenness_centrality") }, transition_duration*16);
  setTimeout(function(){ select_generation(0) }, transition_duration*17);
  setTimeout(function(){ position_x_by_property("generation") }, transition_duration*18);
  setTimeout(function(){ position_y_by_property("id") }, transition_duration*19);
    setTimeout(function(){ transition_links_to_straight() }, transition_duration*20);
  setTimeout(function(){ set_target_generation(1) }, transition_duration*21);
  setTimeout(function(){ set_source_generation(2) }, transition_duration*24);
  setTimeout(function(){ set_target_generation(3) }, transition_duration*27);
  setTimeout(function(){ set_source_generation(4) }, transition_duration*31);
  // setTimeout(function(){ set_target_generation(0) }, transition_duration*33)
  // setTimeout(function(){ hide_links() }, transition_duration*41)
};