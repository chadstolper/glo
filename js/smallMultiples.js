var dynamicGraphs = dynamicGraphs || {};

dynamicGraphs.MAX_NUMBER_OF_DRAWINGS_PER_ROW = 3;
dynamicGraphs.PAUSE = 5000;


/**
 * This function creates the svg groups needed to accomodate all the timesteps, and then it positions them correctly
 * @param {Object} data: The input dynamic graph
 * @param {Number} max_number_of_drawings_per_row: Specifies the maximum number of drawings admitted in every row
 * @returns {Number} groupWidth: The length of the side of a box
 */
function splitScreen(data, max_number_of_drawings_per_row) {


    var svg = d3.select("svg"),
        width = svg.attr("width"),
        height = svg.attr("height");

    var groupWidth = width / max_number_of_drawings_per_row,
        numberOfBoxes = 1 + data["newStates"].length;

    var numberOfRows = Math.floor(numberOfBoxes / max_number_of_drawings_per_row);
    var reminder = numberOfBoxes % max_number_of_drawings_per_row;
    numberOfRows = reminder != 0 ? numberOfRows + 1: numberOfRows;

    var groupIDs = 0;
    for (var i = 0; i < numberOfRows; i ++) {
        for (var j = 0; j < max_number_of_drawings_per_row; j++){
            svg.append("svg:g")
                .attr("id", "step-" + groupIDs++ )
                .attr("transform", "translate(" + j * groupWidth + "," + i * groupWidth + ")")
        }
    }

    // Fixes needed to enable vertical scrolling
    d3.select("#canvas").style("overflow", "scroll");
    d3.select("svg").style("height", "unset");
    d3.select("svg").attr("height", groupWidth * numberOfRows);

    return groupWidth;
}

/**
 * This function simply converts the graphs to a d3-friendly format
 * @param graphs: input
 * @returns {Array}: output
 */
function convertGraphsToD3Format(graphs){
    var result = [];

    function findNodeIndex(nodeToFind, nodes){
        for(var i = 0; i < nodes.length; i++){
            if (nodeToFind == nodes[i]["id"]){
                return i
            }
        }
    }

    graphs.forEach(function(graph){

        var d3Graph = {};
        d3Graph["nodes"] = [];
        d3Graph["links"] = [];

        graph["nodes"].forEach(function(node){ d3Graph["nodes"].push(node) });
        graph["links"].forEach(function(link){
            d3Graph["links"].push(
                {
                    "source": findNodeIndex(link["source"], d3Graph["nodes"]),
                    "target": findNodeIndex(link["target"], d3Graph["nodes"]),
                    "value": link["value"]
                }
            )
        });

        result.push(d3Graph);
    });
    return result;
}


/**
 * This function finds the coordinate of a node looking in the drawing stored in g.step-i
 * @param nodes: The node to find the coordinates for
 * @param i: index of the step in which the algorithm will look for nodes
 */
function fixNodes(nodes, i){

    for (var j = 0; j < nodes.length; j++){
        var $node = d3.select("#step-" + i).select("circle[id='" +  nodes[j]["id"] + "']");
        if ($node.node() != null) {
            var x = $node.attr("cx");
            var y = $node.attr("cy");
            nodes[j].fixed = true;
            nodes[j].x = x;
            nodes[j].y = y;
        }
    }
}

/**
 * This function draws the input graph in the svg group "step-i"
 * @param graph: The input svg graph
 * @param i: The index of the box in which the graph will be drawn
 * @param boxWidth: The width of the box in which the graph will be drawn
 */
function drawGraph(graph, i, boxWidth){

    var firstGraph = (i == 0);
    if(!firstGraph) fixNodes(graph["nodes"], i-1);

    var svgGroup = d3.select("#step-" + i);
    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(30)
        .size([boxWidth, boxWidth]);

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();

    var link = svgGroup.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = svgGroup.selectAll(".node")
        .data(graph.nodes, function(node){ return node["id"]})
        .enter().append("circle")
        .attr("id", function(node){ return node["id"]})
        .attr("class", "node")
        .attr("r", 5)
        .style("fill", function(d) { return d.color })
        .call(force.drag);

    node.append("title")
        .text(function(d) { return d["id"]; });

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });
}


// Main
d3.json("data/DynamicGraphs/toy.json", function(error, data){

    if (error) throw error;

    // Split screen and get the width of each box
    var boxWidth = splitScreen(data, dynamicGraphs.MAX_NUMBER_OF_DRAWINGS_PER_ROW);

    var dynamicGraph = new dynamicGraphs.DynamicGraph();
    dynamicGraph.addInitialState(data["initialState"]);
    dynamicGraph.addNewStates(data["newStates"]);

    var d3Graph = convertGraphsToD3Format(dynamicGraph.getGraphs());

    // Draw the first graph
    drawGraph(d3Graph[0], 0, boxWidth);


    // Based on: http://stackoverflow.com/questions/3583724/how-do-i-add-a-delay-in-a-javascript-loop
    var i = 1;
    function drawAll () {
        setTimeout(
            function(){
                drawGraph(d3Graph[i], i, boxWidth);
                i++;
                if (i < d3Graph.length) drawAll();
            }, dynamicGraphs.PAUSE
        )
    }
    drawAll();


});
