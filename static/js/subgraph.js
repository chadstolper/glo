var select_subgraph = function(id_gen_pairs){
  //[(id,gen),(id,gen)]
  modes.generation+=1
  var newgen = modes.generation

  var data = []

  for(var pair in id_gen_pairs){
    pair = id_gen_pairs[pair]
    var elem = nodeg.select(".gen-"+pair.gen+"[nodeid='"+pair.id+"']")
    var node = elem.data()[0]
    data.push(node)
    elem.classed("gen-"+newgen,true)
  }

  console.log(data)

  node_generations[newgen] = nodeg.selectAll(".node.gen-"+newgen)
    .data(data,function(d){return d.id})

  select_generation(newgen)

  var sgen = subgraph_generations[newgen] = {}
  sgen[pairs] = id_gen_pairs
  

}


var select_subgraph_test = function(){
  var list = [
    {gen:0,id:11},
    {gen:0,id:23},
    {gen:0,id:0}
  ]
  select_subgraph(list)
}