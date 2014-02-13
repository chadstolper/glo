//The Button
var mlgo_index = 0
var mlgo_steps = [
  {f:initialize_force_directed, label:"Initialize"},
  {f:transition_x_by_degree, label:"Position X by Degree"},
  {f:substrate_on_y, label:"Substrate on Y by Category"},
  {f:aggregate_nodes_by_degree_and_category, label:"Aggregate by Degree and Category"},


  {f:force_directed, label:"Force-Directed"},


  {f:evenly_position_on_x, label:"Evenly Position on X"},
  {f:evenly_position_on_y, label:"Evenly Position on Y"},

  {f:position_x_left, label:"Position X Left"},
  {f:position_x_center, label:"Position X Center"},
  {f:position_x_right, label:"Position X Right"},

  {f:position_y_top, label:"Position Y Top"},
  {f:position_y_middle, label:"Position Y Middle"},
  {f:position_y_bottom, label:"Position Y Bottom"},

  {f:transition_x_by_betweenness, label:"Position X Relatively by Betweenness Centrality"},
  {f:transition_y, label:"Position Y Relatively by Degree"},

  {f:scatter_on_x, label:"Scatter on X within Substrates"},


  {f:draw_x_axis, label:"Draw X Axis"},
  {f:draw_y_axis, label:"Draw Y Axis"},
  {f:hide_x_axis, label:"Hide X Axis"},
  {f:hide_y_axis, label:"Hide Y Axis"},


  {f:size_nodes_by_constant, label:"Size Nodes by Constant"},
  {f:size_nodes_by_degree, label:"Size Nodes by Degree"},


  {f:transition_links_to_straight, label:"Links to Straight"},
  {f:transition_links_to_curved, label:"Links to Curved"},
  {f:transition_links_to_circle, label:"Links to Circles"},

  {f:show_links, label:"Show Links"},
  {f:show_selected_links, label:"Show Select Links"},
  {f:hide_links, label:"Hide Links"},


  {f:clone_active_set, label:"Clone Active Set"},
  {f:remove_generation_1, label:"Remove Generation 1"},

  
  
  
  {f:select_generation_0, label:"Select Primary Nodes"},
  {f:select_generation_1, label:"Select Generation 1 Nodes"},
  {f:select_generation_2, label:"Select Generation 2 Nodes"},
  
  {f:set_source_generation_0, label:"Source Generation 0"},
  {f:set_source_generation_1, label:"Source Generation 1"},
  {f:set_source_generation_2, label:"Source Generation 2"},

  {f:set_target_generation_0, label:"Target Generation 0"},
  {f:set_target_generation_1, label:"Target Generation 1"},
  {f:set_target_generation_2, label:"Target Generation 2"},
  
  // {f:finished, label:"Finished"}
  ]

var mlgo_buttons = d3.select("#buttons").selectAll(".glo")
    .data(mlgo_steps)
  .enter().append("button")
    .classed("glo",true)
    .text(function(d){return d.label; })
    .on("click",function(d,i){
      d.f()
      // update_buttons()
    })

// update_buttons()

function update_buttons(){
  d3.select("#buttons").selectAll(".glo")
    .attr("disabled",function(d){return (d.disabled==true)?"true":null;})
}