var force_directed = function(){
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
    svg.append("svg:defs").selectAll("marker")
        .data(["suit", "licensing", "resolved"])
      .enter().append("svg:marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    link = linkg.selectAll(".link")
        .data(graph.edges)
      .enter().append("svg:path")
        .classed("link",true)
        .style("stroke-width", function(d) { return Math.sqrt(d.weight); });
        // .attr("class", function(d) { return "link " + d.type; })
        // .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });


    node = nodeg.selectAll(".node")
        .data(graph.nodes)
      .enter().append("circle")
        .classed("node",true)
        .attr("r", function(d){ return d.degree; })
        // .attr("r",5)
        // .attr("r",function(d,i){return (i+1)*2})
        .attr("fill", function(d){ return color(d.modularity_class); })

    node.append("title")
      .text(function(d){ return d.label; })

    force.on("tick", function(){
      // link.attr("x1", function(d) { return d.source.x; })
      //   .attr("y1", function(d) { return d.source.y; })
      //   .attr("x2", function(d) { return d.target.x; })
      //   .attr("y2", function(d) { return d.target.y; });

    

      link.call(link_function)

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    })

    force.on("end",function(){
      mlgo_buttons.attr("disabled",null)
    })
}

var hide_links = function(){
  link.style("visibility","hidden")
}

var show_links = function(){
  link.style("visibility","visible")
}


var transition_x = function(){
  mlgo_buttons.attr("disabled","true")

  xscale = d3.scale.linear()
      .range([0,width])
      .domain([0,d3.max(graph.nodes.map(function(d){return d.betweenness_centrality; }))])
      .nice()


  node.transition().duration(transition_duration)
    .attr("cx",function(d){
      d.x = xscale(d.betweenness_centrality)
      return d.x
    })
    .each("end",function(){
      mlgo_buttons.attr("disabled",null)
    })

  update_links()
}


var transition_y = function(){
  mlgo_buttons.attr("disabled","true")
 
  yscale = d3.scale.linear()
      .range([height,0])
      .domain([0,d3.max(graph.nodes.map(function(d){return d.degree; }))])
      .nice()

  node.transition().duration(transition_duration)
    .attr("cy",function(d){
      d.y = yscale(d.degree)
      return d.y
    })
    .each("end",function(){
      mlgo_buttons.attr("disabled",null)
    })

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

var draw_y_axis = function(){
  var yaxis = d3.svg.axis()
    .scale(yscale)
    .orient("left")

  svg.append("g")
    .attr("class","y axis")
    .attr("transform","translate("+(xbuffer-20)+","+ybuffer+")")
    .call(yaxis)
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

  node.transition().duration(transition_duration)
    .attr("cy",function(d){
      d.y = yscale(d.modularity_class)
      return d.y
    })
    .each("end",function(){
      mlgo_buttons.attr("disabled",null)
    })

  update_links()
}

var scatter_on_x = function(){
  var substrates = substrate()

  substrates.forEach(function(category){
    category.xscale = d3.scale.ordinal()
      .domain(category.values.map(function(d){return d.id}))
      .rangePoints([0,width],1.0)
    category.values.forEach(function(d){
      d.x = category.xscale(d.id)
    })
  })

  node.transition().duration(transition_duration)
    .attr("cx",function(d){ return d.x })

  update_links()


}

var update_links = function(){
  // link.attr("x1", function(d) { return d.source.x; })
  //   .attr("y1", function(d) { return d.source.y; })
  //   .attr("x2", function(d) { return d.target.x; })
  //   .attr("y2", function(d) { return d.target.y; });

  link.transition().duration(transition_duration)
    .call(link_function)
}

var link_function = function(selection){
  var ry = 150
  var rx = 110

  // selection.attr("d", function(d) {
  //   var dx = d.target.x - d.source.x,
  //       dy = d.target.y - d.source.y,
  //       dr = 150;// /d.linknum;  //linknum is defined above
  //   return "M" + d.source.x + "," + d.source.y + "A" + rx + "," + ry + " 0 0,1 " + d.target.x + "," + d.target.y;
  // });

  var hscale = d3.scale.linear()
        .range([2,10])
        .domain([0,width])



  selection.attr("d", function(d) {
    var p = "M"+ d.source.x + "," + d.source.y


    //control point
    // var max_r = height / substrate().length / 2
    var max_r = 10
    
    var cx = (d.target.x + d.source.x)/2
    var cy = (d.target.y + d.source.y)/2
    // var dist = Math.sqrt((cx*cx)+(cy*cy))
    var dist = Math.abs(d.target.x-d.source.x)+Math.abs(d.target.y-d.source.y)
    // var h = max_r * (dist/width)
    var h = hscale(dist)
    var rise = Math.abs(d.target.y-d.source.y)
    var run = Math.abs(d.target.x-d.source.x)
    var dx, dy
    
    dx = (rise/(rise+run))*h
    dy = -(run/(rise+run))*h
    
    //Curve up or curve down
    var direction
    if(d.target.y==d.source.y){
      direction = (d.target.x<d.source.y)?1:-1;
    }else{
      direction = (d.target.y<d.source.y)?1:-1;
    }

    dy = dy*direction

    var cx_prime = cx + (dx*h)
    var cy_prime = cy + (dy*h)
    
    p += "Q"+cx_prime+","+cy_prime+" "
    p += d.target.x+","+d.target.y


    return p
  });
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