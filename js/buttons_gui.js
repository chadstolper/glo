//The Button
var mlgo_index = 0

var grouped_steps = [
//Position Nodes
  {
    name: "Position Nodes",
    data: [
      {f:evenly_position_on_x, label:"Evenly Position on X"},
      {f:evenly_position_on_y, label:"Evenly Position on Y"},
      {f:position_x_left, label:"Position X Left"},
      {f:position_x_center, label:"Position X Center"},
      {f:position_x_right, label:"Position X Right"},
      {f:position_y_top, label:"Position Y Top"},
      {f:position_y_middle, label:"Position Y Middle"},
      {f:position_y_bottom, label:"Position Y Bottom"},
      {f:transition_x_by_betweenness, label:"Position X Relatively by Betweenness Centrality"},
      {f:transition_y_by_degree, label:"Position Y Relatively by Degree"},
      {f:transition_x_by_gender, label:"Position X by Gender"},
      {f:scatter_on_x, label:"Scatter on X"},
      {f:position_y_by_modularity_class, label:"Substrate on Y by Category"},
      {f:force_directed, label:"Force-Directed"}
    ]
  },

//Node Properties
  {
    name: "Node Properties",
    data:[
      {f:size_nodes_by_constant, label:"Size Nodes by Constant"},
      {f:size_nodes_by_degree, label:"Size Nodes by Degree"},
      {f:size_nodes_by_count, label:"Size Nodes by Count"},
    ]
  },


//edges
{
    name: "Edges",
    data:[
      {f:show_selected_links, label:"Show Select Links"},
      {f:show_links, label:"Show Links"},
      {f:hide_links, label:"Hide Links"},
      {f:transition_links_to_circle, label:"Links to Circles"},
      {f:transition_links_to_straight, label:"Links to Straight"},
      {f:transition_links_to_curved, label:"Links to Curved"}
    ]
  },



//aggregation
  {
    name: "Aggregation",
    data:[
      {f:aggregate_nodes_by_gender_and_category, label:"Aggregate by Gender and Category"},
      {f:aggregate_by_modularity_class, label:"Aggregate by Category"},
      {f:deaggregate_0, label:"Deaggregate 0"},
      {f:deaggregate_1, label:"Deaggregate 1"},
    ]   
  },

//Cloning
  {
  name: "Cloning",
  data:   
  [
    {f:clone_active_set, label:"Clone Active Set"},
    {f:remove_generation_1, label:"Remove Generation 1"},
  ]
  },

//Others
 {
  name: "Others",
  data:   
  [
    {f:draw_x_axis, label:"Draw X Axis"},
    {f:draw_y_axis, label:"Draw Y Axis"},
    {f:hide_x_axis, label:"Hide X Axis"},
    {f:hide_y_axis, label:"Hide Y Axis"}
  ]
  }
];


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
    .on("click",function(d,i){
      d.f()
      // d.disabled = true
      // update_buttons()
    })

// update_buttons()

// function update_buttons(){
//   d3.select("#buttons").selectAll(".step")
//     .attr("disabled",function(d){return (d.disabled==true)?"true":null;})
// }