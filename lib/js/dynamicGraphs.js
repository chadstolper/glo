var dynamicGraphs = dynamicGraphs || {};
dynamicGraphs.DynamicGraph = function(){

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

        var linksAppear = function(linksToAdd, links, nodes) {
            linksToAdd.forEach(function(link){
                if(findLink(link, links) == -1                      // Link is not there
                    && findNode(link["source"], nodes) != -1       // Source node is there
                    && findNode(link["target"], nodes) != -1){     // Target node is there
                    links.push(link)
                }
            })
        };

        var linksDisappear = function(linksToRemove, links) {
            linksToRemove.forEach(function(link){
                removeLink(link, links)
            })
        };

        var nodesChangeColors = function(nodesToChange, nodes){
            nodesToChange.forEach(function(nodeToChange) {
                nodes.forEach(function(node) {
                    if(nodeToChange["node"] == node["id"]) node["color"] = nodeToChange["color"]
                })
            })
        };

        var linksChangeValues = function(linksToChange, links){
            linksToChange.forEach(function(linkToChange){
                links.forEach(function(link){
                    var source = linkToChange["link"]["source"];
                    var target = linkToChange["link"]["target"];
                    var value = linkToChange["value"];
                    if( source == link["source"] && target == link["target"]) link["value"] = value
                })
            })
        };

        var applyEvents = function(state, index){

            // Retrieve old graph
            var graphAtIndex = graphs[index];

            //This make deep copies of the old arrays of nodes and links
            var newNodes = $.extend(true, [], graphAtIndex["nodes"]);
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
                        linksAppear(event["links"], newLinks, newNodes);
                        break;
                    case "ed":
                        linksDisappear(event["links"], newLinks);
                        break;
                    case "nca":
                        nodesChangeColors(event["nodes"], newNodes);
                        break;
                    case "eca":
                        linksChangeValues(event["links"], newLinks);
                        break;
                }
            });

            graphs.push({"nodes": newNodes, "links": newLinks});
        };

        newStates.forEach(function(state, index) {
            applyEvents(state, index)
        })
    }
};