var clone_nodes = function(){
  //Stamps a copy of the current position
  //of the nodes.
  nodeclone = nodeg.selectAll(".node.clone")
      .data(graph.nodes, function(d){return d.id})
    .enter().append("circle")
      .classed("node",true)
      .classed("clone",true)
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
    .attr("cx", function(d) { d.clonex = d.x+0; return d.clonex; })
    .attr("cy", function(d) { d.cloney = d.y+0; return d.cloney; });

}

var remove_clones = function(){
  if(!nodeclone){ return; }
  nodeclone.each(function(d){
    d.clonex = null
    d.cloney = null
  })
  nodeclone.remove()
  nodeclone = null
  link.transition().duration(transition_duration)
    .call(link_function)
}


var evenly_position_on_x = function(){
  xscale = d3.scale.ordinal()
    .domain(graph.nodes.map(function(d){ return d.id; }))
    .rangePoints([0,width])

  node.each(function(d){
    d.x = xscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x })

  update_links()
}

var evenly_position_on_y = function(){
  yscale = d3.scale.ordinal()
    .domain(graph.nodes.map(function(d){ return d.id; }))
    .rangePoints([0,height])

  node.each(function(d){
    d.y = yscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cy",function(d){ return d.y })

  update_links()
}

var position_y_top = function(){
  yscale = function(d){
    return 0-0.5*ybuffer;
  }

  node.each(function(d){
    d.y = yscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cy",function(d){ return d.y })

  update_links()
}

var position_y_middle = function(){
  yscale = function(d){
    return height/2;
  }

  node.each(function(d){
    d.y = yscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cy",function(d){ return d.y })

  update_links()
}

var position_y_bottom = function(){
  yscale = function(d){
    return height+0.5*ybuffer;
  }

  node.each(function(d){
    d.y = yscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cy",function(d){ return d.y })

  update_links()
}


var position_x_left = function(){
  xscale = function(d){
    return 0-0.5*xbuffer;
  }

  node.each(function(d){
    d.x = xscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x })

  update_links()
}

var position_x_center = function(){
  xscale = function(d){
    return width/2;
  }

  node.each(function(d){
    d.x = xscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x })

  update_links()
}

var position_x_right = function(){
  xscale = function(d){
    return width+0.5*xbuffer;
  }

  node.each(function(d){
    d.x = xscale(d.id)
  })

  node.transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x })

  update_links()
}


