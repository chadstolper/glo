//The Button
var mlgo_index = 0

var grouped_steps = [
//Position Nodes
  {
    name: "Position Nodes",
    data: [
    //node_position_x for position node x
      {f:evenly_position_on_x, label:"Evenly Position on X", type: ["node_position_x"]},
      {f:evenly_position_on_y, label:"Evenly Position on Y", type: ["node_position_y"]},
      {f:position_x_left, label:"Position X Left", type: ["node_position_x"]},
      {f:position_x_center, label:"Position X Center", type: ["node_position_x"]},
      {f:position_x_right, label:"Position X Right", type: ["node_position_x"]},
      {f:position_y_top, label:"Position Y Top", type: ["node_position_y"]},
      {f:position_y_middle, label:"Position Y Middle", type: ["node_position_y"]},
      {f:position_y_bottom, label:"Position Y Bottom", type: ["node_position_y"]},
      {f:transition_x_by_betweenness, label:"Position X Relatively by Betweenness Centrality", type: ["node_position_x"]},
      {f:transition_y_by_degree, label:"Position Y Relatively by Degree", type: ["node_position_y"]},
      {f:transition_x_by_gender, label:"Position X by Gender", type: ["node_position_x"]},
      {f:scatter_on_x, label:"Scatter on X", type: ["node_position_x"]},
      {f:position_y_by_modularity_class, label:"Substrate on Y by Category", type: ["node_position_y"]},
      {f:force_directed, label:"Force-Directed", type: ["node_position_x","node_position_y"]}
    ]
  },

//Node Properties
  {
    name: "Node Properties",
    data:[
      {f:size_nodes_by_constant, label:"Size Nodes by Constant", type: ["node_size"]},
      {f:size_nodes_by_degree, label:"Size Nodes by Degree", type: ["node_size"]},
      {f:size_nodes_by_count, label:"Size Nodes by Count", type: ["node_size"]},
    ]
  },


//edges
  {
    name: "Edges",
    data:[
      {f:show_selected_links, label:"Show Select Links", type: ["show_edge"]},
      {f:show_links, label:"Show Links", type: ["show_edge"]},
      {f:hide_links, label:"Hide Links", type: ["show_edge"]},
      {f:transition_links_to_circle, label:"Links to Circles", type: ["edge_shape"]},
      {f:transition_links_to_straight, label:"Links to Straight", type: ["edge_shape"]},
      {f:transition_links_to_curved, label:"Links to Curved", type: ["edge_shape"]}
    ]
  },



//aggregation
  {
    name: "Aggregation",
    data:[
      {f:aggregate_nodes_by_gender_and_category, label:"Aggregate by Gender and Category", type: ["aggregation"]},
      {f:aggregate_by_modularity_class, label:"Aggregate by Category", type: ["aggregation"]},
      {f:deaggregate_0, label:"Deaggregate 0", type: ["deaggregation_0"]},
      {f:deaggregate_1, label:"Deaggregate 1", type: ["deaggregation_1"]},
    ]   
  },

//Cloning
  {
  name: "Cloning",
  data:   
  [
    {f:clone_active_set, label:"Clone Active Set", type: ["clone"]},
    {f:remove_generation_1, label:"Remove Generation 1", type: ["remove_clone"]},
  ]
  },

//Others
 {
  name: "Others",
  data:   
  [
    {f:draw_x_axis, label:"Draw X Axis", type: ["show_x_axis"]},
    {f:draw_y_axis, label:"Draw Y Axis", type: ["show_y_axis"]},
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