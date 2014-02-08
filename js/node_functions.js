var clone_active_set = function(){
  //Stamps a copy of the current position
  //of the nodes.
  modes.generation+=1
  node_generations[modes.generation] = nodeclone = nodeg.selectAll(".node.generation-"+modes.generation)
      .data(graph.nodes, function(d){return d.id})
    .enter().append("circle")
      .classed("node",true)
      .classed("generation-"+modes.generation,true)
      .attr("r",function(d){
        if(modes.node_r=="constant"){
          return node_r_constant
        }else if(modes.node_r=="degree"){
          return d.degree+2
        }
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

var remove_clones = function(){
  select_generation_0()
  modes.generation = 0
  
}



//Select Generations
var select_generation_0 = function(){
  modes.active_generation = 0
  node = node_generations[modes.active_generation]

}

var select_generation_1 = function(){
  modes.active_generation = 1
  node = node_generations[modes.active_generation]
}

var select_generation_2 = function(){
  modes.active_generation = 2
  node = node_generations[modes.active_generation]
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


