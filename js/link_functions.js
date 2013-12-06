

var hscale = d3.scale.linear()
  .range([3,12])
  .domain([0,width])

var curved_edges = function(selection){
  selection.attr("d", function(d) {
    var p = "M"+ d.startx() + "," + d.starty()

    //control point
    var max_r = 10
    
    var cx = (d.endx() + d.startx())/2
    var cy = (d.endy() + d.starty())/2
    var dist = Math.abs(d.endx()-d.startx())+Math.abs(d.endy()-d.starty())
    var h = hscale(dist)
    var rise = Math.abs(d.endy()-d.starty())
    var run = Math.abs(d.endx()-d.startx())
    var dx, dy
    
    dx = (rise/(rise+run))*h
    dy = -(run/(rise+run))*h
    
    //Curve up or curve down
    var direction
    direction = (d.target.id<d.source.id)?1:-1;

    dy = dy*direction

    var cx_prime = cx + (dx*h)
    var cy_prime = cy + (dy*h)
    
    p += "Q"+cx_prime+","+cy_prime+" "
    p += d.endx()+","+d.endy()


    return p
  });
}

var circle_edges = function(selection){
  selection.attr("d",function(d){
    var p = "M"+(d.endx()-link_r)+","+d.starty()+" "
        p+= "A"+link_r+","+link_r+" " //radii
        p+= "0 " //rotation
        p+= "1,1 " //flags
        p+= (d.endx()+link_r)+","+d.starty()+" "
        p+= "A"+link_r+","+link_r+" " //radii
        p+= "0 " //rotation
        p+= "0,1 " //flags
        p+= (d.endx()-link_r)+","+d.starty()
        return p
  });
}

var straight_edges = function(selection){
  selection.attr("d", function(d) {
    var p = "M"+ d.startx() + "," + d.starty()

    //control point
    var cx = (d.endx() + d.startx())/2
    var cy = (d.endy() + d.starty())/2
    
    p += "Q"+cx+","+cy+" "
    p += d.endx()+","+d.endy()


    return p
  });
}

var line_to_circle = function(selection){
  modes.edges = "circle"
  selection
    .transition().duration(transition_duration/2).ease("cubic-in")
      .attr("d",function(d){
        var p = "M"+ d.endx() + "," + d.starty()
            p += "Q"+d.endx()+","+d.starty()+" "
            p += d.endx()+","+d.starty()
          return p
      })
    .transition().delay(transition_duration/2+1).duration(0)
      .attr("d",function(d){
          var p = "M"+d.endx()+","+d.starty()+" "
              p+= "A"+0+","+0+" " //radii
              p+= "0 " //rotation
              p+= "1,1 " //flags
              p+= d.endx()+","+d.starty()+" "
              p+= "A"+0+","+0+" " //radii
              p+= "0 " //rotation
              p+= "0,1 " //flags
              p+= d.endx()+","+d.starty()+" "
            return p
        })
        .style("fill","#999")
    .transition().delay(transition_duration+3).duration(transition_duration/2).ease("cubic-out")
      .call(circle_edges)
}


var circle_to_curved = function(selection){
  modes.edges = "curved"
  selection.transition().duration(transition_duration/2)
    .attr("d",function(d){
      var p = "M"+d.endx()+","+d.starty()+" "
          p+= "A"+0+","+0+" " //radii
          p+= "0 " //rotation
          p+= "1,1 " //flags
          p+= d.endx()+","+d.starty()+" "
          p+= "A"+0+","+0+" " //radii
          p+= "0 " //rotation
          p+= "0,1 " //flags
          p+= d.endx()+","+d.starty()+" "
        return p
    })
    .transition().delay(transition_duration/2+1).duration(0)
      .attr("d",function(d){
        var p = "M"+ d.endx() + "," + d.starty()
            p += "Q"+d.endx()+","+d.starty()+" "
            p += d.endx()+","+d.starty()
          return p
      })
      .style("fill",null)
    .transition().delay(transition_duration+3).duration(transition_duration/2)
      .call(curved_edges)
}

var circle_to_straight = function(selection){
  modes.edges = "straight"
  selection.transition().duration(transition_duration/2)
    .attr("d",function(d){
      var p = "M"+d.endx()+","+d.starty()+" "
          p+= "A"+0+","+0+" " //radii
          p+= "0 " //rotation
          p+= "1,1 " //flags
          p+= d.endx()+","+d.starty()+" "
          p+= "A"+0+","+0+" " //radii
          p+= "0 " //rotation
          p+= "0,1 " //flags
          p+= d.endx()+","+d.starty()+" "
        return p
    })
    .transition().delay(transition_duration/2+1).duration(0)
      .attr("d",function(d){
        var p = "M"+ d.endx() + "," + d.starty()
            p += "Q"+d.endx()+","+d.starty()+" "
            p += d.endx()+","+d.starty()
          return p
      })
      .style("fill",null)
    .transition().delay(transition_duration+3).duration(transition_duration/2)
      .call(straight_edges)
}

var curved_to_straight = function(selection){
  modes.edges = "straight"
  selection.transition().duration(transition_duration)
    .call(straight_edges)
}

var straight_to_curved = function(selection){
  modes.edges = "curved"
  selection.transition().duration(transition_duration)
    .call(curved_edges)
}




var transition_links_to_curved = function(){
  if(modes.edges=="curved"){
    //Pass
  }else if (modes.edges=="straight"){
    link.call(straight_to_curved)
  }else if (modes.edges=="circle"){
    link.call(circle_to_curved)
  }

}

var transition_links_to_circle = function(){
  if(modes.edges=="curved"){
    link.call(line_to_circle)
  }else if (modes.edges=="straight"){
    link.call(line_to_circle)
  }else if (modes.edges=="circle"){
    //Pass
  }
}

var transition_links_to_straight = function(){
  if(modes.edges=="curved"){
    link.call(curved_to_straight)
  }else if (modes.edges=="straight"){
    //Pass
  }else if (modes.edges=="circle"){
    link.call(circle_to_straight)
  }
}



var update_links = function(){
  link.transition().duration(transition_duration)
    .call(link_function)
    .style("visibility",function(d){
      return d.visibility?"visible":"hidden"
    })
}

var link_function = function(selection){
  if(modes.edges=="curved"){
    selection.call(curved_edges)
  }else if (modes.edges=="straight"){
    selection.call(straight_edges)
  }else if (modes.edges=="circle"){
    selection.call(circle_edges)
  }
}






