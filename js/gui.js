var history = [];

$("#history").append("<ul id=\"history-list\"></ul>")
$("#buttons").accordion();
$(".btn").draggable({helper: "clone" });

$("#history-panel").droppable({
    drop: function (event, ui) {
    	console.log("dropped!");
    	$("<div></div>").text(ui.draggable.text()).appendTo("#history-list");
    	//console.log(ui.draggable);
    	ui.draggable.click();
    	var text = ui.draggable.text();
    	history.push(text);
    	//console.log(history);
    }
});
