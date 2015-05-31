function formatNum(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

function initSlider(dates){
	var months = ["januari","februari","mars","april","maj","juni","juli",
				  "augusti","september","oktober","november","december"]
				  
	var date = new Date(dates[0]);
	$("#date_text").html(
		date.getUTCDate()+" "+months[date.getUTCMonth()]+" "+
		formatNum(date.getUTCHours())+":"+formatNum(date.getUTCMinutes())
	);

	$( "#time_slider" ).slider({
	  min: 0,
	  max: 34
	});

	var prev_value = 0;
	$("#time_slider").on( "slide", function( event, ui ) {
		var date = new Date(dates[ui.value]);

		$("#date_text").html(
			date.getUTCDate()+" "+months[date.getUTCMonth()]+" "+
			formatNum(date.getUTCHours())+":"+formatNum(date.getUTCMinutes())
		);

		animateToTime(ui.value, prev_value);
		prev_value = ui.value;
	} );
}