var force_directed =function(){

  if(!force){
    // force = d3.layout.force()
    force = cola.d3adaptor()
      // .linkDistance(40)
      .jaccardLinkLengths(32,0.7)
      .size([width,height])
  }

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
    .start(10,15,20)
}

var force_directed_stop_immediately = function(){
   force_directed();
   for (var i = 0; i < 100; ++i) force.tick();
   force.stop();
}

var hide_links = function(){
  // link.style("visibility","hidden")
  modes.link_display = "none"
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
  modes.link_display="all"
  link_generations[modes.active_link_generation].each(function(d){
    d.visibility = true
  })
  node_generations[modes.active_generation].call(show_links_node_callbacks)
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
  modes.link_display = "some"
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


function is_number(n) {
  //http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var position_x_by_property = function(prop){
  if(prop=="modularity_class" || prop=="generation"){
    set_xscale_by_nominal_property(prop)
  }else if(is_number(node_data()[0][prop])){
    set_xscale_by_quantitative_property(prop)
  }else{
    set_xscale_by_nominal_property(prop)
  }


  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cx",function(d){
      d.x_list[modes.active_generation] = xscale(d[prop])
      return d.x_list[modes.active_generation]
    })

  update_axes()
  update_rolled_up()
  update_links()
}

var set_xscale_by_quantitative_property = function(prop){
  xscale = d3.scale.linear()
      .range([0,width])
      .domain([0,d3.max(node_data().map(function(d){return d[prop]; }))])
      .nice()
}

var set_xscale_by_nominal_property = function(prop){
  if(prop=="generation"){
    xscale = d3.scale.linear()
      .domain([0,1])
      .range([0,width])
      .nice()
  }else{
    substrate_on_x(prop)
  }
}

var transition_x_by_betweenness = function(){
  position_x_by_property("betweenness_centrality")
}

var transition_x_by_degree = function(){
  position_x_by_property("degree")
}

var transition_x_by_gender = function(){
  position_x_by_property("gender")
}


var position_y_by_property = function(prop){
  if(prop=="modularity_class" || prop=="generation"){
    set_yscale_by_nominal_property(prop)
  }else if(is_number(node_data()[0][prop])){
    set_yscale_by_quantitative_property(prop)
  }else{
    set_yscale_by_nominal_property(prop)
  }


  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cy",function(d){
      d.y_list[modes.active_generation] = yscale(d[prop])
      return d.y_list[modes.active_generation]
    })

  update_axes()
  update_rolled_up()
  update_links()
}

var set_yscale_by_quantitative_property = function(prop){
  yscale = d3.scale.linear()
      .range([height,0])
      .domain([0,d3.max(node_data().map(function(d){return d[prop]; }))])
      .nice()
}

var set_yscale_by_nominal_property = function(prop){
  if(prop=="generation"){
    yscale = d3.scale.linear()
      .domain([0,1])
      .range([height,0])
  }else{
    substrate_on_y(prop)
  }
}

var transition_y_by_betweenness = function(){
  position_y_by_property("betweenness_centrality")
}

var transition_y_by_degree = function(){
  position_y_by_property("degree")
}

var transition_y_by_gender = function(){
  position_y_by_property("gender")
}



var draw_x_axis = function(){
  xaxis = d3.svg.axis()
    .scale(xscale)
    .orient("bottom")

  try{
    x_axis_g.call(xaxis)
  }catch(err){
    $(svg.select(".x.axis").node()).empty()
  }
}

var hide_x_axis = function(){
  $(svg.select(".x.axis").node()).empty()
  xaxis = false
}

var draw_y_axis = function(){
  yaxis = d3.svg.axis()
    .scale(yscale)
    .orient("left")

  try{
    y_axis_g.call(yaxis)
  }catch(err){
    $(svg.select(".y.axis").node()).empty()
  }
}

var hide_y_axis = function(){
  $(svg.select(".y.axis").node()).empty()
  yaxis = false
}




