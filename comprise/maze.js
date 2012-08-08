$(function() {
	$("#tabs").tabs({
		select:function(event,ui){
			if(ui.index==1) 
				$("#pallet").dialog({width:150,closeOnEscape:false, title:"Tools"}); else $("#pallet").dialog("close");
			}
	});
});
function d(a){
	console.log(a)
	return a;
}
function generate(r,c){
	var grid = "";
	for(var x=0;x<r;x++){
		grid+="<div>";
		for(var y=0;y<c;y++) grid+="<span></span>";
		grid+="</div>";
	}
	$("#maze").html(grid);
	relabel();
}
function relabel(){
	$("#maze span").unbind();
	$("#maze").children()
	.each(function(i,e){
		e.className = i;
		$(e).children().each(function(i,e){
			e.id = "c"+$(e).parent()[0].className+"r"+i;
			e.onmouseover="mouseOver(this)";
			e.onmousedown="mouseDown(this)";
		});
	});
	$("#maze span").mouseover(function(){
		mouseOver(this);
	});
	$("#maze span").mousedown(function(){
		mouseDown(this);
	});
}
function brush(e){
	$(e).siblings().removeClass("active");
	mouse.type = e.className;
	$(e).addClass("active");
}
var mouse = {
	type:"wall",
	dragging:false,
	down:false
}
var blocks = {
	"":"_",
	"wall":"@",
	"floor":"#"
}
function invert(obj) {
	var new_obj = {};
	for (var prop in obj)
		if(obj.hasOwnProperty(prop))
			new_obj[obj[prop]] = prop;
	return new_obj;
}
var unblocks = invert(blocks);
function mouseDown(e){
	mouse.dragging = true;
	mouse.down=e.id;
	e.className = mouse.type;
}
function mouseOver(e){
	if(mouse.dragging) e.className = mouse.type;
}
function mouseUp(){
	mouse.dragging = false;
}
function exportLevel(){
	var data = "";
	$("#maze").children()
	.each(function(i,e){
		e.className = i;
		$(e).children().each(function(i,e){
			if(blocks[e.className] != null){
				data+=blocks[e.className];
			} else {
				data+=blocks[""];
			}
		});
		data+="\n";
	});
	$("textarea")[0].value = data;
}
function importLevel(){
	var backup = $("#maze")[0].innerHTML;
	$("#maze").html("<div>"+
		$.map($("textarea")[0].value.split(''),function(n){
			if(n=="\n") return "</div><div>";
			var data;
			if(unblocks[n] != null){
				data=unblocks[n];
			} else {
				data=unblocks[""];
			}
			return "<span class=\""+data+"\"></span>";
		}).join('')
	+"</div>");
	importLevel.count = 0;
	$("#maze").children().each(function(i,e){
		var l = $(e).children().length;
		if(importLevel.count==0) importLevel.count = l;
		else if(importLevel.count!=l){
			importLevel.count=0;
			return false;
		}
	});
	if(importLevel.count==0){
		$("#maze").html(backup);
		return false;
	}
	relabel();
	return true;
}