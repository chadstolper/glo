var graph = {}
var node, nodeclone, link
var node_generations = {}
var link_generations = {}
var agg_generations = {}
var subgraph_generations = {}
var xscale, yscale
var xprop, yprop
var transition_duration = 500


var y_substrates
var x_substrates

var force


var modes = {
  edges: "straight",//"curved", //"straight","circle",
  link_display: "all", //"some","none",
  node_r: "degree", //"degree", //"constant"
  active_generation: 0,
  source_generation: 0,
  target_generation: 0,
  link_generation: 0,
  active_link_generation: 0,
  generation: 0,
  link_generation: 0,
}

var node_data = function(){
  return node_generations[modes.active_generation].data()
}
var link_data = function(){
  return link_generations[modes.active_link_generation].data()
}

var activeGenIsAggregate = function(){
  if(agg_generations[modes.active_generation]){
    return true
  }
  return false
}

var num_gen = function(){
  var i = 0;
  for(var g in node_generations){
    if(node_generations[g]!=null){
      i++
    }
  }
  return i;
}

var generation_index = function(gen) {
  var map = {}
  var i = 0
  for(var g in node_generations){
    if(node_generations[g]!=null && g!=gen){
      i++
    }else{
      return i/num_gen();
    }
  }
}

var width = 610
var height = 490
var xbuffer = 50
var ybuffer = 50
var color = d3.scale.category10()
var link_r = 2
var max_link_curve_r = 15
var node_r_constant = 8

var xaxis = false
var yaxis = false

var svg = d3.select("#canvas").append("svg")
    .attr("width",width+(2*xbuffer))
    .attr("height",height+(2*ybuffer))

var chart = svg.append("g")
  .attr("transform","translate("+xbuffer+","+ybuffer+")")

var x_axis_g = svg.append("g")
    .attr("class","x axis")
    .attr("transform","translate("+xbuffer+","+ (height+ybuffer+20) + ")")

var y_axis_g = svg.append("g")
  .attr("class","y axis")
  .attr("transform","translate("+(xbuffer-20)+","+ybuffer+")")


var linkg = chart.append("g")
var nodeg = chart.append("g")