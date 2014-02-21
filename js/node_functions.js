var aggregate_nodes = function(prop1,prop2){
    modes.generation+=1
    var aggregates = {}
    for (var node in graph.nodes){
      node = graph.nodes[node]
      var p1 = node[prop1]
      var p2 = node[prop2]
      if(!aggregates[p1+","+p2]){
        aggregates[p1+","+p2] = []
      }
      aggregates[p1+","+p2].push(node)
      // console.log(p1,p2)
    }
    // console.log(aggregates)
    var aggregates_list = []
    for(var key in aggregates){
      aggregates_list.push(aggregates[key])
    }
    var agg_nodes = []
    var i = 0
    for (var agg in aggregates_list){
      agg = aggregates_list[agg]
      agg_node = {}
      agg_node.id = "agg"+modes.generation+"i"+i
      i++
      agg_node.x_list = {}
      agg_node.y_list = {}
      agg_node.r_list = {}
      agg_node.nodes = agg
      agg_node.count = agg.length
      agg_node.degree = agg[0].degree
      agg_node.modularity_class = agg[0].modularity_class
      agg_node.gender = agg[0].gender
      //currently only can size by count
      //we'll need some non-graph-based properties
      agg_node.x_list[modes.generation] = xscale(agg_node[prop1])
      agg_node.y_list[modes.generation] = yscale(agg_node[prop2])
      agg_node.r_list[modes.generation] = agg_node.count*5
      agg_nodes.push(agg_node)
    }
    // console.log(agg_nodes)
    node_generations[modes.generation] = agg_glyphs = nodeg.selectAll(".node[generation='"+modes.generation+"']")
      .data(agg_nodes, function(d){return d.id})
    .enter().append("circle")
      .classed("node",true)
      .classed("aggregate",true)
      .attr("generation",modes.generation)
      .attr("nodeid", function(d){return d.id})
      .attr("r",0)
      .attr("fill", function(d){ return d3.rgb(color(d.modularity_class)).darker(); })
      .on("mouseover",function(d){
        d3.select(this).attr("fill",function(d){ return color(d.modularity_class); })
      })
      .on("mouseout",function(d){
        d3.select(this).attr("fill", function(d){ return d3.rgb(color(d.modularity_class)).darker(); })
      })

  agg_glyphs.append("title")
      .text(function(d){ return d.label; })

  node_generations[modes.active_generation]
    // .each(function(d){
    //   d.r_list[modes.active_generation] = 0
    // })
    .transition().duration(transition_duration)
      .attr("r",0)

  agg_generations[modes.generation] = {}
  agg_generations[modes.generation].source_gen = modes.active_generation
  modes.active_generation = modes.generation
  node = agg_glyphs

  node
    .attr("cx", function(d) { return d.x_list[modes.active_generation]; })
    .attr("cy", function(d) { return d.y_list[modes.active_generation]; });
  
  node.transition().duration(transition_duration)
    .attr("r",function(d){
      return d.r_list[modes.generation]
    })

}

var deaggregate_nodes = function(agg_gen){
  try{
    if(node_generations[agg_gen].data()[0].id.indexOf("agg")!=0){
      console.log("nope, not aggregate")
      return
    }else{
      console.log("yep, aggregate")
      modes.active_generation = agg_generations[agg_gen]
      node_generations[agg_gen]
        .transition().duration(transition_duration)
          .attr("r",0)
        .remove()

      node_generations[modes.active_generation]
        .transition().duration(transition_duration)
          .attr("r",function(d){return d.r_list[modes.active_generation]})

      node_generations[agg_gen] = null
      agg_generations[agg_gen] = null


    }
  }catch(err){
    console.log("nope, not aggregate")
  }
}

var deaggregate_0 = function(){
  deaggregate_nodes(0)
}

var deaggregate_1 = function(){
  deaggregate_nodes(1)
}

var aggregate_nodes_by_gender_and_category = function(){
  aggregate_nodes("gender","modularity_class")
}

