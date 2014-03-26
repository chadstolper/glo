//----------define history behavior--------------
var history = [];

//-------------UI stuff-------------------
$("#buttons").accordion();
$(".button-group > .btn").draggable({helper: "clone" });



$("#history-panel").droppable({
    drop: function (event, ui) {
    	var newListedHistItem = $("<div></div>")
            .addClass("history-item")
            .text(ui.draggable.text())
            .append("<div class=\"delete-x glyphicon glyphicon-remove\"></div>")
            .click(function(){
                $(this).toggleClass("selected");
            })
            .appendTo("#history");

        $(newListedHistItem).children(".delete-x")
            .click(function(){
                var selectedItem = $(this.parentNode);
                $.each(history,function(index,value){
                    console.log(selectedItem.text()+" "+history[index].name);
                    if (selectedItem.text()==history[index].name){
                        history.splice(index,1);
                        console.log(index);
                        return false;
                    }
                });
                $(this.parentNode).hide('slow', function(){ this.remove(); });
                force_directed_stop_immediately()
                for (i = 0; i < history.length; i++) {
                    history[i].func();
                }
            });


    	var histItem = {};
        histItem.name = ui.draggable.text();
        histItem.func = function(){ui.draggable.click()};
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

    //reapply new history
    //force_directed();
    force_directed_stop_immediately()
    for (i = 0; i < history.length; i++) {
        history[i].func();
    }
});


$("#snapshot-btn").click(function(){
    $("#canvas")
        .children(":first")
        .clone()
        .attr("width",150)
        .attr("height","100%")
        .attr("class","snapshot")        
        .appendTo("#snapshot")
        .children(":first")
        .attr("transform","scale(0.2) translate(50,50)") 

});


// $("svg").attr("height","%100");