var y_substrate = function(prop){
  y_substrates = d3.nest()
      .key(function(d){return d[prop]})
      .entries(node_data())
  return y_substrates
}

var x_substrate = function(prop){
  x_substrates = d3.nest()
      .key(function(d){return d[prop]})
      .entries(node_data())
  return x_substrates
}

var substrate_on_y = function(prop){
  y_substrate(prop)

  yscale = d3.scale.ordinal()
    .domain(y_substrates.map(function(d){return d.key; }))
    .rangePoints([height,0],1.0)

  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cy",function(d){
      d.y_list[modes.active_generation] = yscale(d[prop])
      return d.y_list[modes.active_generation]
    })
  
  update_axes()
  update_rolled_up()
  update_links()
}

var substrate_on_x = function(prop){
  x_substrate(prop)

  xscale = d3.scale.ordinal()
    .domain(x_substrates.map(function(d){return d.key; }))
    .rangePoints([width,0],1.0)

  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cx",function(d){
      d.x_list[modes.active_generation] = xscale(d[prop])
      return d.x_list[modes.active_generation]
    })
  
  update_axes()
  update_rolled_up()
  update_links()
}


var scatter_on_x = function(){
  if(!y_substrates){
    evenly_position_on_x()
    return;
  }

  y_substrates.forEach(function(category){
    category.xscale = d3.scale.ordinal()
      .domain(category.values.map(function(d){return d.id}))
      .rangePoints([0,width],1.0)
    category.values.forEach(function(d){
      d.x_list[modes.active_generation] = category.xscale(d.id)
    })
  })

  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x_list[modes.active_generation] })

  update_axes()
  update_rolled_up()
  update_links()
}

var scatter_on_y = function(){
  if(!x_substrates){
    evenly_position_on_y()
    return;
  }

  x_substrates.forEach(function(category){
    category.yscale = d3.scale.ordinal()
      .domain(category.values.map(function(d){return d.id}))
      .rangePoints([0,height],1.0)
    category.values.forEach(function(d){
      d.y_list[modes.active_generation] = category.yscale(d.id)
    })
  })

  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cy",function(d){ return d.y_list[modes.active_generation] })

  update_axes()
  update_rolled_up()
  update_links()
}


var position_y_by_modularity_class = function(){
  substrate_on_y("modularity_class")
}


var size_nodes_by_degree = function(){
  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("r", function(d){
      d.r_list[modes.active_generation] = d.degree+2
      return d.r_list[modes.active_generation]
    })
 
}

var size_nodes_by_constant = function(){
  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("r", function(d){
      d.r_list[modes.active_generation] = node_r_constant
      return d.r_list[modes.active_generation]
    })
}

var size_nodes_by_count = function(){
  if(!agg_generations[modes.active_generation]){
    return;
  }
  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("r", function(d){
      d.r_list[modes.active_generation] = d.count*3
      return d.r_list[modes.active_generation]
    })
}




var update_rolled_up = function(){
  if(activeGenIsAggregate()){
    node_generations[modes.active_generation]
      .each(function(d){
        d.nodes.forEach(function(n){
          n.x_list[modes.active_generation] = d.x_list[modes.active_generation]
          n.y_list[modes.active_generation] = d.y_list[modes.active_generation]
          n.x_list[agg_generations[modes.active_generation].source_gen] = d.x_list[modes.active_generation]
          n.y_list[agg_generations[modes.active_generation].source_gen] = d.y_list[modes.active_generation]
        })
      })
    node_generations[agg_generations[modes.active_generation].source_gen]
      .attr("cx",function(d){return d.x_list[agg_generations[modes.active_generation].source_gen]})
      .attr("cy",function(d){return d.y_list[agg_generations[modes.active_generation].source_gen]})
  }
}



var update_axes = function(){
  if(xaxis){
    draw_x_axis()
  }

  if(yaxis){
    draw_y_axis()
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