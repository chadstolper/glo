//http://stackoverflow.com/questions/11368339/drawing-multiple-edges-between-two-nodes-with-d3
// Per-type markers, as they don't inherit styles.
var defs = d3.select("#defns")
    .attr("width", width + (2 * xbuffer))
    .attr("height", height + (2 * ybuffer))
    .append("svg:defs");

defs.append("svg:marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("opacity", 0.45)
    .append("svg:path")
    .attr("d", "M0,-1L4,0L0,1");

var grad = defs.append("svg:linearGradient")
    .attr("id", "nxny")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "100%");

grad.append("stop")
    .attr("offset", "0%")
    .style("stop-opacity", 0.0)
    .style("stop-color", "black");

grad.append("stop")
    .attr("offset", "100%")
    .style("stop-opacity", 1)
    .style("stop-color", "black");

grad = defs.append("svg:linearGradient")
    .attr("id", "nxpy")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "100%")
    .attr("y2", "0%");

grad.append("stop")
    .attr("offset", "0%")
    .style("stop-opacity", 0.0)
    .style("stop-color", "black");

grad.append("stop")
    .attr("offset", "100%")
    .style("stop-opacity", 1)
    .style("stop-color", "black");

grad = defs.append("svg:linearGradient")
    .attr("id", "pxny")
    .attr("x1", "100%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%");

grad.append("stop")
    .attr("offset", "0%")
    .style("stop-opacity", 0.0)
    .style("stop-color", "black");

grad.append("stop")
    .attr("offset", "100%")
    .style("stop-opacity", 1)
    .style("stop-color", "black");

grad = defs.append("svg:linearGradient")
    .attr("id", "pxpy")
    .attr("x1", "100%")
    .attr("x2", "0%")
    .attr("y1", "100%")
    .attr("y2", "0%");

grad.append("stop")
    .attr("offset", "0%")
    .style("stop-opacity", 0.0)
    .style("stop-color", "black");

grad.append("stop")
    .attr("offset", "100%")
    .style("stop-opacity", 1)
    .style("stop-color", "black");

grad = defs.append("svg:linearGradient")
    .attr("id", "down")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "100%")
    .attr("y2", "0%");

grad.append("stop")
    .attr("offset", "0%")
    .style("stop-opacity", 0.0)
    .style("stop-color", "black");

grad.append("stop")
    .attr("offset", "100%")
    .style("stop-opacity", 1)
    .style("stop-color", "black");

grad = defs.append("svg:linearGradient")
    .attr("id", "up")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%");

grad.append("stop")
    .attr("offset", "0%")
    .style("stop-opacity", 0.0)
    .style("stop-color", "black");

grad.append("stop")
    .attr("offset", "100%")
    .style("stop-opacity", 1)
    .style("stop-color", "black");

grad = defs.append("svg:linearGradient")
    .attr("id", "right")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");

grad.append("stop")
    .attr("offset", "0%")
    .style("stop-opacity", 0.0)
    .style("stop-color", "black");

grad.append("stop")
    .attr("offset", "100%")
    .style("stop-opacity", 1)
    .style("stop-color", "black");

grad = defs.append("svg:linearGradient")
    .attr("id", "left")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", "100%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "0%");

grad.append("stop")
    .attr("offset", "0%")
    .style("stop-opacity", 0.0)
    .style("stop-color", "black");

grad.append("stop")
    .attr("offset", "100%")
    .style("stop-opacity", 1)
    .style("stop-color", "black");