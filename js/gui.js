var history = [];


//----------history items--------------
// $("#history").append("<div id=\"history-list\"></div>")
$("#buttons").accordion();
$(".button-group > .btn").draggable({helper: "clone" });

$("#history-panel").droppable({
    drop: function (event, ui) {
    	console.log("dropped!");
    	var newListedAction = $("<div></div>").text(ui.draggable.text()).append("<div class=\"delete-x glyphicon glyphicon-remove\"></div>");;
        $(newListedAction).children(".delete-x").click(function(){
            newListedAction.click();
            $("#delete-btn").click();
        });
    	//console.log(ui.draggable);
    	ui.draggable.click();
    	history.push(ui.draggable);
    	console.log(history);
    	newListedAction.click(function(){
    		$(this).toggleClass("selected");
    	});

    	newListedAction.appendTo("#history")
    }
});

//----------control button-----------
$("#delete-btn").click(function(){
	console.log("clicked del");

    var newHistory = [];
    $(".selected").each(function(index){
        var selectedItem = $(this);
        console.log(selectedItem.text());
        $.each(history, function(i,v){
            if (v.text()==selectedItem.text()){
                return false;
            }
            newHistory.push(selectedItem);
        })
    });
    history = newHistory;
    console.log(history);
	
    $(".selected").hide('slow', function(){ this.remove(); });

    //reapply all the not deleted actions

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