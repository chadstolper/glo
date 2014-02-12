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


