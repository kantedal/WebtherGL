var cityImages;
var dates_id = ["date1","date2","date3","date4","date5","date6","date7","date8","date9","date10","date11","date12","date13","date14","date15","date16","date17","date18","date19","date20","date21","date22","date23","date24","date25","date26","date27","date28","date29","date30","date31"];
var forecastDayIndex = [];

function fadeCityImage(src){
	$( "#background_city" ).hide();
	$('#background_city').attr('src', src).load(function() {				     
		$( "#background_city" ).fadeIn( "slow" );
	});
}

$(function() {
	$( ".back_btn" ).button({
	});

	$( ".back_btn" ).button().click(function(){
		backToMap();
	});

	var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=81ed795daef53f2cd2ebec9f77adc2ce&text="+locations[currentIndex].name+"&sort=relevance&extras=url_o, url_l";
	var index = Math.floor(Math.random() * 3);
	$.getJSON(url + "&format=json&jsoncallback=?", function(data){
		if(locations[currentIndex].name == "Göteborg")
			fadeCityImage(data.photos.photo[0].url_l);
		// else if(locations[currentIndex].name == "Norrköping")
		// 	fadeCityImage(data.photos.photo[12].url_o);
		else if(locations[currentIndex].name == "Växjö")
			fadeCityImage(data.photos.photo[8].url_l);
		else if(locations[currentIndex].name == "Kalmar")
			fadeCityImage(data.photos.photo[2].url_l);
		else
		{
		    $.each(data.photos.photo, function(i,item){
		     	if(item.url_l){
		    		if(item.width_l < item.height_l && item.width_l < item.height_l*2) {
				        fadeCityImage(data.photos.photo[i].url_l);
				        return false;
		    		}
		    	}
		    });
		}
	});

	createCityWeather();
});

function expandForecastbox(index){
	if($("#"+dates_id[index]+"_expandbtn" ).attr('class') == "fa fa-angle-down"){

		for(i=0; i<10; i++){
			if($("#"+dates_id[i]+"_expandbtn" ).attr('class') == "fa fa-angle-up"){
				$("#"+dates_id[i]+"_expandbtn").removeClass("fa fa-angle-up");
		    	$("#"+dates_id[i]+"_expandbtn").addClass("fa fa-angle-down");  

		    	$("#"+dates_id[i]+"_sliderdiv").fadeOut("slow", (function(sliderIndex) {
					return function(data) {
					    $("#"+dates_id[sliderIndex]+"_sliderdiv").remove();
					}
				}(i)));

		    	$("#"+dates_id[i]+"_forecastbox" ).animate({
					height: "70px"
					}, 1000, function() {
					// Animation complete.
				}); 
			}
		}

		$("#"+dates_id[index]+"_expandbtn").removeClass("fa fa-angle-down");
    	$("#"+dates_id[index]+"_expandbtn").addClass("fa fa-angle-up");   

    	$("#"+dates_id[index]+"_forecastbox").append(
    		"<div class='forecast_box_slider' id='"+dates_id[index]+"_sliderdiv'>"+
    		"<input type='text' class='forecast_slider' id='"+dates_id[index]+"_slider'"+" name='example_name' value='' />"+
    		"</div>"
    	);  

    	var todayDate = new Date(locations[currentIndex].weatherData.timeseries[forecastDayIndex[index]].validTime);
    	var currentValues = [];
    	var currentDates = [];
    	var sliderStartVal = 0;
    	for(i=0; i<locations[currentIndex].weatherData.timeseries.length; i++){
    		var date = new Date(locations[currentIndex].weatherData.timeseries[i].validTime);
   
    		if(date.getUTCDate()== todayDate.getUTCDate()){
    			currentValues.push(locations[currentIndex].weatherData.timeseries[i]);
    			currentDates.push(date);
    			if(date.getUTCHours() == 12)
    				sliderStartVal = currentValues.length-1;
    		}
    	}

    	var grid_num = (currentDates.length-1)/2
    	if(grid_num <= 4)
    		grid_num = currentDates.length-1;

    	$("#"+dates_id[index]+"_slider").ionRangeSlider({
		    hide_min_max: true,
		    keyboard: true,
		    min: 0,
		    max: currentDates.length-1,
		    step: 1,
		    from: sliderStartVal,
		    grid_num: grid_num,
		    type: 'single',
		    grid: true,
		    prettify: function (num) {
		    	var date = new Date(currentDates[num]);
		    	return formatNum(date.getUTCHours())+":"+formatNum(date.getUTCMinutes());
		    },
		    onChange: function (data) {
		    	$("#"+dates_id[index]+"_temp").html(currentValues[data.from].t.toFixed(1)+ "°C");
		    	$("#"+dates_id[index]+"_weatherimg").css('background-image', 'url(' + getIcon(currentValues[data.from]).src + ')');
		    	$("#"+dates_id[index]+"_vind").html(currentValues[data.from].ws.toFixed(1) + "m/s");
				$("#"+dates_id[index]+"_rain").html(currentValues[data.from].pit + "mm/h");
		    }
		});

		$(".irs-with-grid").width("88%");
    	$(".irs-with-grid").css("margin-right","6%");
    	$(".irs-with-grid").css("margin-left","6%");

		$(".irs-with-grid").hide();
		$(".irs-with-grid").fadeIn("slow");

		$("#"+dates_id[index]+"_forecastbox" ).animate({
			height: "154px"
			}, 1000, function() {
			// Animation complete.
		});
	}else{
		$("#"+dates_id[index]+"_sliderdiv").fadeOut( function() {
		    $("#"+dates_id[index]+"_sliderdiv").remove();
		});

		$("#"+dates_id[index]+"_expandbtn").removeClass("fa fa-angle-up");
    	$("#"+dates_id[index]+"_expandbtn").addClass("fa fa-angle-down");  

    	$("#"+dates_id[index]+"_forecastbox" ).animate({
			height: "70px"
			}, 1000, function() {
			// Animation complete.
		}); 
	}
}

