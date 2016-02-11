var dynamicGraphs = dynamicGraphs || {};
var dg = dynamicGraphs;

/**
 * This function creates the svg groups needed to accomodate all the timesteps, and then it positions them correctly
 * @param {Object} data: The input dynamic graph
 * @returns {Number} groupWidth: The length of the side of a box
 */
function splitScreen(data) {

    var MAX_NUMBER_OF_DRAWINGS_PER_ROW = 3;

    var svg = d3.select("svg"),
        width = svg.attr("width"),
        height = svg.attr("height");

    var groupWidth = width / MAX_NUMBER_OF_DRAWINGS_PER_ROW,
        numberOfBoxes = 1 + data["newStates"].length;

    var numberOfRows = Math.floor(numberOfBoxes / MAX_NUMBER_OF_DRAWINGS_PER_ROW);
    var reminder = numberOfBoxes % MAX_NUMBER_OF_DRAWINGS_PER_ROW;
    numberOfRows = reminder != 0 ? numberOfRows + 1: numberOfRows;

    var groupIDs = 0;
    for (var i = 0; i < numberOfRows; i ++) {
        for (var j = 0; j < MAX_NUMBER_OF_DRAWINGS_PER_ROW; j++){
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

//TODO: It might be wise to make a library out of this data structure
function DynamicGraph() {

    var graphs = [];

    this.getGraphs = function(){
        return graphs;
    };

    this.addInitialState = function(initialState) {

        var initialGraph = {};
        initialGraph.nodes = [];
        initialGraph.links = [];

        initialState["nodes"].forEach(function(node) {initialGraph.nodes.push(node)});
        initialState["links"].forEach(function(link) {initialGraph.links.push(link)});

        graphs.push(initialGraph);
    };

    var findNode = function (id, nodes) {
        for (var i = 0; i < nodes.length; i++){
            if (nodes[i]["id"] == id) return nodes[i]
        }
        return -1
    };

    var findLink = function(linkToFind, links) {
        links.forEach(function(link) {
            if(link["source"] == linkToFind["source"] && link["target"] == linkToFind["target"]) return link;
        });
        return -1;
    };

    var removeNode = function (id, nodes, links) {
        // Node
        for (var i = 0; i < nodes.length; i++) {
            if(nodes[i]["id"] == id) nodes.splice(i, 1)
        }
        // Incident links
        for (var j = 0; j < links.length; j++){
            if(links[j]["source"] == id || links[j]["target"] == id) {
                links.splice(j, 1);
                j--; // This is necessary because splice shortens the array over which I'm looping
            }
        }
    };

    var removeLink = function(linkToRemove, links) {
        for (var i = 0; i < links.length; i++) {
            if(links[i]["source"] == linkToRemove["source"] && links[i]["target"] == linkToRemove["target"]){
                links.splice(i, 1);
          }
      }
    };

    this.addNewStates = function(newStates) {

        var nodesAppear = function(nodesToAdd, nodes) {
            nodesToAdd.forEach(function(node) {
                if(findNode(node["id"], nodes) == -1) nodes.push(node)
            });
        };

        var nodesDisappear = function(nodesToRemove, nodes, links) {
            nodesToRemove.forEach(function(node) {
                removeNode(node, nodes, links)
            })
        };

        var edgesAppear = function(linksToAdd, links, nodes) {
            linksToAdd.forEach(function(link){
                if(findLink(link, links) == -1              // Link is not there
                    && findNode(link["source"], nodes) != -1       // Source node is there
                    && findNode(link["target"], nodes) != -1){     // Target node is there
                    links.push(link)
                }
            })
        };

        var edgesDisappear = function(linksToRemove, links) {
            linksToRemove.forEach(function(link){
                removeLink(link, links)
            })
        };

        var nodesChangeAttribute = function(event, nodes){
            //TODO
        };

        var edgesChangeAttribute = function(event, edges){
            //TODO
        };

        var applyEvents = function(state, index){

            // Retrieve old graph
            var graphAtIndex = graphs[index];
            var newNodes = $.extend(true, [], graphAtIndex["nodes"]); //This makes deep copy of the old array of nodes
            var newLinks = $.extend(true, [], graphAtIndex["links"]);

            state["events"].forEach(function(event) {

                switch (event["type"]) {
                    case "na":
                        nodesAppear(event["nodes"], newNodes);
                        break;
                    case "nd":
                        nodesDisappear(event["nodes"], newNodes, newLinks);
                        break;
                    case "ea":
                        edgesAppear(event["links"], newLinks, newNodes);
                        break;
                    case "ed":
                        edgesDisappear(event["links"], newLinks);
                        break;
                    case "nca":
                        nodesChangeAttribute(event["nodes"], newNodes);
                        break;
                    case "eca":
                        edgesChangeAttribute(event["links"], newLinks);
                        break;
                }
            });

            graphs.push({"nodes": newNodes, "links": newLinks});
        };

        newStates.forEach(function(state, index) {
            applyEvents(state, index)
        })
    }
}


// Main
d3.json("data/DynamicGraphs/toy.json", function(error, data){

    if (error) throw error;

    // Split screen and get the width of each box
    var boxWidth = splitScreen(data);
    var dynamicGraph = new DynamicGraph();
    dynamicGraph.addInitialState(data["initialState"]);
    dynamicGraph.addNewStates(data["newStates"]);
    console.log(dynamicGraph.getGraphs())
});
