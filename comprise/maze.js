$(function() {
	$("#tabs").tabs();
});
function d(a){
	console.log(a)
	return a;
}
function generate(r,c){
	var grid = "";
	for(var x=0;x<r;x++){
		grid+="<div>";
		for(var y=0;y<c;y++) grid+="<span onmouseover=\"mouseOver(this.id)\" onmousedown=\"mouseDown(this.id)\" onmouseup=\"mouseUp(this.id)\"></span>";
		grid+="</div>";
	}
	$("#maze").html(grid);
	relabel();
}
function relabel(){
	$("#maze").children()
	.each(function(i,e){
		e.className = i;
		$(e).children().each(function(i,e){
			e.id = "c"+$(e).parent()[0].className+"r"+i;
		});
	});
}
function brush(e){
	$("#pallet").children().removeClass("active");
	mouse.type = e.className;
	$(e).addClass("active");
}
var mouse = {
	type:"wall",
	dragging:false,
	down:false
}
function mouseDown(id){
	mouse.dragging = true;
	$("#"+id)[0].className = mouse.type;
}
function mouseUp(id){
	mouse.dragging = false;
}
function mouseOver(id){
	if(mouse.dragging) $("#"+id)[0].className = mouse.type;
}