var clone_active_set = function(){
  //Stamps a copy of the current position
  //of the nodes.
  modes.generation+=1
  node_generations[modes.generation] = nodeclone = nodeg.selectAll(".node[generation='"+modes.generation+"']")
      .data(graph.nodes, function(d){return d.id})
    .enter().append("circle")
      .classed("node",true)
      .attr("generation",modes.generation)
      .attr("nodeid", function(d){return d.id})
      .attr("r",function(d){
          d.r_list[modes.generation] = d.r_list[modes.active_generation]
          return d.r_list[modes.generation]
        })
      .attr("fill", function(d){ return d3.rgb(color(d.modularity_class)).darker(); })
      .on("mouseover",function(d){
        d3.select(this).attr("fill",function(d){ return color(d.modularity_class); })
      })
      .on("mouseout",function(d){
        d3.select(this).attr("fill", function(d){ return d3.rgb(color(d.modularity_class)).darker(); })
      })

  nodeclone.append("title")
      .text(function(d){ return d.label; })

  nodeclone
    .each(function(d){ d.x_list[modes.generation] = d.x_list[modes.active_generation]})
    .each(function(d){ d.y_list[modes.generation] = d.y_list[modes.active_generation]})
    


  modes.active_generation = modes.generation
  node = nodeclone

  node
    .attr("cx", function(d) { return d.x_list[modes.active_generation]; })
    .attr("cy", function(d) { return d.y_list[modes.active_generation]; });

}

var remove_generation = function(gen){
  if(gen==0){ return; } //cannot remove primary nodes
  if(gen==modes.active_generation){
    select_generation(0) //select primary nodes
    to_remove = node_generations[gen]
    node_generations[gen] = null
    to_remove.remove()
  }
  if(gen==modes.source_generation){
    modes.source_generation = 0
  }
  if(gen==modes.target_generation){
    modes.target_generation = 0
  }
  update_links()
}

var remove_generation_1 = function(){
  remove_generation(1)
}



//Select Generations
var select_generation = function(gen){
  modes.active_generation = gen
  node = node_generations[modes.active_generation]
}

var select_generation_0 = function(){
  select_generation(0)
}

var select_generation_1 = function(){
  select_generation(1)
}

var select_generation_2 = function(){
  select_generation(2)
}




var evenly_position_on_x = function(){
  xscale = d3.scale.ordinal()
    .domain(graph.nodes.map(function(d){ return d.id; }))
    .rangePoints([0,width])

  node.each(function(d){
    d.x_list[modes.active_generation] = xscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x_list[modes.active_generation] })

  update_links()
}

var evenly_position_on_y = function(){
  yscale = d3.scale.ordinal()
    .domain(graph.nodes.map(function(d){ return d.id; }))
    .rangePoints([0,height])

  node.each(function(d){
    d.y_list[modes.active_generation] = yscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cy",function(d){ return d.y_list[modes.active_generation] })

  update_links()
}

var position_y_top = function(){
  yscale = function(d){
    return 0-0.5*ybuffer;
  }

  node.each(function(d){
    d.y_list[modes.active_generation] = yscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cy",function(d){ return d.y_list[modes.active_generation] })

  update_links()
}

var position_y_middle = function(){
  yscale = function(d){
    return height/2;
  }

  node.each(function(d){
    d.y_list[modes.active_generation] = yscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cy",function(d){ return d.y_list[modes.active_generation] })

  update_links()
}

var position_y_bottom = function(){
  yscale = function(d){
    return height+0.5*ybuffer;
  }

  node.each(function(d){
    d.y_list[modes.active_generation] = yscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cy",function(d){ return d.y_list[modes.active_generation] })

  update_links()
}


var position_x_left = function(){
  xscale = function(d){
    return 0-0.5*xbuffer;
  }

  node.each(function(d){
    d.x_list[modes.active_generation] = xscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x_list[modes.active_generation] })

  update_links()
}

var position_x_center = function(){
  xscale = function(d){
    return width/2;
  }

  node.each(function(d){
    d.x_list[modes.active_generation] = xscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x_list[modes.active_generation] })

  update_links()
}

var position_x_right = function(){
  xscale = function(d){
    return width+0.5*xbuffer;
  }

  node.each(function(d){
    d.x_list[modes.active_generation] = xscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x_list[modes.active_generation] })

  update_links()
}


