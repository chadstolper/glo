

var distribute_on_x_by_property = function(prop){
  node_data().sort(function(a,b){
    var val = a[prop]-b[prop]
    if (val==0){
      return a.id-b.id
    }
    return val
  }).forEach(function(d,i){
    d.x_i = i
  })


  xscale = d3.scale.ordinal()
    .domain(node_data().map(function(d,i){return i;}))
    .rangePoints([0,width])

  node_generations[modes.active_generation].each(function(d){
    d.x_list[modes.active_generation] = xscale(d.x_i)
  })

  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x_list[modes.active_generation] })

  update_axes()
  update_rolled_up()
  update_links()
}

var distribute_on_x_by_modularity_class = function(){
  distribute_on_x_by_property("modularity_class")
}



var distribute_on_y_by_property = function(prop){
  node_data().sort(function(a,b){
    var val = a[prop]-b[prop]
    if (val==0){
      return a.id-b.id
    }
    return val
  }).forEach(function(d,i){
    d.y_i = i
  })


  yscale = d3.scale.ordinal()
    .domain(node_data().map(function(d,i){return i;}))
    .rangePoints([0,height])

  node_generations[modes.active_generation].each(function(d){
    d.y_list[modes.active_generation] = yscale(d.y_i)
  })

  node_generations[modes.active_generation].transition().duration(transition_duration)
    .attr("cy",function(d){ return d.y_list[modes.active_generation] })

  update_axes()
  update_rolled_up()
  update_links()
}

var distribute_on_y_by_modularity_class = function(){
  distribute_on_y_by_property("modularity_class")
}