function createCityWeather(){
	$("#city_header").html(locations[currentIndex].name);

	for(i=0; i<locations[currentIndex].weatherData.timeseries.length; i++){
		var date = new Date(locations[currentIndex].weatherData.timeseries[i].validTime);
		if(date.getUTCHours()==12)
			forecastDayIndex.push(i); 
	}

	var currentWindow = "#forecast_window_left";
	for(i=0; i<10; i++){
		$.get("forecast_box.html", (function(index) {
			return function(data) {
				if(index>=5)
					currentWindow = "#forecast_window_right";

				var date = new Date( locations[currentIndex].weatherData.timeseries[forecastDayIndex[index]].validTime );
				
				data = data.replace('forecast_box_id', dates_id[index]+"_forecastbox");
				data = data.replace('calendar_img', dates_id[date.getDate()-1]+"_icon");
				data = data.replace('temperature_id', dates_id[index]+"_temp");
				data = data.replace('vind_id', dates_id[index]+"_vind");
				data = data.replace('weather_img', dates_id[index]+"_weatherimg");
				data = data.replace('rain_id', dates_id[index]+"_rain");
				data = data.replace('weekday_id', dates_id[index]+"_weekday");
				data = data.replace('expand_forecast', dates_id[index]+"_expandbtn");
				$(currentWindow).append(data);

				$("#"+dates_id[index]+"_temp").html(locations[currentIndex].weatherData.timeseries[forecastDayIndex[index]].t.toFixed(1) + "°C");
				$("#"+dates_id[index]+"_vind").html(locations[currentIndex].weatherData.timeseries[forecastDayIndex[index]].ws.toFixed(1) + "m/s");
				$("#"+dates_id[index]+"_rain").html(locations[currentIndex].weatherData.timeseries[forecastDayIndex[index]].pit + "mm/h");
				$("#"+dates_id[index]+"_weatherimg").css('background-image', 'url(' + getIcon(locations[currentIndex].weatherData.timeseries[index]).src + ')');
				$("#"+dates_id[index]+"_weekday").html(weekDay(date.getUTCDay()));

				$("#"+dates_id[index]+"_expandbtn").click(function(){
					expandForecastbox(index);
				});
			}
			}(i)));
		}

	// function checkDay(num)
	// {

	// if(num > 6)
	// {
	// 	var temp = num-7;
	// 	return temp;
	// }
	// else
	// {
	// 	return num;
	// }
	// }

	function weekDay(number)
	{
		var day;
		switch (number) {
	    case 0:
	        day = "Söndag";
	        break;
	    case 1:
	        day = "Måndag";
	        break;
	    case 2:
	        day = "Tisdag";
	        break;
	    case 3:
	        day = "Onsdag";
	        break;
	    case 4:
	        day = "Torsdag";
	        break;
	    case 5:
	        day = "Fredag";
	        break;
	    case 6:
	        day = "Lördag";
	        break;
		}
		return day;
	}
}