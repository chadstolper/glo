var init = function(){
  initialize_graph()
  initialize_graph_svg()
}

var initialize_graph = function(){
  var nodes = graph.nodes
  var edges = graph.edges

  for(var e in edges){
    e = edges[e]
    e.source = nodes[e.source]
    e.target = nodes[e.target]
  }

  graph.nodes.forEach(function(d){
    d.in_edges = []
    d.out_edges = []
    d.x_list = {}
    d.y_list = {}
    d.r_list = {}
    d.radius_list = {}
    d.theta_list = {}
  })
  graph.edges.forEach(function(d){
    d.target.in_edges.push(d)
    d.source.out_edges.push(d)
    d.visibility = true
  })
}


var initialize_graph_svg = function(){



  //Initialize node glyphs in center of display
  node_generations[0] = node = nodeg.selectAll(".node.gen-0")
      .data(graph.nodes, function(d){return d.id})
    .enter().append("circle")
      .classed("node",true)
      .classed("gen-"+0,true)
      .attr("nodeid", function(d){return d.id})
      .each(function(d){
        d.x = width/2
        d.y = height/2
      })
      .attr("r",function(d){
        if(modes.node_r=="constant"){
          d.r_list[0] = node_r_constant
        }else if(modes.node_r=="degree"){
          d.r_list[0]  = d.degree+2
        }
        return d.r_list[0]
      })
      .attr("cx", function(d) { d.x_list[modes.active_generation]= d.x; return d.x_list[modes.active_generation]; })
      .attr("cy", function(d) { d.y_list[modes.active_generation] = d.y; return d.y_list[modes.active_generation]; })
      .each(function(d){
        d.radius_list[0] = Math.min(width,height)*.45
        d.theta_list[0] = Math.PI/2
      })
      .attr("fill", function(d){ return d3.rgb(color(d.modularity_class)).darker(); })
      .on("mouseover",function(d){
        d3.select(this).attr("fill",function(d){ return color(d.modularity_class); })
      })
      .on("mouseout",function(d){
        d3.select(this).attr("fill", function(d){ return d3.rgb(color(d.modularity_class)).darker(); })
      })
  node.append("title")
    .text(function(d){ return d.label; })


  //Initialize Edge Glyphs
  link = link_generations[0] = linkg.selectAll(".link[generation='0']")
      .data(graph.edges, function(d){return d.id})
    .enter().append("svg:path")
      .classed("link",true)
      .attr("generation",0)
      .attr("stroke-width", function(d) { return Math.sqrt(d.weight); })
      // .attr("class", function(d) { return "link " + d.type; })
      // .attr("marker-end", function(d) { return "url(#arrow)"; })
      .on("mouseover",function(d){
        d3.select('.node.gen-'+modes.source_generation+'[nodeid="'+d.source.id+'"]').attr("fill", color(d.source.modularity_class) )
        d3.select('.node.gen-'+modes.target_generation+'[nodeid="'+d.target.id+'"]').attr("fill", color(d.target.modularity_class) )
      })
      .on("mouseout",function(d){
        d3.select('.node.gen-'+modes.source_generation+'[nodeid="'+d.source.id+'"]').attr("fill", d3.rgb(color(d.source.modularity_class)).darker() )
        d3.select('.node.gen-'+modes.target_generation+'[nodeid="'+d.target.id+'"]').attr("fill", d3.rgb(color(d.target.modularity_class)).darker() )
      })
      .each(function(d){
          d.startx = function(){ return this.source.x_list[modes.source_generation]; }
          d.starty = function(){ return this.source.y_list[modes.source_generation]; }
          d.endx = function(){ return this.target.x_list[modes.target_generation]; }
          d.endy = function(){ return this.target.y_list[modes.target_generation]; }
      })
  link.call(link_function)
  select_generation(0)
}