var hscale = d3.scale.linear()
        .range([3,12])
        .domain([0,width])

var curved_edges = function(selection){
  selection.attr("d", function(d) {
    var p = "M"+ d.source.x + "," + d.source.y


    //control point
    var max_r = 10
    
    var cx = (d.target.x + d.source.x)/2
    var cy = (d.target.y + d.source.y)/2
    var dist = Math.abs(d.target.x-d.source.x)+Math.abs(d.target.y-d.source.y)
    var h = hscale(dist)
    var rise = Math.abs(d.target.y-d.source.y)
    var run = Math.abs(d.target.x-d.source.x)
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
    p += d.target.x+","+d.target.y


    return p
  });
}

var circle_edges = function(selection){
  selection.attr("d",function(d){
    var p = "M"+(d.target.x-r)+","+d.source.y+" "
        p+= "A"+r+","+r+" " //radii
        p+= "0 " //rotation
        p+= "1,1 " //flags
        p+= (d.target.x+r)+","+d.source.y+" "
        p+= "A"+r+","+r+" " //radii
        p+= "0 " //rotation
        p+= "0,1 " //flags
        p+= (d.target.x-r)+","+d.source.y
        return p
  });
}

var straight_edges = function(selection){
  selection.attr("d", function(d) {
    var p = "M"+ d.source.x + "," + d.source.y

    //control point
    var cx = (d.target.x + d.source.x)/2
    var cy = (d.target.y + d.source.y)/2
    
    p += "Q"+cx+","+cy+" "
    p += d.target.x+","+d.target.y


    return p
  });
}

var curved_to_circle = function(selection){
  selection.transition().duration(transition_duration/2)
    .attr("d",function(){
      var p = "M"+ d.target.x + "," + d.source.y
          p += "Q"+d.target.x+","+d.source.y+" "
          p += d.target.x+","+d.source.y
          return p
    })
    .transition().duration(transition_duration/2)
      .attr("d",function(){
        var p = "M"+d.target.x+","+d.source.y+" "
            p+= "A"+0+","+0+" " //radii
            p+= "0 " //rotation
            p+= "1,1 " //flags
            p+= d.target.x+","+d.source.y+" "
            p+= "A"+0+","+0+" " //radii
            p+= "0 " //rotation
            p+= "0,1 " //flags
            p+= d.target.x+","+d.source.y+" "
            return p
      })
}