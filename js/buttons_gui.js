//The Button
var mlgo_index = 0

var grouped_steps = [
//Position Nodes
  {
    name: "Positioning Nodes",
    data: [
    //node_position_x for position node x
      {f:evenly_position_on_x, label:"Distribute Nodes on X", type: ["node_position_x"]},
      {f:evenly_position_on_y, label:"Distribute Nodes on Y", type: ["node_position_y"]},
      {f:position_x_left, label:"Align X Left", type: ["node_position_x"]},
      {f:position_x_center, label:"Align X Center", type: ["node_position_x"]},
      {f:position_x_right, label:"Align X Right", type: ["node_position_x"]},
      {f:position_y_top, label:"Align Y Top", type: ["node_position_y"]},
      {f:position_y_middle, label:"Align Y Middle", type: ["node_position_y"]},
      {f:position_y_bottom, label:"Align Y Bottom", type: ["node_position_y"]},
      {f:transition_x_by_betweenness, label:"Position X Relatively by Betweenness Centrality", type: ["node_position_x"]},
      {f:transition_y_by_degree, label:"Position Y Relatively by Degree", type: ["node_position_y"]},
      {f:transition_x_by_gender, label:"Substrate on X by Gender", type: ["node_position_x"]},
      {f:scatter_on_x, label:"Scatter on X", type: ["node_position_x"]},
      {f:position_y_by_modularity_class, label:"Substrate on Y by Category", type: ["node_position_y"]},
      {f:force_directed, label:"Apply Force-Directed Algorithm", type: ["node_position_x","node_position_y"]}
    ]
  },

//Node Properties
  {
    name: "Modifying Element Properties",
    data:[
      {f:size_nodes_by_constant, label:"Size Nodes by Constant", type: ["node_size"]},
      {f:size_nodes_by_degree, label:"Size Nodes by Degree", type: ["node_size"]},
      {f:size_nodes_by_count, label:"Size Nodes by Count", type: ["node_size"]},
      {f:show_links, label:"Show All Links", type: ["show_edge"]},
      {f:show_selected_links, label:"Show Select Links", type: ["show_edge"]},
      {f:hide_links, label:"Hide Links", type: ["show_edge"]},
      {f:transition_links_to_straight, label:"Links to Straight", type: ["edge_shape"]},
      {f:transition_links_to_curved, label:"Links to Curved", type: ["edge_shape"]},
      {f:transition_links_to_circle, label:"Links to Circles", type: ["edge_shape"]},

    ]
  },




//aggregation
  {
    name: "Aggregation",
    data:[
      {f:aggregate_nodes_by_gender_and_category, label:"Aggregate by Gender and Category", type: ["aggregation"]},
      {f:aggregate_by_modularity_class, label:"Aggregate by Category", type: ["aggregation"]},
      {f:deaggregate_0, label:"Deaggregate Generation 0", type: ["deaggregation_0"]},
      {f:deaggregate_1, label:"Deaggregate Geneartion 1", type: ["deaggregation_1"]},
      {f:deaggregate_2, label:"Deaggregate Generation 2", type: ["deaggregation_2"]},
      {f:deaggregate_3, label:"Deaggregate Generation 3", type: ["deaggregation_3"]},
      // {f:deaggregate_4, label:"Deaggregate Generation 4", type: ["deaggregation_4"]},
      // {f:deaggregate_5, label:"Deaggregate Generation 5", type: ["deaggregation_5"]},
      // {f:deaggregate_6, label:"Deaggregate Generation 6", type: ["deaggregation_6"]},
    ]   
  },

//Cloning
  {
  name: "Cloning",
  data:   
  [

    {f:clone_active_set, label:"Clone Active Set", type: ["clone"]},
    
    {f:set_source_generation_0, label:"Set Source Generation 0", type:["source_gen"]},
    {f:set_source_generation_1, label:"Set Source Generation 1", type:["source_gen"]},
    {f:set_source_generation_2, label:"Set Source Generation 2", type:["source_gen"]},
    {f:set_source_generation_3, label:"Set Source Generation 3", type:["source_gen"]},
    // {f:set_source_generation_4, label:"Set Source Generation 4", type:["source_gen"]},
    // {f:set_source_generation_5, label:"Set Source Generation 5", type:["source_gen"]},
    // {f:set_source_generation_6, label:"Set Source Generation 6", type:["source_gen"]},
    
    {f:set_target_generation_0, label:"Set Target Generation 0", type:["target_gen"]},
    {f:set_target_generation_1, label:"Set Target Generation 1", type:["target_gen"]},
    {f:set_target_generation_2, label:"Set Target Generation 2", type:["target_gen"]},
    {f:set_target_generation_3, label:"Set Target Generation 3", type:["target_gen"]},
    // {f:set_target_generation_4, label:"Set Target Generation 4", type:["target_gen"]},
    // {f:set_target_generation_5, label:"Set Target Generation 5", type:["target_gen"]},
    // {f:set_target_generation_6, label:"Set Target Generation 6", type:["target_gen"]},
    
    {f:remove_generation_1, label:"Remove Generation 1", type: ["remove_clone_1"]},
    {f:remove_generation_2, label:"Remove Generation 2", type: ["remove_clone_2"]},
    {f:remove_generation_3, label:"Remove Generation 3", type: ["remove_clone_3"]},
    // {f:remove_generation_4, label:"Remove Generation 4", type: ["remove_clone_4"]},
    // {f:remove_generation_5, label:"Remove Generation 5", type: ["remove_clone_5"]},
    // {f:remove_generation_6, label:"Remove Generation 6", type: ["remove_clone_6"]},

  ]
  },

//Others
 {
  name: "Modifying Display Properties",
  data:   
  [
    {f:draw_x_axis, label:"Show X Axis", type: ["show_x_axis"]},
    {f:draw_y_axis, label:"Show Y Axis", type: ["show_y_axis"]},
    {f:hide_x_axis, label:"Hide X Axis", type: ["show_x_axis"]},
    {f:hide_y_axis, label:"Hide Y Axis", type: ["show_y_axis"]}
  ]
  }
];


