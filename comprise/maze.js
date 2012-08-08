//Start
$(function() {
	$("#tabs").tabs({
		select:function(event,ui){
			if(ui.index==1) 
				$("#pallet").dialog({width:180,closeOnEscape:false, title:"Tools"}); else $("#pallet").dialog("close");
			}
	});
	if(loadFromCookie()) $("#tabs").tabs('select',1);
});
function error(a){
	if(a!=null) clearTimeout(error.handle);
	$("#error").html(a);
	error.handle = setTimeout("$('#error').html('')",4000);
}
//Maze Generation
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
//Manipulation
function brush(e){
	$(e).siblings().removeClass("active");
	mouse.type = e.className;
	$(e).addClass("active");
}
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
function addUp(){
	var m = $("#maze")
	var l = m.children().first().children().length;
	var d = "";
	for(var i=0;i<l;i++) d+="<span></span>";
	m.prepend("<div>"+d+"</div>");
	relabel();
}
function addDown(){
	var m = $("#maze")
	var l = m.children().first().children().length;
	var d = "";
	for(var i=0;i<l;i++) d+="<span></span>";
	m.append("<div>"+d+"</div>");
	relabel();
}
function addLeft(){
	$("#maze").children().each(function(i,e){
		$(e).prepend("<span></span>");
	});
	relabel();
}
function addRight(){
	$("#maze").children().each(function(i,e){
		$(e).append("<span></span>");
	});
	relabel();
}
//Saving/Loading
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
		if(l==0) $(e).remove(); //delete 'blank lines'
		else if(importLevel.count==0) importLevel.count = l; //if standard isn't set - set it.
		else if(importLevel.count!=l){ //if doesn't match standard - set to 0 (error) and stop loop early.
			importLevel.count=0;
			return false;
		}
	});
	if(importLevel.count==0){ //if 0 - no data or failed, then throw error.
		$("#maze").html(backup);
		return false; //
	}
	relabel();
	return true;
}
//capture Ctrl S to save (on some browsers)
$(document).keydown(function(event) {
    if (!( String.fromCharCode(event.which).toLowerCase() == 's' && event.ctrlKey) && !(event.which == 19)) return true;
    saveToCookie();
    event.preventDefault();
    return false;
});
function saveToCookie(){
	exportLevel();
	createCookie("mazelevel",$("textarea")[0].value,90);
	error("Saved!");
}
function loadFromCookie(){
	$("textarea")[0].innerHTML = readCookie("mazelevel")
	return importLevel();
}
//COOKIE MANAGEMENT
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value.replace(/\n/g,"|")+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length).replace(/\|/g,"\n");
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}