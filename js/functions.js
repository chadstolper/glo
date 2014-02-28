var initialize_force_directed = function(){
  mlgo_buttons.attr("disabled","true")
  
  force = d3.layout.force()
      .charge(-200)
      .linkDistance(75)
      .size([width,height])

  force
      .nodes(graph.nodes)
      .links(graph.edges)
      .start()

    // link = linkg.selectAll(".link")
    //     .data(graph.edges)
    //   .enter().append("line")
    //     .classed("link",true)
    //     .style("stroke-width", function(d) { return Math.sqrt(d.weight); });

    //http://stackoverflow.com/questions/11368339/drawing-multiple-edges-between-two-nodes-with-d3
    // Per-type markers, as they don't inherit styles.
    var defs = svg.append("svg:defs")

      defs.append("svg:marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 5)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .attr("fill","none")
        .attr("stroke","black")
        .attr("opacity",0.45)
      .append("svg:path")
        .attr("d", "M0,-1L4,0L0,1");

      var grad = defs.append("svg:linearGradient")
          .attr("id","nxny")
          .attr("x1","0%")
          .attr("x2","100%")
          .attr("y1","0%")
          .attr("y2","100%")
        grad.append("stop")
          .attr("offset","0%")
          .style("stop-opacity",0.0)
          .style("stop-color","black")
        grad.append("stop")
          .attr("offset","100%")
          .style("stop-opacity",0.95)
          .style("stop-color","black")

      var grad = defs.append("svg:linearGradient")
          .attr("id","nxpy")
          .attr("x1","0%")
          .attr("x2","100%")
          .attr("y1","100%")
          .attr("y2","0%")
        grad.append("stop")
          .attr("offset","0%")
          .style("stop-opacity",0.0)
          .style("stop-color","black")
        grad.append("stop")
          .attr("offset","100%")
          .style("stop-opacity",0.95)
          .style("stop-color","black")

      var grad = defs.append("svg:linearGradient")
          .attr("id","pxny")
          .attr("x1","100%")
          .attr("x2","0%")
          .attr("y1","0%")
          .attr("y2","100%")
        grad.append("stop")
          .attr("offset","0%")
          .style("stop-opacity",0.0)
          .style("stop-color","black")
        grad.append("stop")
          .attr("offset","100%")
          .style("stop-opacity",0.95)
          .style("stop-color","black")

      var grad = defs.append("svg:linearGradient")
          .attr("id","pxpy")
          .attr("x1","100%")
          .attr("x2","0%")
          .attr("y1","100%")
          .attr("y2","0%")
        grad.append("stop")
          .attr("offset","0%")
          .style("stop-opacity",0.0)
          .style("stop-color","black")
        grad.append("stop")
          .attr("offset","100%")
          .style("stop-opacity",0.95)
          .style("stop-color","black")

      var grad = defs.append("svg:linearGradient")
          .attr("id","down")
          .attr("x1","0%")
          .attr("x2","0%")
          .attr("y1","100%")
          .attr("y2","0%")
        grad.append("stop")
          .attr("offset","0%")
          .style("stop-opacity",0.0)
          .style("stop-color","black")
        grad.append("stop")
          .attr("offset","100%")
          .style("stop-opacity",0.95)
          .style("stop-color","black")

      var grad = defs.append("svg:linearGradient")
          .attr("id","up")
          .attr("x1","0%")
          .attr("x2","0%")
          .attr("y1","0%")
          .attr("y2","100%")
        grad.append("stop")
          .attr("offset","0%")
          .style("stop-opacity",0.0)
          .style("stop-color","black")
        grad.append("stop")
          .attr("offset","100%")
          .style("stop-opacity",0.95)
          .style("stop-color","black")

      var grad = defs.append("svg:linearGradient")
          .attr("id","right")
          .attr("x1","0%")
          .attr("x2","100%")
          .attr("y1","0%")
          .attr("y2","0%")
        grad.append("stop")
          .attr("offset","0%")
          .style("stop-opacity",0.0)
          .style("stop-color","black")
        grad.append("stop")
          .attr("offset","100%")
          .style("stop-opacity",0.95)
          .style("stop-color","black")

      var grad = defs.append("svg:linearGradient")
          .attr("id","left")
          .attr("x1","100%")
          .attr("x2","0%")
          .attr("y1","0%")
          .attr("y2","0%")
        grad.append("stop")
          .attr("offset","0%")
          .style("stop-opacity",0.0)
          .style("stop-color","black")
        grad.append("stop")
          .attr("offset","100%")
          .style("stop-opacity",0.95)
          .style("stop-color","black")


    link = link_generations[0] = linkg.selectAll(".link[generation='0']")
        .data(graph.edges, function(d){return d.id})
      .enter().append("svg:path")
        .classed("link",true)
        .attr("generation",0)
        .attr("stroke-width", function(d) { return Math.sqrt(d.weight); })
        // .attr("class", function(d) { return "link " + d.type; })
        // .attr("marker-end", function(d) { return "url(#arrow)"; })

        .on("mouseover",function(d){
          d3.select('.node[generation="'+modes.source_generation+'"][nodeid="'+d.source.id+'"]').attr("fill", color(d.source.modularity_class) )
          d3.select('.node[generation="'+modes.target_generation+'"][nodeid="'+d.target.id+'"]').attr("fill", color(d.target.modularity_class) )
        })
        .on("mouseout",function(d){
          d3.select('.node[generation="'+modes.source_generation+'"][nodeid="'+d.source.id+'"]').attr("fill", d3.rgb(color(d.source.modularity_class)).darker() )
          d3.select('.node[generation="'+modes.target_generation+'"][nodeid="'+d.target.id+'"]').attr("fill", d3.rgb(color(d.target.modularity_class)).darker() )
        
        })

    node_generations[0] = node = nodeg.selectAll(".node[generation='0']")
        .data(graph.nodes, function(d){return d.id})
      .enter().append("circle")
        .classed("node",true)
        .attr("generation",0)
        .attr("nodeid", function(d){return d.id})
        .attr("r",function(d){
          if(modes.node_r=="constant"){
            d.r_list[0] = node_r_constant
          }else if(modes.node_r=="degree"){
            d.r_list[0]  = d.degree+2
          }
          return d.r_list[0]
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

    force.on("tick", function(){

      //This is SUPER ugly,
      //but likely the only effective way to do it
      //since it has to be after the source/target
      //mappings but before link_function is called
      //the first time
      link
        .each(function(d){
          d.startx = function(){ return this.source.x_list[modes.source_generation]; }
          d.starty = function(){ return this.source.y_list[modes.source_generation]; }
          d.endx = function(){ return this.target.x_list[modes.target_generation]; }
          d.endy = function(){ return this.target.y_list[modes.target_generation]; }
        })
        


      node.attr("cx", function(d) { d.x_list[modes.active_generation]= d.x; return d.x_list[modes.active_generation]; })
          .attr("cy", function(d) { d.y_list[modes.active_generation] = d.y; return d.y_list[modes.active_generation]; })
          


      link.call(link_function)

    })

    force.on("end",function(){
      graph.nodes.forEach(function(d){
        d.in_edges = []
        d.out_edges = []
      })
      graph.edges.forEach(function(d){
        d.target.in_edges.push(d)
        d.source.out_edges.push(d)
        d.visibility = true

      })
      mlgo_buttons.attr("disabled",null)

    })
}

var force_directed =function(){

  node_data().forEach(function(d){
    d.x = d.x_list[modes.active_generation]
    d.y = d.y_list[modes.active_generation]
  })

  force
    .nodes(node_data())
    .links(link_data())
    .on("tick", function(){
      link_generations[modes.active_link_generation]
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    

      

      node_generations[modes.active_generation]
        .attr("cx", function(d) { d.x_list[modes.active_generation] = d.x; return d.x_list[modes.active_generation]; })
        .attr("cy", function(d) { d.y_list[modes.active_generation] = d.y; return d.y_list[modes.active_generation]; });
      
      link_generations[modes.active_link_generation].call(link_function)

      
      // update_links()

    })
    .on("end",update_rolled_up())
    // .resume()
    .start()
}

var hide_links = function(){
  // link.style("visibility","hidden")
  graph.edges.forEach(function(d){
    d.visibility = false
  })
  node.call(hide_links_node_callbacks)
  if(nodeclone) nodeclone.call(hide_links_node_callbacks)
  update_links()
}

var hide_links_node_callbacks = function(selection){
  selection
    .on("mouseover",function(d){
      d3.select(this).attr("fill",function(d){ return color(d.modularity_class); })
    })
    .on("mouseout",function(d){
      d3.select(this).attr("fill", function(d){ return d3.rgb(color(d.modularity_class)).darker(); })
    })
}

var show_links = function(){
  // link.style("visibility","visible")
  graph.edges.forEach(function(d){
    d.visibility = true
  })
  node.call(show_links_node_callbacks)
  if(nodeclone) nodeclone.call(show_links_node_callbacks)
  update_links()
}

var show_links_node_callbacks = function(selection){
  selection
    .on("mouseover",function(d){
      d3.select(this).attr("fill",function(d){ return color(d.modularity_class); })
    })
    .on("mouseout",function(d){
      d3.select(this).attr("fill", function(d){ return d3.rgb(color(d.modularity_class)).darker(); })
    })
}

var show_selected_links = function(){
  // link.style("visibility","hidden")
  link_generations[modes.active_link_generation].each(function(d){
    d.visibility = false
  })
  node_generations[modes.active_generation].call(show_selected_links_node_callbacks)
  update_links()
}

var show_selected_links_node_callbacks = function(selection){
  selection
    .on('mouseover',function(d){
      d3.select(this).attr("fill",function(d){ return color(d.modularity_class); })
      d.in_edges.forEach(function(e){
        e.visibility = true
      })
      d.out_edges.forEach(function(e){
        e.visibility = true
      })
      update_links()
    })
    .on("mouseout",function(d){
      d3.select(this).attr("fill", function(d){ return d3.rgb(color(d.modularity_class)).darker(); })
      d.in_edges.forEach(function(e){
        e.visibility = false
      })
      d.out_edges.forEach(function(e){
        e.visibility = false
      })
      update_links()
    })
}


var transition_x_by_betweenness = function(){

  xscale = d3.scale.linear()
      .range([0,width])
      .domain([0,d3.max(graph.nodes.map(function(d){return d.betweenness_centrality; }))])
      .nice()


  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cx",function(d){
      d.x_list[modes.active_generation] = xscale(d.betweenness_centrality)
      return d.x_list[modes.active_generation]
    })

  update_rolled_up()

  update_links()
}

var transition_x_by_degree = function(){

  xscale = d3.scale.linear()
      .range([0,width])
      .domain([0,d3.max(graph.nodes.map(function(d){return d.degree; }))])
      .nice()


  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cx",function(d){
      d.x_list[modes.active_generation] = xscale(d.degree)
      return d.x_list[modes.active_generation]
    })

  update_rolled_up()
  


  update_links()
}