var nameToTypeDictionary = {};
for (var i=0;i<grouped_steps.length;i++){
  for (var j=0;j<grouped_steps[i].data.length;j++){
    // console.log(grouped_steps[i].data[j].label);
    
    nameToTypeDictionary[grouped_steps[i].data[j].label] = grouped_steps[i].data[j].type;

    // console.log(nameToTypeDictionary[grouped_steps[i].data[j].label]);
  }
}

accordion_groups = d3.select("#buttons")
    .selectAll(".button-group")
    .data(grouped_steps)
    .enter(function(d){
      console.log(d);
    })
    // .append("div")
    // .classed("accordion_group",true);

var title_groups = accordion_groups.append("h3").text(function(d){return d.name;});
var button_groups = accordion_groups.insert("div").classed("button-group",true);
// d3.selectAll(".button-group").insert("h3",".button-group").text("group!");


var mlgo_buttons = button_groups.selectAll(".step")
    .data(function(d){return d.data})
    .enter()
    .append("div")
    .text(function(d){return d.label; })
    .classed("btn",true)
    .classed("btn-default",true)
    .classed("step",true)      
    .on("click",function(d){
      d.f();
      for (var i=0;i<d.type.length;i++){
        var newType = d.type[i];
        d3.selectAll(".history-item")
          .filter(function(d,i){
            return i<history.length;
          })
          .classed("disabled",function(d,i){
            //console.log("prev array"+d.type);
            if (nameToTypeDictionary[d3.select(this).text()]==newType){
              return true;
            }else{
              return d3.select(this).classed("disabled");
            }
          });

      }
      // d.disabled = true
      // update_buttons()
    })

// update_buttons()

// function update_buttons(){
//   d3.select("#buttons").selectAll(".step")
//     .attr("disabled",function(d){return (d.disabled==true)?"true":null;})
// }