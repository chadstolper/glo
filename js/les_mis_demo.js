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

var modes = {
  edges: "curved", //"straight","circle"
}

var width = 700
var height = 500
var xbuffer = 50
var ybuffer = 50
var color = d3.scale.category10()
var link_r = 7

var svg = d3.select("#canvas").append("svg")
    .attr("width",width+2*xbuffer)
    .attr("height",height+2*ybuffer)

var chart = svg.append("g")
  .attr("transform","translate("+xbuffer+","+ybuffer+")")

var linkg = chart.append("g")
var nodeg = chart.append("g")


var source = "LesMis"
// var source = "TinyToy"


//Load Data
d3.csv("data/"+source+"/nodes.csv",function(nodes){
  d3.csv("data/"+source+"/edges.csv",function(edges){
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
      // console.log(d)
      d.source = +d.source
      d.target = +d.target
      // d.type = +d.type
      d.id = +d.id
      d.weight = +d.weight
    })

    graph.nodes = nodes
    graph.edges = edges

  })
})






