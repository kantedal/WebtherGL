Parse.initialize("9WlYsE8Vz2R18Uc06DYvrbW82G95ALHS73z8ss0J", "4uTYNccDsSRc3FmPl37n1qGEpuzniDzksvpnGd6w");

init();
function init()
{
	var WeatherData = Parse.Object.extend("Weather_data");
	var query = new Parse.Query(WeatherData);	
	query.limit(1);
	query.find({
		success: function(results) {
			for (var i = 0; i < results.length; i++) { 			
				var object = results[i];
				
				jQuery.get(object.attributes.coordinates._url, function(data) {	
					var coordinates = jQuery.parseJSON(data);
					initVariables(coordinates);

					signin();

					jQuery.get(object.attributes.wind_vectorField._url, function(data) {		
						var wind_vectorField = jQuery.parseJSON(data);
						createWindField(wind_vectorField);
						createMovingWind(0);
						createWindMap();
					});

					jQuery.get(object.attributes.temperature._url, function(data) {		
						var tempField = jQuery.parseJSON(data);
						createTempField(tempField);
						//addTemperatures(tempField);
						//createTempMap(temp);
					});

					jQuery.get(object.attributes.humidity._url, function(data) {		
						var humidityField = jQuery.parseJSON(data);
						createHumidityField(humidityField);
					});
					
					if(C_NUM == 3){
						jQuery.get(object.attributes.lmh_cloud._url, function(data) {		
							var lmh_cloud = jQuery.parseJSON(data);
							create3Clouds(lmh_cloud);
						});
					}else if(C_NUM == 1){
						jQuery.get(object.attributes.total_cloud._url, function(data) {		
							var total_cloud = jQuery.parseJSON(data);
							createClouds(total_cloud);
							createCloudField();
						});
					}
					

					jQuery.get(object.attributes.dates._url, function(data) {		
						dates = jQuery.parseJSON(data);
						initUI(true);
					});

					jQuery.get(object.attributes.rainfall_amount._url, function(data) {		
						var rainfall_amount = jQuery.parseJSON(data);
						createRain(rainfall_amount);
						createRainField();
					});
					
					jQuery.get('countries.txt', function(bd) {	
						//var border_data = bd.features[205].geometry.coordinates;
						var border_data = jQuery.parseJSON(bd).features[205].geometry.coordinates;	
						jQuery.get('lakes.txt', function(ld) {
							var lakes_data = jQuery.parseJSON(ld);
							var lakes = [];
							lakes[0] = lakes_data.features[17].geometry.coordinates;
							lakes[1] = lakes_data.features[146].geometry.coordinates;
							lakes[2] = lakes_data.features[170].geometry.coordinates;
							lakes[3] = lakes_data.features[0].geometry.coordinates;
							lakes[4] = lakes_data.features[161].geometry.coordinates;

							createLand(border_data, lakes);

							camera.position.set(-5.89211257974753,-56.42525909523534,0);
								TweenLite.to(camera.position, 4, {
								x:-5.89211257974753, 
								y:-48.42525909523534, 
								z:33.55380717727083, 
								delay:2.8, 
								onUpdate:updateCameraAnim,
								onComplete:completeCameraAnim
							});

							setTimeout(function(){ 
								animateToTime(0, 0);
								$("#ui").delay(1000).css('background-color', 'transparent');
								$("#spinner").fadeOut(2000); 
								$("#sidebar_left").fadeIn(2000); 
								$("#sidebar_right").fadeIn(2000); 
								$("#interface").fadeIn(2000); 
							}, 3000);
						});
					});
				});
			}
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}