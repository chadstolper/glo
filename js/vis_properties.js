var graph = {}
var node, nodeclone, link
var node_generations = {}
var xscale, yscale
var transition_duration = 2000

var force
var substrates

var modes = {
  edges: "straight",//"curved", //"straight","circle"
  node_r: "degree", //"constant"
  active_generation: 0,
  source_generation: 0,
  target_generation: 0,
  generation: 0,
}

var width = 650
var height = 500
var xbuffer = 50
var ybuffer = 50
var color = d3.scale.category10()
var link_r = 4
var node_r_constant = 8

var svg = d3.select("#canvas").append("svg")
    .attr("width",width+(2*xbuffer))
    .attr("height",height+(2*ybuffer))

var chart = svg.append("g")
  .attr("transform","translate("+xbuffer+","+ybuffer+")")

var linkg = chart.append("g")
var nodeg = chart.append("g")