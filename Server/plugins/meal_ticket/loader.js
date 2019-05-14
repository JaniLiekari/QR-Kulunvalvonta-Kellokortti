var asset;


function init(){


	var request =  new XMLHttpRequest();
	var url = 'http://'+ip+':'+port+'/admin/meal_ticket/HTML';
	request.open("GET", url,true);
	request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	request.onreadystatechange = function() {
	    if(request.readyState == 4 && request.status == 200) {

	    	
	    	asset = document.createElement('Div');
	    	asset.id = "meal_ticket_asset";
	    	asset.style.display = "none";
	    	asset.style.visibility= "hidden";
	       	asset.innerHTML = request.responseText.trim();

	       	document.getElementsByTagName("BODY")[0].appendChild(asset);

	       	document.getElementById('meal_ticket_image').src = "http://"+ip+":"+port+"/admin/meal_ticket/image";

	       
	    }
	}

	request.send();

}


function BuildAsset(name){


	var date = new Date();

	document.getElementById('meal_ticket_name').innerHTML = name;
	document.getElementById('meal_ticket_pv').innerHTML = date.getDate();
	document.getElementById('meal_ticket_kk').innerHTML = date.getMonth() + 1;
	document.getElementById('meal_ticket_vv').innerHTML = date.getFullYear();


	var myWindow = window.open("", "MsgWindow", "width=800,height=600");

	if(myWindow == null){
		alert('Ponnahdusikkunat on estetty selaimessasi. Salli tälle sivulle ponnahdusikkunat käyttääksesi toimintoa.');
		return;
	}

	myWindow.document.write("<html>");
	myWindow.document.write("<body style='margin: 0 0 0 0;'>");
	myWindow.document.write("<style>@page{margin: 0; size: landscape;}</style>")
	myWindow.document.write(document.getElementById('meal_ticket_asset').innerHTML); 

	myWindow.document.write("</body>");
	myWindow.document.write("</html>");


}


init();


