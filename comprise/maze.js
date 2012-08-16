//Start
E = {
	m:document.getElementById("maze"),
	p:document.getElementById("pallet")
}

$("#tabs").tabs({
	select:function(event,ui){
		if(ui.index==2){
			$("#pallet").dialog({
				width:190,
				closeOnEscape:false,
				resizable:false,
				title:"Tools",
				beforeClose:function(){
					$("#help").dialog({
						height:700,
						width:1024,
						buttons:[{text:"Close",click:function(){$(this).dialog('close');}}]
					});
					$("#helpaccordion").accordion('resize');
					return false;
				}
			});
			$(".ui-icon",$("#pallet").parent()).removeClass("ui-icon-closethick").addClass("ui-icon-help");
			}else $("#pallet").dialog("destroy");
		}
});
$(document).ready(function(){
	if(loadFromCookie()) $("#tabs").tabs('select',2);
	$("#github").GitHubBadge({
		login:"shadow7412",
		kind:"project",
		repo_name:"Maze",
		image_path:"comprise/images/"
	});
	$("#helpaccordion").accordion();
});
function error(a){
	if(a!=null) clearTimeout(error.handle);
	$("#error").html(a);
	error.handle = setTimeout("$('#error').html('')",2000);
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
	"floor":"#",
	"spawn":"S",
	"exit":"X",
	"break":"%",
	"weakbreak":"=",
	"coin":"$",
	"door open A":"a",
	"door open B":"b",
	"door open C":"c",
	"door open D":"d",
	"door open E":"e",
	"door open F":"f",
	"door open G":"g",
	"door open H":"h",
	"door open I":"i",
	"door open J":"j",
	"door closed A":"A",
	"door closed B":"B",
	"door closed C":"C",
	"door closed D":"D",
	"door closed E":"E",
	"door closed F":"F",
	"door closed G":"G",
	"door closed H":"H",
	"door closed I":"I",
	"door closed J":"J",
	"key A":"1",
	"key B":"2",
	"key C":"3",
	"key D":"4",
	"key E":"5",
	"key F":"6",
	"key G":"7",
	"key H":"8",
	"key I":"9",
	"key J":"0",
	"pad A":"k",
	"pad B":"l",
	"pad C":"m",
	"pad D":"n",
	"pad E":"o",
	"pad F":"p",
	"pad G":"q",
	"pad H":"r",
	"pad I":"s",
	"pad J":"t",
	"boulder":"O",
	"lrboulder":">",
	"udboulder":"^",
	"deathzone":"*"
}
function unused(){
	var charcodes = ""
	for(i=0;i<128;i++) charcodes+=String.fromCharCode(i);
	for(var c in unblocks) charcodes = charcodes.replace(c,'');//charcodes.replace(c);
	return charcodes;
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
	if(r>200 || c>200) if(!confirm("Generating a map this large may crash the page - especially in non chrome browsers.")) return false;
	var grid = "";
	for(var x=0;x<r;x++){
		grid+="<div>";
		for(var y=0;y<c;y++) grid+="<span></span>";
		grid+="</div>";
	}
	E.m.innerHTML = grid;
	relabel();
	check();
	return true;
}
function relabel(){
	for(t in E.m.getElementsByTagName('span')) $(t).unbind(); //unbind existing tags to avoid 'double clicks' etc
	$(E.m).children()
	.each(function(i,e){
		e.className = i;
		$(e).children().each(function(i,e){
			e.id = $(e).parent()[0].className+"r"+i;
			$(e).mouseover(function(){mouseOver(this);});
			$(e).mousedown(function(){mouseDown(this);});
		});
	});
}
//Mouse Manipulation
function brush(e){
	if(e.className.search("notavail") != -1){
		error("Not available. Yet.");
		return;
	}
	$(e).removeClass("active").siblings().removeClass("active");
	if(e.className.search("door")!=-1 || e.className.search("key")!=-1 || e.className.search("pad")!=-1) mouse.type = e.className+" "+document.getElementById("doortype").value;
	else mouse.type = e.className;
	$(e).addClass("active");
}
function setType(t){
	if($("#pallet .key.active").length!=0) mouse.type = "key "+t;
	else if($("#pallet .pad.active").length!=0) mouse.type = "pad "+t;
	else if($("#pallet .door.open.active").length!=0) mouse.type = "door open "+t;
	else if($("#pallet .door.closed.active").length!=0) mouse.type = "door closed "+t;
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
	check();
}
// Maze Size
function addUp(){
	var m = $(E.m)
	var l = m.children().first().children().length;
	if(l==0) l=1;
	var d = "";
	for(var i=0;i<l;i++) d+="<span></span>";
	m.prepend("<div>"+d+"</div>");
	relabel();
}
function addDown(){
	var l = E.m.children[0].children.length;
	if(l==0) l=1;
	var d = document.createElement('div');
	for(var i=0;i<l;i++) d.appendChild(document.createElement('span'));
	E.m.appendChild(d);
	relabel();
}
function addLeft(){
	$(E.m).children().each(function(i,e){
		$(e).prepend(document.createElement('span'));
	});
	relabel();
}
function addRight(){
	$(E.m).children().each(function(i,e){
		$(e).append(document.createElement('span'));
	});
	relabel();
}
function removeUp(){
	$(E.m).children().first().remove();
	relabel();
}
function removeDown(){
	$(E.m).children().last().remove();
	relabel();
}
function removeLeft(){
	$(E.m).children().each(function(i,e){
			$(e).children().first().remove();
		});
	relabel();
}
function removeRight(){
	$(E.m).children().each(function(i,e){
			$(e).children().last().remove();
		});
	relabel();
}
//Saving/Loading
function exportLevel(){
	var data = "";
	$(E.m).children()
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
	$("textarea")[0].value = document.getElementById('mapname').value+"\n"+document.getElementById('creator').value+"\n"+data;
}
function importLevel(){
	var backup = E.m.innerHTML;
	var importData = $("textarea")[0].value.split('\n');
	var mapname = importData.shift();
	var creator = importData.shift();
	importData = importData.join('\n').split('');
	$(E.m).html("<div>"+
		$.map(importData,function(n){
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
	$(E.m).children().each(function(i,e){
		var l = $(e).children().length;
		if(l==0) $(e).remove(); //delete 'blank lines'
		else if(importLevel.count==0) importLevel.count = l; //if standard isn't set - set it.
		else if(importLevel.count!=l){ //if doesn't match standard - set to 0 (error) and stop loop early.
			importLevel.count=0;
			return false;
		}
	});
	if(importLevel.count==0){ //if 0 - no data or failed, then throw error.
		$(E.m).html(backup);
		return false;
	}
	document.getElementById("mapname").value = mapname;
	document.getElementById("creator").value = creator;
	relabel();
	check();
	return true;
}
function check(){
	var w = $(".warnings").removeClass("error");
	var p = [];

	//Floor
	if($(".floor",E.m).length==0) p.push("There is no floor");
	
	//1 spawn point
	var e = $(".spawn",E.m)//for jq objects
	var l = e.length;// a foor lengths
	if(l==0) p.push("Needs a spawn point");
	else if(l<4) p.push("Spawn must be 2X2");
	else if(l>4) p.push("There can only be one spawn");
	else if(!is2x2(e)) p.push("Spawn blocks must be 2X2");
	
	//1 spawn point
	e = $(".exit",E.m)//for jq objects
	l = e.length;// a foor lengths
	if(l==0) p.push("Needs an exit point");
	else if(l<4) p.push("Exit must be 2X2");
	else if(l>4) p.push("There can only be one exit");
	else if(!is2x2(e)) p.push("Exit must be 2X2");
	
	//each key has at least 1 door
	var keytypes = ['A','B','C','D','E','F','G','H','I','J'];
	for(a in keytypes){
		var keys = $(".key."+keytypes[a],E.m);
		if(keys.length!=0){
			if(!((keys.length==1) || (keys.length==2 && is2x1(keys)) || keys.length==4 && is2x2(keys)))
				p.push("Key "+(parseInt(a)+1)+" is an invalid shape");
			if($(".door."+keytypes[a],E.m).length==0) p.push("Key "+(parseInt(a)+1)+" has no door");
		} else if($(".door."+keytypes[a],E.m).length!=0)
			p.push("Door "+(parseInt(a)+1)+" has no key");
	}
	$(".warningCount").html(p.length);
	if(p.length==0) p.push("No errors");
	else $(w).addClass("error");
	//p.push("<button onclick=\"check()\">Check Now</button>"); //Unneeded now that this happens every iteration
	w.html(p.join('<br/>'));
}
function is2x2(e){
	if(e.length%4!=0) return false;
	for(var i=0;i<e.length;i++){
		var t = e[i].className;
		var c = e[i].id.match(/(\d*)r(\d*)/);
		c[1] = parseInt(c[1]);
		c[2] = parseInt(c[2]);
		if((b = document.getElementById(c[1]+"r"+(c[2]+1)))!=null && b.className==t) { //check top
			if(b = document.getElementById(c[1]+1+"r"+(c[2]+1))!=null && b.className==t)//check left
				return true;
			else if(b = document.getElementById(c[1]-1+"r"+(c[2]+1))!=null && b.className==t)//check right
				return true;
			else return false;
		} else if((b = document.getElementById(c[1]+"r"+(c[2]-1)))!=null && b.className==t) { //check top
			if(b = document.getElementById(c[1]+1+"r"+(c[2]-1))!=null && b.className==t)//check left
				return true;
			else if(b = document.getElementById(c[1]-1+"r"+(c[2]-1))!=null && b.className==t)//check right
				return true;
			else return false;
		} else return false; //... Is this a 1x1 grid lol?
	}
}
function is2x1(e){
	if(e.length<2) return false;
	for(var i=0;i<e.length;i++){
		var t = e[i].className;
		var c = e[i].id.match(/(\d*)r(\d*)/);
		c[1] = parseInt(c[1]);
		c[2] = parseInt(c[2]);
		if((b = document.getElementById(c[1]+"r"+(c[2]+1)))!=null && b.className==t)
			return true;//check top
		if((b = document.getElementById(c[1]+"r"+(c[2]-1)))!=null && b.className==t)
			return true;//check bottom
		if((b = document.getElementById(c[1]+1+"r"+(c[2])))!=null && b.className==t)
			return true;//check left
		if((b = document.getElementById(c[1]-1+"r"+(c[2])))!=null && b.className==t)
			return true;//check right
		return false
	}
}
//Keys
$(document).keydown(function(event) {
    if($("#tabs").tabs('option','selected')!=2){
		//ignore!
	} else if (String.fromCharCode(event.which).toLowerCase() == 's' && event.ctrlKey){
		saveToCookie();
		event.preventDefault();
		return false;
    } else if (String.fromCharCode(event.which).toLowerCase() == 'z' && event.ctrlKey){
		if(confirm("Are you sure you want to try and load the last save?"))
			if(loadFromCookie())
				error("Load successful");
			else
				error("Could not load. Try saving first!");
		event.preventDefault();
		return false;
	} else if(String.fromCharCode(event.which).toLowerCase() == 'q'){
		brush($("#paint").children()[0]);
	} else if(String.fromCharCode(event.which).toLowerCase() == 'w'){
		brush($("#paint").children()[1]);
	} else if(String.fromCharCode(event.which).toLowerCase() == 'e'){
		brush($("#paint").children()[2]);
	} else if(String.fromCharCode(event.which).toLowerCase() == 'r'){
		brush($("#paint").children()[3]);
	} else if(String.fromCharCode(event.which).toLowerCase() == 'a'){
		brush($("#paint").children()[4]);
	} else if(String.fromCharCode(event.which).toLowerCase() == 's'){
		brush($("#paint").children()[5]);
	} else if(String.fromCharCode(event.which).toLowerCase() == 'd'){
		brush($("#paint").children()[6]);
	} else if(String.fromCharCode(event.which).toLowerCase() == 'f'){
		brush($("#paint").children()[7]);
	} else if(String.fromCharCode(event.which).toLowerCase() == 'z'){
		brush($("#paint").children()[8]);
	} else if(String.fromCharCode(event.which).toLowerCase() == 'x'){
		brush($("#paint").children()[9]);
	} else if(String.fromCharCode(event.which).toLowerCase() == 'c'){
		brush($("#paint").children()[10]);
	} else if(String.fromCharCode(event.which).toLowerCase() == 'v'){
		brush($("#paint").children()[11]);
	} else if(String.fromCharCode(event.which).toLowerCase() == ' '){
		brush($("#paint").children()[12]);
	} else if(event.which>=48 && event.which<=57){
		document.getElementById("doortype").value = ['J','A','B','C','D','E','F','G','H','I'][event.which-48];
		setType(event.which-48);
	} else {
		return true;
	}
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