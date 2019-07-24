var asset;
var buildStart = false;
var buildEnd = false;

var platform = "?";
var ticketIndex = 0;


function DetectPlatform(){

	var sBrowser, sUsrAg = navigator.userAgent;

	// The order matters here, and this may report false positives for unlisted browsers.

	if (sUsrAg.indexOf("Firefox") > -1) {
	  sBrowser = "Firefox";
	  // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
	} else if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) {
	  sBrowser = "Opera";
	  //"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
	} else if (sUsrAg.indexOf("Trident") > -1) {
	  sBrowser = "IE";
	  // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
	} else if (sUsrAg.indexOf("Edge") > -1) {
	  sBrowser = "Edge";
	  // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
	} else if (sUsrAg.indexOf("Chrome") > -1) {
	  sBrowser = "Chrome";
	  // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
	} else if (sUsrAg.indexOf("Safari") > -1) {
	  sBrowser = "Safari";
	  // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
	} else {
	  sBrowser = "unknown";
	}

	return sBrowser;



}

function init(){


	platform = DetectPlatform();

	console.log(platform);

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

	if(buildStart == false){
		myWindow.document.write("<html>");
		myWindow.document.write("<body style='margin: 0px 0px 0px 0px; overflow-y: hidden; overflow-x: hidden; width: 100%;'>");


		myWindow.document.write("<style>");

		if(platform == "Chrome"){
			
			myWindow.document.write(".asset{ width: 9.89582cm; height: 5.303cm; position: relative; display: inline-flex; float: left;}");
			myWindow.document.write(".img{width: 9.89582cm; height: 5.303cm; position: absolute; }");
			myWindow.document.write(".p1{ position: absolute; left: 2.3cm; top: 3.35cm; width: 300px; transform: translate(0, -100%); margin: 0 0 0 0; }");
			myWindow.document.write(".p2{ position: absolute; left: 3.2cm; top: 3.95cm; transform: translate(0, -100%);  margin: 0 0 0 0; }");
			myWindow.document.write(".p3{ position: absolute; left: 4.5cm; top: 3.95cm; transform: translate(0, -100%);  margin: 0 0 0 0; }");
			myWindow.document.write(".p4{ position: absolute; left: 5.8cm; top: 3.95cm; transform: translate(0, -100%);  margin: 0 0 0 0; }");

		}else{
			
			myWindow.document.write(".asset{height: 9.35cm; width: 5.303cm; position: relative;}");
			myWindow.document.write(".img{ width: 9.35cm; height: 5.303cm; position: absolute; }");
			myWindow.document.write(".p1{ position: absolute; left: 2.3cm; top: 3.35cm; width: 300px; transform: translate(0, -100%); margin: 0 0 0 0; }");
			myWindow.document.write(".p2{ position: absolute; left: 3.2cm; top: 3.95cm; transform: translate(0, -100%);  margin: 0 0 0 0; }");
			myWindow.document.write(".p3{ position: absolute; left: 4.5cm; top: 3.95cm; transform: translate(0, -100%);  margin: 0 0 0 0; }");
			myWindow.document.write(".p4{ position: absolute; left: 5.8cm; top: 3.95cm; transform: translate(0, -100%);  margin: 0 0 0 0; }");

		}

		myWindow.document.write("</style>");
		myWindow.document.write("<style>@page{margin: 0mm 0mm 0mm 0mm; size: 297mm 210mm; padding: 0mm 0mm 0mm 0mm; }</style>")
		buildStart = true;
	}
	if(platform == "Firefox"){
		if(ticketIndex == 0)
			myWindow.document.write("<div style='width:100%; height: 9.32cm; position: relative'>");


		indexPosition = ticketIndex * 5.303 - (4.75 / 2);

		myWindow.document.write("<div style="+"'"+"position: absolute; transform: rotate(90deg); left: "+ indexPosition +"cm; top: -2.3cm;" + "'" + ">");

	}

	myWindow.document.write(document.getElementById('meal_ticket_asset').innerHTML); 

	if(platform == "Firefox"){

		myWindow.document.write("</div>");

		if(ticketIndex == 3){
			myWindow.document.write("</div>");
			ticketIndex = 0;
		}
		else
			ticketIndex++;
	}

	if(buildEnd == true){

		buildStart = false;
		buildEnd = false;
		myWindow.document.write("</body>");
		myWindow.document.write("</html>");
	}


}


init();


