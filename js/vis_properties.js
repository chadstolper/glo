var graph = {}
var node, nodeclone, link
var xscale, yscale
var transition_duration = 2000

var force
var substrates

var modes = {
  edges: "curved", //"straight","circle"
  node_r: "degree", //"constant"
}

var width = 700
var height = 700
var xbuffer = 50
var ybuffer = 50
var color = d3.scale.category10()
var link_r = 4
var node_r_constant = 5

var svg = d3.select("#canvas").append("svg")
    .attr("width",width+(2*xbuffer))
    .attr("height",height+(2*ybuffer))

var chart = svg.append("g")
  .attr("transform","translate("+xbuffer+","+ybuffer+")")

var linkg = chart.append("g")
var nodeg = chart.append("g")