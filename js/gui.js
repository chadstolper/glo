/* known problem:
@when reapply history, functions are not executed in sequence.
    -tried JQuery deferred, not working perfectly, need to research more.

*/
//----------define history behavior--------------
var history = [];
var snapshotHistory = [];
var snapshotCounter = 0;

var reapplyHistory = function(){
    // //reapply new history
    // var chain = function(){
    //     var d = $.Deferred();
    //     force_directed_stop_immediately();
    //     d.resolve();
    //     return d.promise();
    // };

    // chain = chain();
    
    // for (i = 0; i < history.length; i++) {
    //     setTimeout(function(){
    //         chain = chain.pipe(history[i].func);
    //     },100);
    // }
//-------------above used JQuery Defer
    console.log(history);
    //clean disable and then reapply
    d3.selectAll(".disabled")
        .classed("disabled",false);

    var histKeeper = history;
    history = [];
    var workerWrapper = function(i){
        setTimeout(function(){
            // console.log(i);
            histKeeper[i].func();
            history.push(histKeeper[i]);
        },1000*i);
    };


    //remove all cloned and aggregate nodes
    deaggregate_3();
    deaggregate_2();
    deaggregate_1();
    remove_generation_3();
    remove_generation_2();
    remove_generation_1();
    force_directed_stop_immediately();
    for (var i = 0; i < histKeeper.length; i++) {
        workerWrapper(i);
    }
}

//-------------UI stuff-------------------
$("#buttons").accordion({heightStyle: "content"});
$(".button-group > .btn").draggable({helper: "clone" });
$(".ui-accordion-content").css("padding","2px"); 



$("#history-panel").droppable({
    drop: function (event, ui) {
    	var newListedHistItem = $("<div></div>")
            .addClass("history-item")
            .attr("active-gen",modes.active_generation);
        newListedHistItem.append("<div class=\"delete-x glyphicon glyphicon-remove\"></div>")
            .click(function(){
                $(this).toggleClass("selected");
            })
            .appendTo("#history");
        newListedHistItem.append("<div>"+ui.draggable.text()+"</div>");

        $(newListedHistItem).children(".delete-x")
            .click(function(){
                var selectedItem = $(this.parentNode);
                $.each(history,function(index,value){
                    //console.log(selectedItem.text()+" "+history[index].name);
                    if (selectedItem.text()==history[index].name){
                        history.splice(index,1);
                        //console.log(index);
                        return false;
                    }
                });
                $(this.parentNode).hide('slow', function(){ this.remove(); });
                
                reapplyHistory();
            });


    	var histItem = {};
        histItem.name = ui.draggable.text();
        //use jquery deferred to make sure functions are executed in sequence
        histItem.func = function(){
            // var d = $.Deferred();
            ui.draggable.click();
            // d.resolve();
            // return d.promise();
        };
        histItem.func();
    	history.push(histItem);

    }
});

//----------control button-----------
$("#delete-btn").click(function(){
	console.log("clicked del");

    var newHistory = [];
    $(".history-item").each(function(index,value){
        var selectedItem = $(this);
        if (!selectedItem.hasClass("selected")){
            newHistory.push(history[index]);
        }
    });
    history = newHistory;
    console.log(history.length);
	
    $(".selected").hide('slow', function(){ this.remove(); });
    reapplyHistory();
});


$("#snapshot-btn").click(function(){
    newSnapshot = $("#canvas")
        .children(":first")
        .clone()
        .attr("width",150)
        .attr("height","98%")
        .attr("class","snapshot")
        .attr("snapshot-count",snapshotCounter)
        //click snapshot to restore data
        .on("click",function(){
            console.log(snapshotHistory[$(this).attr("snapshot-count")]);
            //restore SVG
            $("#canvas").html("");
            $(this) //the svg
                .clone()
                .attr("width",710)
                .attr("height",590)
                //try to use $.removeClass()
                .attr("class","")
                .removeAttr("snapshot-count")
                .appendTo("#canvas")
                .children(":first")
                .attr("transform","translate(50,50)")
                .next()
                .attr("transform","translate(50,560)")
                .next()
                .attr("transform","translate(30,50)");
            console.log($(this));
            
            $("#history").html(snapshotHistory[$(this).attr("snapshot-count")]);
        });
    newSnapshot.appendTo("#snapshot")
        .children(":first")
        .attr("transform","scale(0.2) translate(50,50)")
        .next()
        .attr("transform","scale(0.2) translate(50,560)")
        .next()
        .attr("transform","scale(0.2) translate(30,50)");

    snapshotHistory[snapshotCounter]=$("#history").html();

    snapshotCounter++;
});


// $("svg").attr("height","%100");