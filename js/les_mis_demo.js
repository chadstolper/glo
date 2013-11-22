var width = 900
var height = 500

var color = d3.scale.category20()

var force = d3.layout.force()
    .charge(-200)
    .linkDistance(75)
    .size([width,height])

var svg = d3.select("#canvas").append("svg")
    .attr("width",width)
    .attr("height",height)

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


    force
      .nodes(nodes)
      .links(edges)
      .start()

    var link = svg.selectAll(".link")
        .data(edges)
      .enter().append("line")
        .classed("link",true)
        .style("stroke-width", function(d) { return Math.sqrt(d.weight); });

    var node = svg.selectAll(".node")
        .data(nodes)
      .enter().append("circle")
        .classed("node",true)
        .attr("r", function(d){ return d.degree; })
        .attr("fill", function(d){ return color(d.modularity_class); })
        .call(force.drag)

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
  })
})
