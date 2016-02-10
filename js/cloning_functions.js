var clone_generation = function (gen) {
    //Clones generation gen.
    //Returns the generation# of the created clones
    modes.generation += 1;
    var newgen = modes.generation;

    node_generations[newgen] = nodeclone = nodeg.selectAll(".node.gen-" + newgen + "")
        .data(node_generations[gen].data(), function (d) {
            return d.id
        })
        .enter().append("circle")
        .classed("node", true)
        .classed("gen-" + newgen, true)
        .attr("nodeid", function (d) {
            return d.id
        })
        .attr("r", function (d) {
            d.r_list[newgen] = d.r_list[gen];
            return d.r_list[newgen]
        })
        .attr("fill", function (d) {
            return d3.rgb(color(d.modularity_class)).darker();
        })
        .on("mouseover", function (d) {
            d3.select(this).attr("fill", function (d) {
                return color(d.modularity_class);
            })
        })
        .on("mouseout", function (d) {
            d3.select(this).attr("fill", function (d) {
                return d3.rgb(color(d.modularity_class)).darker();
            })
        });

    nodeclone.append("title")
        .text(function (d) {
            return d.label;
        });

    nodeclone
        .each(function (d) {
            d.x_list[newgen] = d.x_list[gen];
            d.y_list[newgen] = d.y_list[gen];
            d.radius_list[newgen] = d.radius_list[gen];
            d.theta_list[newgen] = d.theta_list[gen];
            if (agg_generations[gen]) {
                d.nodes.forEach(function (k) {
                    k.x_list[newgen] = d.x_list[gen];
                    k.y_list[newgen] = d.y_list[gen];
                    k.radius_list[newgen] = d.radius_list[gen];
                    k.theta_list[newgen] = d.theta_list[gen]
                })
            }
        });


    if (agg_generations[gen]) {
        var new_source_gen = clone_generation(agg_generations[gen].source_gen);
        agg_generations[newgen] = {};
        agg_generations[newgen].source_gen = new_source_gen;
        agg_generations[newgen].source_link_gen = agg_generations[gen].source_link_gen;
        agg_generations[newgen].link_gen = agg_generations[gen].link_gen;

        node_generations[new_source_gen]
            .attr("r", 0)
    }

    return newgen
};


var clone_active_set = function () {

    var newgen = clone_generation(modes.active_generation);

    select_generation(newgen);

    node_generations[modes.active_generation]
        .attr("cx", function (d) {
            return d.x_list[modes.active_generation];
        })
        .attr("cy", function (d) {
            return d.y_list[modes.active_generation];
        })


};