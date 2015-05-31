var locations = [];
var cookieLocations;
var user;

var newLocationsList = [
	["Stockholm",18.110103,59.334415],
	["Göteborg",11.9751,57.7087],
	["Luleå",22.1567,65.584819],
	["Kiruna",20.225,67.855],
	["Malmö",13.004,55.605],
	["Norrköping",16.1924,58.587745],
	["Östersund",14.65,63.1833],
	["Kalmar",16.3333,56.8167],
	["Visby",18.296,57.6409],
	["Växjö",14.8092,56.877],
	["Umeå",20.25,63.8333],
	["Falun",15.6333,60.6],
	["Karlstad",13.5,59.3667]
];

var locationsList;

function getCookie(c_name)
{
    var i,x,y,ARRcookies=document.cookie.split(";");

    for (i=0;i<ARRcookies.length;i++)
    {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==c_name)
        {
            return unescape(y);
        }
     }
}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function createUser(){
	var username = makeid()
	var password = makeid()

	try{
		document.cookie += "user="+username+";"

		user = new Parse.User();
		user.set("username", username);
		user.set("password", "temp");
		user.set("locations", newLocationsList);

		user.signUp();
		locationsList = newLocationsList

		getLocations();
	}catch(err){
		getLocationsWithoutCookies(newLocationsList);
	}
	
}

function signin(){
	console.log(document.cookie)
	if(getCookie("user") == undefined){
		createUser();
	}
	else{
		Parse.User.logIn(getCookie("user") , "temp" , {
			success: function(usr) {
				user = usr
				locationsList = user.get("locations")
				getLocations();
			},
			error: function(user, error) {
				getLocationsWithoutCookies(newLocationsList);
			}
		});
	}
}

function getLocationsWithoutCookies(newLocationsList){
	for (var i = 0; i < newLocationsList.length; i++) {
		locations[i] = [];

		locations[i].name = newLocationsList[i][0];
		locations[i].lon = newLocationsList[i][1];
		locations[i].lat = newLocationsList[i][2];
	};
	addLocations();
}

function getLocations(){
	for (var i = 0; i < locationsList.length; i++) {
		locations[i] = [];

		locations[i].name = locationsList[i][0];
		locations[i].lon = locationsList[i][1];
		locations[i].lat = locationsList[i][2];
	};
	addLocations();
}

function addLocationParse(location){
	newLoc = [location.name, location.lon, location.lat];
	locationsList.push(newLoc);
	user.set("locations", locationsList);
	user.save()
}

function removeLocationCookie(location){
	for(i=0; i<locationsList.length; i++)
		if(locationsList[i][0].localeCompare(location.name) == 0)
			locationsList.splice(i, 1);

	user.set("locations", locationsList);
	user.save()
}