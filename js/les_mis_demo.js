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

var force
var substrates


var width = 700
var height = 500
var xbuffer = 50
var ybuffer = 50
var color = d3.scale.category20()

var svg = d3.select("#canvas").append("svg")
    .attr("width",width+2*xbuffer)
    .attr("height",height+2*ybuffer)

var chart = svg.append("g")
  .attr("transform","translate("+xbuffer+","+ybuffer+")")

var linkg = chart.append("g")
var nodeg = chart.append("g")




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

    force = d3.layout.force()
      .charge(-200)
      .linkDistance(75)
      .size([width,height])

    

     

  })
})


var force_directed = function(){
  mlgo_buttons.attr("disabled","true")
  

  force
      .nodes(graph.nodes)
      .links(graph.edges)
      .start()

    link = linkg.selectAll(".link")
        .data(graph.edges)
      .enter().append("line")
        .classed("link",true)
        .style("stroke-width", function(d) { return Math.sqrt(d.weight); });

    node = nodeg.selectAll(".node")
        .data(graph.nodes)
      .enter().append("circle")
        .classed("node",true)
        // .attr("r", function(d){ return d.degree; })
        .attr("r",5)
        .attr("fill", function(d){ return color(d.modularity_class); })

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
      mlgo_buttons.attr("disabled",null)
    })
}

var hide_links = function(){
  link.style("visibility","hidden")
}

var show_links = function(){
  link.style("visibility","visible")
}


var transition_x = function(){
  mlgo_buttons.attr("disabled","true")

  xscale = d3.scale.linear()
      .range([0,width])
      .domain([0,d3.max(graph.nodes.map(function(d){return d.betweenness_centrality; }))])
      .nice()


  node.transition().duration(transition_duration)
    .attr("cx",function(d){
      d.x = xscale(d.betweenness_centrality)
      return d.x
    })
    .each("end",function(){
      mlgo_buttons.attr("disabled",null)
    })

  link.transition().duration(transition_duration)
    .attr("x1", function(d) { return d.source.x; })
    .attr("x2", function(d) { return d.target.x; })

}


var transition_y = function(){
  mlgo_buttons.attr("disabled","true")
 
  yscale = d3.scale.linear()
      .range([height,0])
      .domain([0,d3.max(graph.nodes.map(function(d){return d.degree; }))])
      .nice()

  node.transition().duration(transition_duration)
    .attr("cy",function(d){
      d.y = yscale(d.degree)
      return d.y
    })
    .each("end",function(){
      mlgo_buttons.attr("disabled",null)
    })

  link.transition().duration(transition_duration)
    .attr("y1", function(d) { return d.source.y; })
    .attr("y2", function(d) { return d.target.y; });
}

var draw_x_axis = function(){
  var xaxis = d3.svg.axis()
    .scale(xscale)
    .orient("bottom")

  svg.append("g")
    .attr("class","x axis")
    .attr("transform","translate("+xbuffer+","+ (height+ybuffer) + ")")
    .call(xaxis)
}

var draw_y_axis = function(){
  var yaxis = d3.svg.axis()
    .scale(yscale)
    .orient("left")

  svg.append("g")
    .attr("class","y axis")
    .attr("transform","translate("+(xbuffer-20)+","+ybuffer+")")
    .call(yaxis)
}

var substrate = function(){
  if(!substrates){
    substrates = d3.nest()
      .key(function(d){return d.modularity_class})
      .entries(graph.nodes)
  }
  return substrates
}

var substrate_on_y = function(){

  var substrates = substrate()

  yscale = d3.scale.ordinal()
    .domain(substrates.map(function(d){return d.key; }))
    .rangePoints([height,0],1.0)

  node.transition().duration(transition_duration)
    .attr("cy",function(d){
      d.y = yscale(d.modularity_class)
      return d.y
    })
    .each("end",function(){
      mlgo_buttons.attr("disabled",null)
    })

  link.transition().duration(transition_duration)
    .attr("y1", function(d) { return d.source.y; })
    .attr("y2", function(d) { return d.target.y; });
}

var scatter_on_x = function(){
  var substrates = substrate()

  substrates.forEach(function(category){
    category.xscale = d3.scale.ordinal()
      .domain(category.values.map(function(d){return d.id}))
      .rangePoints([0,width],1.0)
    category.values.forEach(function(d){
      d.x = category.xscale(d.id)
    })
  })

  node.transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x })

  link.transition().duration(transition_duration)
    .attr("x1", function(d) { return d.source.x; })
    .attr("x2", function(d) { return d.target.x; })


}

// force_directed = function(){}
// var hide_links = function(){}
// var transition_x = function(){}
// var draw_x_axis = function(){}
// var transition_y = function(){}
// var draw_y_axis = function(){}
// var show_links = function(){}
var finished = function(){
  mlgo.attr("disabled","true")
}


//The Button
var mlgo_index = 0
var mlgo_steps = [
  {f:force_directed, label:"Force-Directed", disabled:false},
  {f:hide_links, label:"Hide Links", disabled:true},
  {f:transition_x, label:"Transition X by Betweenness Centrality", disabled:true},
  {f:draw_x_axis, label:"Draw X Axis", disabled:true},
  {f:transition_y, label:"Transition Y by Degree", disabled:true},
  {f:draw_y_axis, label:"Draw Y Axis", disabled:true},
  {f:show_links, label:"Show Links", disabled:true},
  {f:substrate_on_y, label:"Substrate by Category", disabled:true},
  {f:scatter_on_x, label:"Scatter on X", disabled:true},
  // {f:finished, label:"Finished"}
  ]

var mlgo_buttons = d3.select("#buttons").selectAll(".step")
    .data(mlgo_steps)
  .enter().append("button")
    .text(function(d){return d.label; })
    .on("click",function(d,i){
      d.f()
      d.disabled = true
      update_buttons()
    })

update_buttons()

function update_buttons(){
  d3.select("#buttons").selectAll(".step")
    .attr("disabled",function(d){return (d.disabled==true)?"true":null;})
}
