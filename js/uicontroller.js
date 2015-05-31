var cities;
var mouse = {x : 0, y : 0};
var dates;

function formatNum(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

function disableMaps(current)
{
	if(current != "rain_map"){
		TweenLite.to(rainPlane.material, 0.5, {opacity:0}); 
		setTimeout(function(){ scene.remove(rainPlane); }, 500);

		hideInfoLabels();
		allowRainField = false;

		$('#rain_map').prop('checked', false);
	}

	if(current != "cloud_map"){
		TweenLite.to(cloudPlane.material, 0.5, {opacity:0}); 
		setTimeout(function(){ scene.remove(cloudPlane); }, 500);

		hideInfoLabels();
		allowCloudField = false;

		$('#cloud_map').prop('checked', false);
	}

	if(current != "temp_map"){
		TweenLite.to(tempPlane.material, 0.5, {opacity:0}); 
		setTimeout(function(){ scene.remove(tempPlane); }, 500);

		hideInfoLabels();
		allowTempField = false;

		$('#temp_map').prop('checked', false);
	}

	if(current != "humidity_map"){
		TweenLite.to(humidityPlane.material, 0.5, {opacity:0}); 
		setTimeout(function(){ scene.remove(humidityPlane); }, 500);

		hideInfoLabels();
		allowHumidtyField = false;

		$('#humidity_map').prop('checked', false);
	}
}

function initUI(firstInit)
{
    var list = "";
    currentTime = $("#date_slider")[0].value;

    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );

	$(function() {
	    $('.accordion').accordion({
		    active: false,
		    collapsible: true            
		});
	  });

    $.ajax({
        url : "cities.txt",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success : function (data) {
            cities = data;
            cities.sort();

		    var i = 0;
		    while(i<cities.length-2){
		        remove_num = 0;
		        while(cities[i][0] == cities[i+1][0]){
		            remove_num++;
		            i++;
		        }
		        if(remove_num!=0){
		            cities.splice(i-remove_num, remove_num);
		            i = i-remove_num;
		            remove_num = 0;
		        }
		        i++;
		    }           
       }
   	});

   	$( "input[type=checkbox]" ).on( "click", function(){
		var checked = $(this).prop('checked');
		switch($(this).attr('id')) {
		    case "wind_field":
		    	if(checked)
				{
		       		scene.add(wind_group);
					allowWindField = true;
				}
		       	else
				{		 
		       		scene.remove(wind_group);
					allowWindField = false;
				}

		        break;
		    case "wind_map":
		    	if(checked)
				{
					windPlane.material.opacity = 0;
					scene.add(windPlane);
					TweenLite.to(windPlane.material, 0.5, {opacity:0.7}); 
					allowWindMap = true;
					animateToTime($("#date_slider")[0].value, currentTime);
					disableMaps("wind_map");
				}
		       	else
				{		 
					TweenLite.to(windPlane.material, 0.5, {opacity:0}); 
					setTimeout(function(){ scene.remove(windPlane); }, 500);

					hideInfoLabels();
					allowWindMap = false;
				}

		        break;
		    case "wind_sim":
		    	if(checked)
				{
					updateMovingWind($("#date_slider")[0].value);
  					allowWindSimulation = true;
				}
		       	else
				{
					hideMovingWind()
		       		setTimeout(function(){ scene.remove(wind_arrow_group); }, 500);
  					allowWindSimulation = false;
				}

		        break;
		    case "cloud_sim":
				if(checked){
		       		scene.add(cloud_group);
		       		allowCloudSimulation = true;
		       		animateToTime($("#date_slider")[0].value, currentTime);
		       	}else{
		       		hideClouds();
		       		allowCloudSimulation = false;
		       		setTimeout(function(){ scene.remove(cloud_group); }, 500);
		       	}
		        break;
		    case "rain_map":
				if(checked)
				{
					rainPlane.material.opacity = 0;
					scene.add(rainPlane);
					TweenLite.to(rainPlane.material, 0.5, {opacity:0.7}); 
					allowRainField = true;
					animateToTime($("#date_slider")[0].value, currentTime);
					disableMaps("rain_map");
				}	
		       	else
				{
					TweenLite.to(rainPlane.material, 0.5, {opacity:0}); 
					setTimeout(function(){ scene.remove(rainPlane); }, 500);

					hideInfoLabels();
					allowRainField = false;
				}	
		        break;
		    case "cloud_map":
				if(checked)
				{
					cloudPlane.material.opacity = 0;
					scene.add(cloudPlane);
					TweenLite.to(cloudPlane.material, 0.5, {opacity:0.7}); 
					allowCloudField = true;
					animateToTime($("#date_slider")[0].value, currentTime);
					disableMaps("cloud_map");
				}		 
		       	else
				{
					TweenLite.to(cloudPlane.material, 0.5, {opacity:0}); 
					setTimeout(function(){ scene.remove(cloudPlane); }, 500);

					hideInfoLabels();
					allowCloudField = false;
				}	
		        break;
		    case "temp_map":
				if(checked)
				{
					tempPlane.material.opacity = 0;
					scene.add(tempPlane);
					TweenLite.to(tempPlane.material, 0.5, {opacity:0.7}); 
					allowTempField = true;
					animateToTime($("#date_slider")[0].value, currentTime);
					disableMaps("temp_map");
				}
		       	else
				{
					TweenLite.to(tempPlane.material, 0.5, {opacity:0}); 
					setTimeout(function(){ scene.remove(tempPlane); }, 500);

					hideInfoLabels();
					allowTempField = false;
				}	
		        break;
		    case "temp_labels":
				if(checked){
					allowLocations = true;
					toggleLocations(true);
		       	}else{
		       		allowLocations = false;
					toggleLocations(false);
				}
		        break;
		    case "rain_sim":
				if(checked){
		       		top_scene.add(raindropSystem[currentTime]);
		       		allowRain = true;
		       		animateToTime($("#date_slider")[0].value, currentTime);
		       	}else{
		       		TweenLite.to(raindropSystem[$("#date_slider")[0].value].material, 0.5, {opacity:0}); 
		       		setTimeout(function(){ top_scene.remove(raindropSystem[currentTime]); }, 500);
		       		
		       		allowRain = false;
		       	}
		        break;
		    case "humidity_map":
				if(checked){
					humidityPlane.material.opacity = 0;
					scene.add(humidityPlane);
					TweenLite.to(humidityPlane.material, 0.5, {opacity:0.7}); 
					allowHumidtyField = true;
					animateToTime($("#date_slider")[0].value, currentTime);
					disableMaps("humidity_map");

		       	}else{
		       		TweenLite.to(humidityPlane.material, 0.5, {opacity:0}); 
					setTimeout(function(){ scene.remove(humidityPlane); }, 500);

					hideInfoLabels();
					allowHumidtyField = false;
		       	}
		        break;
		    }
	   // var indexId =  id.match(/(\d+)/g);
	});

	$('#search_box').keyup(function () { 
	    list = "";
	    list = list + '';

	    var shownHits = 0;
	    for (var i = 0; i < cities.length; i++) {
	        var input = $('#search_box').val().toLowerCase();
	        var currentCity = cities[i][0].substring(0,input.length).toLowerCase();

	        if(currentCity == input && input != "")
	        {       
	        	var allowAdd = true; 
	        	for (var j = 0; j < locations.length; j++) 
    	        	if(locations[j].name == cities[i][0]) allowAdd = false;
      
	            if(allowAdd)
	            {
	                list += '<li class="listitem" id="'+i+'_listitem">' + cities[i][0]  
	                		+'<button class="list_button" id="'+i+'_button"></button></li>';
	                shownHits++;
	            }
	        }
	        if(shownHits==5)
	        	break;
	    }

	    $("#listitems").html(list); //Lägger in den skapade stringen i results_area

		$( ".list_button" ).button({
			icons: {
				primary: "ui-icon-plus"
			},
			text: false
		});
		$( ".list_button" ).button().click(function(){
			var id = $(this).attr('id');
		    var indexId =  id.match(/(\d+)/g);

		    var locationsId = locations.length;
		    locations[locationsId] = [];

			locations[locationsId].name = cities[indexId][0];

			locations[locationsId].lon = cities[indexId][2]
			locations[locationsId].lat = cities[indexId][1];

		    addLocation(locationsId);
		});
	});

	// $('#listitems').delegate('li','click', function ()
	// {
	//     var id = $(this).attr('id');
	//     var indexId =  id.match(/(\d+)/g);

	//     var locationsId = locations.length;
	//     locations[locationsId] = [];

	// 	locations[locationsId].name = cities[indexId][0];

	// 	if(cities[indexId][2] > 1){
	// 		locations[locationsId].lon = cities[indexId][2]+10;
	// 	}else{
	// 		locations[locationsId].lon = cities[indexId][2]+20;
	// 	}
	// 	locations[locationsId].lat = cities[indexId][1];

	//     addLocation(locationsId);
	// });

	var months = ["januari","februari","mars","april","maj","juni","juli",
				  "augusti","september","oktober","november","december"];
	var play = false;
	var prev_value = 0;

	var date = new Date(dates[0]);
	$("#date_text").html(
		date.getUTCDate()+" "+months[date.getUTCMonth()]+" "+
		formatNum(date.getUTCHours())+":"+formatNum(date.getUTCMinutes())
	);

	var formatedDates = [];

	for(i=0; i<dates.length; i++){
		var date = new Date(dates[i]);
		formatedDates[i] = date.getUTCDate()+" "+months[date.getUTCMonth()]+" "+
		formatNum(date.getUTCHours())+":"+formatNum(date.getUTCMinutes())
	}

	if(firstInit){
		$("#date_slider").ionRangeSlider({
	        hide_min_max: true,
	        keyboard: true,
	        min: 0,
	        max: 34,
	        step: 1,
	        grid_num: 17,
	        type: 'single',
	        grid: true,
	        prettify: function (num) {
	        	var date = new Date(dates[num]);
				return date.getUTCDate()+" "+months[date.getUTCMonth()]+" "+
				formatNum(date.getUTCHours())+":"+formatNum(date.getUTCMinutes())

		    },
		    onChange: function (data) {
		        animateToTime(data.from, prev_value);
				prev_value = data.from;
		    }
	    });

	    var date_slider = $("#date_slider").data("ionRangeSlider");
	}else{
		var removeLoc = [];
		for(i=0; i<locations.length; i++){

			$( ".remove_city_btn" ).button({
				icons: {
					primary: "ui-icon-close"
				},
					text: false
			});

			removeLoc[i] = false;

			$( "#"+i+"_removebutton" ).click(
				function(index) {
     			return function() {
					removeLoc[index] = true;
					$( "#"+index+"_removebutton" ).data('clicked', true);
				}
			}(i));

			$( "#city_"+i ).click(function(index) {
     			return function() {
					if(removeLoc[index]){
						removeLocationCookie(locations[index]);

						$("#city_"+index).remove();

						top_scene.remove( locations[index].marker );
						top_scene.remove( locations[index].sprite );
					}else 
					  animateCameraToLocation(this.id.replace('city_',''));
				}
			}(i));
		}
	}
	
	var expanded = false;
	$( '#expand_locations' ).click(function(){
		if(expanded == true){

			$("#expand_locations").removeClass("fa fa-angle-up");
		    $("#expand_locations").addClass("fa fa-angle-down");  

			$('#locations').animate({
				height: "0px",
				opacity: 0
			}, 1000, function() {
				expanded = false;
			});
		}else{  

			$("#expand_locations").removeClass("fa fa-angle-down");
		    $("#expand_locations").addClass("fa fa-angle-up");

			$('#locations').animate({
				height: "500px",
				opacity: 1
			}, 1000, function() {
				expanded = true;
			});
		}
	});

	$( "#playicon" ).button({
    });

	$( '#playicon' ).click(function(){
		if(play == true){
			$('#playicon').removeClass("fa fa-pause");
    		$('#playicon').addClass("fa fa-play");   
			play = false;
		}else{   
			$('#playicon').removeClass("fa fa-play");
    		$('#playicon').addClass("fa fa-pause"); 		    
			play = true; 
			playSlider();
		}
	});

	var prev_value = 0;
	function playSlider(){
		if(play){
			var val = parseInt($("#date_slider")[0].value)+1;
			console.log(val)
			date_slider.update({
				from: val,
			});

			animateToTime(val, prev_value);
			prev_value = val;

			if(val==34){
				play=false;
			}

			setTimeout(function(){ playSlider(); }, 1000);
		}
	}

	
	document.addEventListener('mousemove', function(event){
		mouse.x = (event.clientX / window.innerWidth ) - 0.5
		mouse.y = (event.clientY / window.innerHeight) - 0.5
	}, false)
}

function onDocumentTouchStart( event ) {
	
	event.preventDefault();
	
	event.clientX = event.touches[0].clientX;
	event.clientY = event.touches[0].clientY;
	onDocumentMouseDown( event );

}	

function onDocumentMouseDown( event ) {

	// event.preventDefault();

	mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( location_sprites );

	if ( intersects.length > 0 && allowClick ) {
		var min_dist = 100;
		var index = null;
		for(i=0; i<intersects.length; i++){
			if(intersects[i].distance < min_dist && intersects[i].distance < 1.5){
				index = intersects[i].object.index;
				min_dist = intersects[i].distance;
			}
		}
		if(index != null)
			animateCameraToLocation(index);
		//TweenLite.to(camera.position, 1, { x:intersects[0].point.x, y:intersects[0].point.y, z:intersects[0].point.z });
		//camera.up = new THREE.Vector3(0,0,1);
		//camera.lookAt(intersects[0].point);
		//camera.position.x = 500
		// intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );

		// var particle = new THREE.Sprite( particleMaterial );
		// particle.position.copy( intersects[ 0 ].point );
		// particle.scale.x = particle.scale.y = 16;
		// scene.add( particle );

	}
}