var transition_x_by_gender = function(){
  xscale = d3.scale.ordinal()
    .rangePoints([0,width],1)
    .domain(['F','M'])
    // .domain(graph.nodes.map(function(d){return d.gender}))


  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cx",function(d){
      d.x_list[modes.active_generation] = xscale(d.gender)
      return d.x_list[modes.active_generation]
    })

  update_rolled_up()

  update_links()
}

var transition_y = function(){
 
  yscale = d3.scale.linear()
      .range([height,0])
      .domain([0,d3.max(graph.nodes.map(function(d){return d.degree; }))])
      .nice()

  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cy",function(d){
      d.y_list[modes.active_generation] = yscale(d.degree)
      return d.y_list[modes.active_generation]
    })
  
  update_rolled_up()

  update_links()
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

var hide_x_axis = function(){
  $(svg.select(".x.axis").node()).remove()
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

var hide_y_axis = function(){
  $(svg.select(".y.axis").node()).remove()
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

  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cy",function(d){
      d.y_list[modes.active_generation] = yscale(d.modularity_class)
      return d.y_list[modes.active_generation]
    })
  
  update_rolled_up()

  update_links()
}

var scatter_on_x = function(){
  var substrates = substrate()

  substrates.forEach(function(category){
    category.xscale = d3.scale.ordinal()
      .domain(category.values.map(function(d){return d.id}))
      .rangePoints([0,width],1.0)
    category.values.forEach(function(d){
      d.x_list[modes.active_generation] = category.xscale(d.id)
    })
  })

  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x_list[modes.active_generation] })

  update_rolled_up()

  update_links()
}


var size_nodes_by_degree = function(){
  modes.node_r = "degree"
  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("r",function(d){return d.degree+2; })
 
}

var size_nodes_by_constant = function(){
  modes.node_r = "constant"
  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("r", node_r_constant)
  
}




var update_rolled_up = function(){
  if(activeGenIsAggregate()){
    node_generations[modes.active_generation]
      .each(function(d){
        d.nodes.forEach(function(n){
          n.x_list[agg_generations[modes.active_generation].source_gen] = d.x_list[modes.active_generation]
          n.y_list[agg_generations[modes.active_generation].source_gen] = d.y_list[modes.active_generation]
        })
      })
    node_generations[agg_generations[modes.active_generation].source_gen]
      .attr("cx",function(d){return d.x_list[agg_generations[modes.active_generation].source_gen]})
      .attr("cy",function(d){return d.y_list[agg_generations[modes.active_generation].source_gen]})
  }
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