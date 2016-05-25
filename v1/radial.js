

var evenly_position_nodes_radially_by_property = function (prop) {
  node_data().sort(function(a,b){
    var val = a[prop]-b[prop]
    if (val==0){
      return a.id-b.id
    }
    return val
  }).forEach(function(d,i){
    d.theta_i = i
  })

  theta_scale = d3.scale.ordinal()
    .domain(node_data().map(function(d,i){return i;}))
    .rangeBands([3*Math.PI/2,7*Math.PI/2])

  node_generations[modes.active_generation]
    .each(function(d,i){
      d.theta_list[modes.active_generation] = theta_scale(d.theta_i)
    })
    .transition().duration(transition_duration)
      .attr("cx",function(d,i){
        d.x_list[modes.active_generation] = d.radius_list[modes.active_generation]*Math.cos(d.theta_list[modes.active_generation])+width/2
        return d.x_list[modes.active_generation]
      })
      .attr("cy",function(d,i){
        d.y_list[modes.active_generation] = d.radius_list[modes.active_generation]*Math.sin(d.theta_list[modes.active_generation])+height/2
        return d.y_list[modes.active_generation]
      })

  update_axes()
  update_rolled_up()
  update_links()
}

var evenly_position_nodes_radially = function () {
    evenly_position_nodes_radially_by_property('id')
}





var position_radius_by_constant = function(){
  node_generations[modes.active_generation]
    .each(function(d,i){
      d.radius_list[modes.active_generation] = Math.min(width,height)*.45
    })
    .transition().duration(transition_duration)
      .attr("cx",function(d,i){
        d.x_list[modes.active_generation] = d.radius_list[modes.active_generation]*Math.cos(d.theta_list[modes.active_generation])+width/2
        return d.x_list[modes.active_generation]
      })
      .attr("cy",function(d,i){
        d.y_list[modes.active_generation] = d.radius_list[modes.active_generation]*Math.sin(d.theta_list[modes.active_generation])+height/2
        return d.y_list[modes.active_generation]
      })

  update_axes()
  update_rolled_up()
  update_links()
}




var position_radius_by_property = function(prop) {
  if(prop=="modularity_class" || prop=="generation"){
    set_radius_scale_by_nominal_property(prop)
  }else if(is_number(node_data()[0][prop])){
    set_radius_scale_by_quantitative_property(prop)
  }else{
    set_radius_scale_by_nominal_property(prop)
  }


  node_generations[modes.active_generation]
    .each(function(d,i){
      d.radius_list[modes.active_generation] = radius_scale(d[prop])
    })
    .transition().duration(transition_duration)
      .attr("cx",function(d,i){
        d.x_list[modes.active_generation] = d.radius_list[modes.active_generation]*Math.cos(d.theta_list[modes.active_generation])+width/2
        return d.x_list[modes.active_generation]
      })
      .attr("cy",function(d,i){
        d.y_list[modes.active_generation] = d.radius_list[modes.active_generation]*Math.sin(d.theta_list[modes.active_generation])+height/2
        return d.y_list[modes.active_generation]
      })

  update_axes()
  update_rolled_up()
  update_links()
}

var set_radius_scale_by_quantitative_property = function(prop){
  radius_scale = d3.scale.linear()
      .range([20,.6*Math.min(width,height)])
      .domain([0,d3.max(node_data().map(function(d){return d[prop]; }))])
      .nice()
}

var set_radius_scale_by_nominal_property = function(prop){
  if(prop=="generation"){
    radius_scale = d3.scale.linear()
      .domain([0,1])
      .range([20,.6*Math.min(width,height)])
  }else{
    substrate_on_radius(prop)
  }
}

var radius_substrate = function(prop){
  radius_substrates = d3.nest()
      .key(function(d){return d[prop]})
      .entries(node_data())
  return radius_substrates
}

var substrate_on_radius = function(prop){
  radius_substrate(prop)

  radius_scale = d3.scale.ordinal()
    .domain(radius_substrates.map(function(d){return d.key; }))
    .rangeBands([20,.6*Math.min(width,height)])
}












var position_theta_by_constant = function(){
  node_generations[modes.active_generation]
    .each(function(d,i){
      d.theta_list[modes.active_generation] = Math.PI/2
    })
    .transition().duration(transition_duration)
      .attr("cx",function(d,i){
        d.x_list[modes.active_generation] = d.radius_list[modes.active_generation]*Math.cos(d.theta_list[modes.active_generation])+width/2
        return d.x_list[modes.active_generation]
      })
      .attr("cy",function(d,i){
        d.y_list[modes.active_generation] = d.radius_list[modes.active_generation]*Math.sin(d.theta_list[modes.active_generation])+height/2
        return d.y_list[modes.active_generation]
      })

  update_axes()
  update_rolled_up()
  update_links()
}




var position_theta_by_property = function(prop) {
  if(prop=="modularity_class" || prop=="generation"){
    set_theta_scale_by_nominal_property(prop)
  }else if(is_number(node_data()[0][prop])){
    set_theta_scale_by_quantitative_property(prop)
  }else{
    set_theta_scale_by_nominal_property(prop)
  }


  node_generations[modes.active_generation]
    .each(function(d,i){
      d.theta_list[modes.active_generation] = theta_scale(d[prop])
    })
    .transition().duration(transition_duration)
      .attr("cx",function(d,i){
        d.x_list[modes.active_generation] = d.radius_list[modes.active_generation]*Math.cos(d.theta_list[modes.active_generation])+width/2
        return d.x_list[modes.active_generation]
      })
      .attr("cy",function(d,i){
        d.y_list[modes.active_generation] = d.radius_list[modes.active_generation]*Math.sin(d.theta_list[modes.active_generation])+height/2
        return d.y_list[modes.active_generation]
      })

  update_axes()
  update_rolled_up()
  update_links()
}

var set_theta_scale_by_quantitative_property = function(prop){
  theta_scale_temp = d3.scale.ordinal()
    .domain(node_data().map(function(d,i){return i;}))
    .rangeBands([3*Math.PI/2,7*Math.PI/2])

  theta_scale = d3.scale.linear()
      .range([theta_scale_temp(theta_scale_temp.domain()[0]),theta_scale_temp(theta_scale_temp.domain()[node_data().length-1])])
      .domain([0,d3.max(node_data().map(function(d){return d[prop]; }))])
      // .nice()

  console.log(theta_scale.range())
}

var set_theta_scale_by_nominal_property = function(prop){
  if(prop=="generation"){
    theta_scale = d3.scale.linear()
      .domain([0,1])
      .range([3*Math.PI/2,7*Math.PI/2])
  }else{
    substrate_on_theta(prop)
  }
}

var theta_substrate = function(prop){
  theta_substrates = d3.nest()
      .key(function(d){return d[prop]})
      .entries(node_data())
  return theta_substrates
}

var substrate_on_theta = function(prop){
  theta_substrate(prop)

  theta_scale = d3.scale.ordinal()
    .domain(theta_substrates.map(function(d){return d.key; }))
    .rangeBands([3*Math.PI/2,7*Math.PI/2])
}









//Button
var circle_by_class = function(){
  evenly_position_nodes_radially_by_property('modularity_class')
}