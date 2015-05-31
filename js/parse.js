Parse.initialize("6jaQuiblhHajMtmSPxdKbKBxbZWhvTCZcpuaacTf", "UWLQmIg4dUceDtrPv471ZT0wLGRnlK49QwSGf35r");

loadLists();

function loadLists()
{
	var Lists = Parse.Object.extend("Lists");
	var query = new Parse.Query(Lists);
	query.find({
	  success: function(results) {
	    for (var i = 0; i < results.length; i++) { 
	      var object = results[i];

	      var description = object.get('description');
	      if(description) description = description.substring(0,80)+"..";

	      var html = 
	      	'<div id="card_'+i+'" style="height:100%;">'+
		      	'<div class="box" style='+
					'"width:100%;'+
					'height:70%;'+
					'background: -moz-linear-gradient(top, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 59%, rgba(0,0,0,0.65) 100%), url('+object.get('image')._url+') no-repeat center center;'+
					'background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(0,0,0,0)), color-stop(59%,rgba(0,0,0,0)), color-stop(100%,rgba(0,0,0,0.65))), url('+object.get('image')._url+') no-repeat center center;'+
					'background: -webkit-linear-gradient(top, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 59%,rgba(0,0,0,0.65) 100%), url('+object.get('image')._url+') no-repeat center center;'+
					'background: -o-linear-gradient(top, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 59%,rgba(0,0,0,0.65) 100%), url('+object.get('image')._url+') no-repeat center center;'+
					'background: -ms-linear-gradient(top, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 59%,rgba(0,0,0,0.65) 100%), url('+object.get('image')._url+') no-repeat center center;'+
					'background: linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 59%,rgba(0,0,0,0.65) 100%), url('+object.get('image')._url+') no-repeat center center;'+
					//'background: url('+object.get('image')._url+') no-repeat center center;'+
					'background-size: 120%;'+
					'filter: url(grayscale.svg);'+
					'filter: gray; /* IE 6-9 */;'+
					'position: relative;">'+
						'<div style="color:#fff;position:absolute;bottom:0;font-size:100px;margin-left:20px;">'+
							object.get('header')	+
						'</div>'+
				'</div>'+
				'<div style="'+
					'height: 25%;'+
					'background-color: #fff;'+
					'font-size:50px;'+
					'color:#555;'+
					'padding: 20px;'+
					'-webkit-perspective: 1000;'+
					'font-weight: 300;'+
					'position: relative;">'+
						description +
				'</div>'+
			'</div>'
			'<script>'+
				'$("#card_'+i+'")'+
				  '.mouseup(function() {'+
				   	'alert( "Handler for .click() called." )'+
				  '})'+
				  '.mousedown(mouse_down('+i+'));'+
			'</script>;';

	      newListObject(html, false);
	     
	    // alert(object.id + ' - ' + object.get('playerName'));
	    }
	  },
	  error: function(error) {
	    alert("Error: " + error.code + " " + error.message);
	  }
	});
}
