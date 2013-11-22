/*
  MLGO Force-Directed ---> Scatterplot Steps
  0) Force-Directed
  1) Transition x position based on betweenness_centrality
  2) Add x axis
  3) Transition y position based on degree
  4) Add y axis
*/

var graph = {}
var node, link
var xscale, yscale
var transition_duration = 2000

var mlgo = d3.select("#mlgo")



var width = 700
var height = 500
var color = d3.scale.category20()

var svg = d3.select("#canvas").append("svg")
    .attr("width",width)
    .attr("height",height)





//Load Data
d3.csv("data/LesMis/nodes.csv",function(nodes){
  d3.csv("data/LesMis/edges.csv",function(edges){
    nodes.forEach(function(d){
      d.id = +d.id
      d.modularity_class = +d.modularity_class
      d.degree = +d.degree
      d.weighted_degree = +d.weighted_degree
      d.eccentricity = +d.eccentricity
      d.closeness_centrality = +d.closeness_centrality
      d.betweenness_centrality = +d.betweenness_centrality
      d.authority = +d.authority
      d.hub = +d.hub
      d.page_rank = +d.page_rank
      d.component_id = +d.component_id
      d.clustering_coefficient = +d.clustering_coefficient
      d.number_of_triangles = +d.number_of_triangles
      d.eigenvector_centrality = +d.eigenvector_centrality
    })
    edges.forEach(function(d){
      d.source = +d.source
      d.target = +d.target
      d.type = +d.type
      d.id = +d.id
      d.weight = +d.weight
    })

    graph.nodes = nodes
    graph.edges = edges

  })
})


var force_directed = function(){
  mlgo.style("visibility","hidden")

  var force = d3.layout.force()
    .charge(-200)
    .linkDistance(75)
    .size([width,height])

  force
      .nodes(graph.nodes)
      .links(graph.edges)
      .start()

    link = svg.selectAll(".link")
        .data(graph.edges)
      .enter().append("line")
        .classed("link",true)
        .style("stroke-width", function(d) { return Math.sqrt(d.weight); });

    node = svg.selectAll(".node")
        .data(graph.nodes)
      .enter().append("circle")
        .classed("node",true)
        .attr("r", function(d){ return d.degree; })
        .attr("fill", function(d){ return color(d.modularity_class); })
        //.call(force.drag)

    node.append("title")
      .text(function(d){ return d.label; })

    force.on("tick", function(){
      link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    })

    force.on("end",function(){
      mlgo.style("visibility","visible")
    })
}

var hide_links = function(){
  link.style("visibility","hidden")
}


var transition_x = function(){
  xscale = d3.scale.linear()
    .range([0,width])
    .domain([0,d3.max(graph.nodes.map(function(d){return d.betweenness_centrality; }))])
    .nice()


  node.transition().duration(transition_duration)
    .attr("cx",function(d){
      d.x = xscale(d.betweenness_centrality)
      return d.x
    })

  link.transition().duration(transition_duration)
    .attr("x1", function(d) { return d.source.x; })
    .attr("x2", function(d) { return d.target.x; })

}


var transition_y = function(){
  yscale = d3.scale.linear()
    .range([height,0])
    .domain([0,d3.max(graph.nodes.map(function(d){return d.degree; }))])
    .nice()

  node.transition().duration(transition_duration)
    .attr("cy",function(d){
      d.y = yscale(d.degree)
      return d.y
    })

  link.transition().duration(transition_duration)
    .attr("y1", function(d) { return d.source.y; })
    .attr("y2", function(d) { return d.target.y; });
}

// force_directed = function(){}
// var hide_links = function(){}
// var transition_x = function(){}
var draw_x_axis = function(){}
// var transition_y = function(){}
var draw_y_axis = function(){}
var finished = function(){
  mlgo.attr("disabled","true")
}


//The Button
var mlgo_index = 0
var mlgo_steps = [
  {f:force_directed, label:"Force-Directed"},
  {f:hide_links, label:"Hide Links"},
  {f:transition_x, label:"Transition X"},
  {f:draw_x_axis, label:"Draw X Axis"},
  {f:transition_y, label:"Transition Y"},
  {f:draw_y_axis, label:"Draw Y Axis"},
  {f:finished, label:"Finished"}
  ]
mlgo.text(mlgo_steps[mlgo_index].label)
mlgo.on("click",function(){
  mlgo_steps[mlgo_index++].f()
  if(mlgo_index<mlgo_steps.length){
    mlgo.text(mlgo_steps[mlgo_index].label)
  }
})
