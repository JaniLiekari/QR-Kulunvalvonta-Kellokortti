/* DATA LOADING FUNCTIONS */

function Filters(shift, disapleCreation){
	this.shift = shift;
	this.disapleCreation = disapleCreation;
}



function FixWrapper(){

	var wrapper = document.getElementById("wrapper");
	var nav = document.getElementById("nav-bar");

	var height = window.innerHeight - nav.offsetHeight;

    if(height < 600)
        height = 600;

	wrapper.style.height = height+"px";


}


document.onload = FixWrapper();
window.addEventListener("resize", FixWrapper());


var chart = document.getElementById('curve_chart');

var oneDataLenght;
var oneDataOffset;
var width = chart.offsetWidth;
var height = chart.offsetHeight - 10;
var maxHeight = -999;
var data;

var oneDataHeight;



function LoadChart(){
	Clear();
    SetSize();
    LoadBGLines();
    TowerCreator();
}


function Clear(){
	while (chart.firstChild) {
    	chart.removeChild(chart.firstChild);
	}
}

function LoadBGLines(){
    for(var i = 0; i <= maxHeight; i++){
    	if(maxHeight < 15 || i % 2 == 1)
    		AddLine(0, i*oneDataHeight, width+"px", "1px", i, "data-left");
    }

    for(var i = 0; i < data["data"].length; i++){
    	if(i % 2 == 1){
    		AddLine(i*oneDataLenght + (oneDataLenght / 2), 0, "1px", (height+8)+"px", data["data"][i]["date"], "data-under");
    	}
   	}
}

function SetSize(){
    oneDataLenght = width / data["data"].length;
    oneDataOffset = oneDataLenght / 15;

    for(var i = 0; i < data["data"].length; i++){
    	if(data["data"][i]["users"].length > maxHeight){
    		maxHeight = data["data"][i]["users"].length;
    	}
    }

    oneDataHeight = height / maxHeight;
}


function TowerCreator(){
    for(var i = 0; i < data["data"].length; i++){
   		var positionX = i*oneDataLenght;
    	var h = data["data"][i]["users"].length * oneDataHeight;
    	if(h < 10)
   			h = 10;
   		var usr = "";
   		var absence = "";
   		for(var j = 0; j < data["data"][i]["users"].length;j++){
    		usr+=data["data"][i]["users"][j];
    		if(j < data["data"][i]["users"].length-1)
    			usr+="\n";
    	}for(var j = 0; j < data["data"][i]["absence"].length; j++){
    		absence+=data["data"][i]["absence"][j];
    		if(j < data["data"][i]["absence"].length-1){
    			absence+="\n";
    		}
    	}
    	AddTower(h,positionX,"Päivä: "+ data["data"][i]["date"] + "\nKirjautumiset: " + data["data"][i]["users"].length +"\nPoissaolot: "+ data["data"][i]["absence"].length + "\n\nKäyttäjät:\n" + usr + "\n\nPoissaolijat:\n" + absence);
    }
}


	/* DRAW FUNCTIONS */

function AddLine(positionX, positionY, w, h, data, pclass){
    var div = document.createElement('div');
    div.classList.toggle('line');
    div.style.setProperty('height', h);
    div.style.setProperty('width', w);
    div.style.setProperty('left', positionX);
    div.style.setProperty('bottom', positionY);

    var p = document.createElement('p');
    p.classList.toggle(pclass);
    p.innerHTML = data;
    div.appendChild(p);

    chart.appendChild(div);
}

function AddTower(h, positionX, amount){
    var div = document.createElement('div');
    div.classList.toggle('tower');
    div.style.setProperty('--height', h);
    div.style.setProperty('height', h);
    div.style.setProperty('left', positionX);
    div.style.setProperty('width', oneDataLenght);

    div.setAttribute("text", amount);
    chart.appendChild(div);
}




function GetLastMonth(){

	var today = new Date();
	today.setDate(today.getDate() - 1);
	var tm = today.getMonth() + 1;
	if(tm < 10){ tm = "0" + tm; }
	var td = today.getDate();
	if(td < 10){ td = "0" + td; }
	document.getElementById('end').value = today.getFullYear() + "-" + tm + "-" + td;
	var lastMonth = new Date();
	lastMonth.setDate(today.getDate() - 30);
	var lm = lastMonth.getMonth() + 1;
	if(lm < 10){ lm = "0" + lm; }
	var ld = lastMonth.getDate() + 1;
	if(ld < 10){ ld = "0" + ld; }
	document.getElementById('start').value = lastMonth.getFullYear() + "-" + lm + "-" + ld;

	LoadStatData(LoadChartData, today, lastMonth);

}

function ReloadStatistic(){

	var start = document.getElementById('start').value;
	var end = document.getElementById('end').value;

	if(end == undefined ||end == null ||start == undefined ||start == null){
		return;
	}
	if(end < start)
		return;


	LoadStatData(LoadChartData, end, start);


}

function Prelaunch(){
	GetLastMonth();
}

document.onload = Prelaunch();





