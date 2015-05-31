   // standard global variables
   var container, scene, top_scene, camera, renderer, controls, stats, projector, currentTime, raycaster, clock, uiHtml, clockTime, clockDelta, allowedElements;
   var x_center, y_center;
   var keyboard = new THREEx.KeyboardState();
   var clock = new THREE.Clock();
   // custom global variables
   var cube;

   //CAMERA PARAMTERS_____

   var cameraSmoothing = {x:0, y:0};

   //_____________________

   //GENERAL PARAMETERS_____________________________________

   var Y_SCALE = 1.4;
   var x_length = 0;
   var y_length = 0;

   //________________________________________________________

   //INFO LABEL PARAMETERS___________________________________

   var INFO_STEP = 3;

   var L_MIN_X = 15;
   var L_MAX_X = 45;

   var L_MIN_Y = 1;
   var L_MAX_Y = 35;

   //________________________________________________________

   //CLOUD PARAMETERS _______________________________________
   var C_NUM = 1;

   var C_ANIM_TIME = 2.0;

   var C_STEP_X = 1;
   var C_STEP_Y = 1;

   var C_MIN_X = 7;
   var C_MAX_X = 47;

   var C_MIN_Y = 1;
   var C_MAX_Y = 25;

   var C_HEIGHT = 6;
   var C_HEIGHT_DIFF = 0.5;

   var C_OPACITY = 0.3;

   var C_SCALE = 4;
   //__________________________________________________________


   init();
   animate();

   function animateToTime(time, prev_time){
     currentTime = time;

     if(time == undefined)
       time = 0;
     
     if(allowWindField)
   	  animateWindField(time, prev_time);

     if(allowWindMap)
       updateWindMap(time);
     
     if(allowCloudSimulation){
       if(C_NUM == 3)
     	  animate3Clouds(time, prev_time);
       else(C_NUM == 1)
         animateClouds(time, prev_time);
     }

      if(allowLocations)
   	 animateTemperatures(time, prev_time);
     
     if(allowRain)
   	 changeRain(time, prev_time);
     
     if(allowTempField)
   	 updateTempField(time, prev_time);

     if(allowRainField)
      updateRainField(time);

     if(allowCloudField)
      updateCloudField(time);

     if(allowHumidtyField)
       updateHumidityField(time);

     if(allowWindSimulation)
       updateMovingWind(time);
   }

   var coordinates;
   function initVariables(field){
     coordinates = field;
     x_center = coordinates.length/2;
     y_center = coordinates[0].length/2;
     x_length = coordinates.length;
     y_length = coordinates[0].length;
     createAlphaMap();
     addInfoLabels();
   }

   function toScreenPosition(pos)
   {
       camera.updateMatrixWorld();

       var vector = new THREE.Vector3(pos.x, pos.y, 0);

       var widthHalf = 0.5*renderer.context.canvas.width;
       var heightHalf = 0.5*renderer.context.canvas.height;

       vector.project(camera);

       vector.x = ( vector.x + 1 )/2  * window.innerWidth-70;
       vector.y = - ( vector.y - 1 )/2  * window.innerHeight-25;

       return { 
           x: vector.x,
           y: vector.y
       };

   };


   var cities_canvas = [];
   var cities_context = [];
   function animateTemperatures(time, prev_time)
   {
     for (var i = 0; i < locations.length; i++) {
       var city_text = locations[i].name+" "+locations[i].weatherData.timeseries[time].t+'°C';

       var city_canvas = document.createElement('canvas');
       city_canvas.id = locations[i].name+"_temp";
       city_canvas.width = 200;
       city_canvas.height = 200;

       var city_context = city_canvas.getContext('2d');
       city_context.font="300 25px roboto, sans-serif";
       city_context.fillStyle = "#fff";
       var w = (200-city_context.measureText(city_text).width)/2;
       city_context.fillText(city_text, w, 90);

       city_context.drawImage(getIcon(locations[i].weatherData.timeseries[time]) , 40, 0, 64, 64);

       var texture = new THREE.Texture(city_canvas);
       texture.minFilter = THREE.NearestFilter;

       texture.needsUpdate = true;
       var cities_material = new THREE.SpriteMaterial( { 
         map:texture,
         color: 0xffffff,
         opacity: 0.7
       });
       locations[i].sprite.material = cities_material;

     }
   }

   var currentIndex = null;
   var allowClick = true;
   function backToMap(){
     TweenLite.to(camera.position, 1.5, {
       x:-5.89211257974753, 
       y:-48.42525909523534, 
       z:33.55380717727083, 
       onComplete:completeCameraAnim
     });
     $( "#ui" ).fadeOut( "slow", function() {
       $( "#ui" ).html(uiHtml);
       $(".irs-with-grid").width("50%");
       $(".irs-with-grid").css("margin-right","0%");
       $(".irs-with-grid").css("margin-left","0%");

         if(allowedElements.windField)
         {
            scene.add(wind_group);
            allowWindField = true;
            $('#wind_field').prop('checked', true);
         }

         if(allowedElements.windMap)
         {
            windPlane.material.opacity = 0;
            scene.add(windPlane);
            TweenLite.to(windPlane.material, 0.5, {opacity:0.7}); 
            allowWindMap = true;
            $('#wind_map').prop('checked', true);
         }

         if(allowedElements.windSim)
         {
            updateMovingWind($("#date_slider")[0].value);
            allowWindSimulation = true;
            $('#wind_sim').prop('checked', true);
         }

         if(allowedElements.clouds){
            scene.add(cloud_group);
            allowCloudSimulation = true;
            $('#cloud_sim').prop('checked', true);
         }else
            $('#cloud_sim').prop('checked', false);

         if(allowedElements.rainField)
         {
            rainPlane.material.opacity = 0;
            scene.add(rainPlane);
            TweenLite.to(rainPlane.material, 0.5, {opacity:0.7}); 
            allowRainField = true;
            $('#rain_map').prop('checked', true);
         }else
            $('#rain_map').prop('checked', false);

         if(allowedElements.cloudField)
         {
            cloudPlane.material.opacity = 0;
            scene.add(cloudPlane);
            TweenLite.to(cloudPlane.material, 0.5, {opacity:0.7}); 
            allowCloudField = true;
            $('#cloud_map').prop('checked', true);
         }      

         if(allowedElements.tempField)
         {
            tempPlane.material.opacity = 0;
            scene.add(tempPlane);
            TweenLite.to(tempPlane.material, 0.5, {opacity:0.7}); 
            allowTempField = true;
            $('#temp_map').prop('checked', true);
         }

         if(allowedElements.locations){
            allowLocations = true;
            toggleLocations(true);
            $('#temp_labels').prop('checked', true);
         }else
            $('#temp_labels').prop('checked', false);

         if(allowedElements.rain){
            top_scene.add(raindropSystem[currentTime]);
            allowRain = true;
            $('#rain_sim').prop('checked', true);
         }else
            $('#rain_sim').prop('checked', false);

         if(allowedElements.humidity){
            humidityPlane.material.opacity = 0;
            scene.add(humidityPlane);
            TweenLite.to(humidityPlane.material, 0.5, {opacity:0.7}); 
            allowHumidtyField = true;
            $('#humidity_map').prop('checked', true);
         }


       $( "#interface" ).fadeIn( "fast");
       $( "#ui" ).fadeIn( "fast", function() {
           allowLocations = true;
           toggleLocations(true);

           setTimeout(function(){ 
             animateToTime($("#date_slider")[0].value, currentTime);
             allowClick = true
             initUI(false);
           }, 500);
       });
     });
   }


   function animateCameraToLocation(index)
   {
     allowClick = false;

      uiHtml = $("#ui").html();
      $( "#interface" ).fadeOut( "slow");
      $.get( "city_ui.html", function( data ) {
         setTimeout(function(){ 
            $( "#ui" ).fadeOut( "slow", function() {
               $( "#ui" ).html( data );
               $( "#ui" ).fadeIn( "slow", function() {

               });
            });
         }, 1000);
      });

     currentIndex = index;

     allowCameraAnimation = false;
     TweenLite.to(camera.position, 1.5, {
       x:locations[index].sprite.position.x, 
       y:locations[index].sprite.position.y-6,  
       z:locations[index].sprite.position.z+5, 
     });

      allowedElements = {
         clouds: allowCloudSimulation, 
         windMap: allowWindMap, 
         windField: allowWindField,
         windSim: allowWindSimulation, 
         rainField: allowRainField, 
         cloudField: allowCloudField, 
         tempField: allowTempField, 
         rain: allowRain, 
         locations: toggleLocations,
         humidity: allowHumidtyField
      }

     setTimeout(function(){ 
        if(allowCloudSimulation){
           hideClouds();
           allowCloudSimulation = false;
         }

       if(allowWindMap){
         TweenLite.to(windPlane.material, 0.5, {opacity:0}); 
         setTimeout(function(){ scene.remove(windPlane); }, 500);

         hideInfoLabels();
         allowWindMap = false;
       }

       if(allowRainField){
         TweenLite.to(rainPlane.material, 0.5, {opacity:0}); 
         setTimeout(function(){ scene.remove(rainPlane); }, 500);

         hideInfoLabels();
         allowRainField = false;
       }

       if(allowCloudField){
         TweenLite.to(cloudPlane.material, 0.5, {opacity:0}); 
         setTimeout(function(){ scene.remove(cloudPlane); }, 500);

         hideInfoLabels();
         allowCloudField = false;
       }

       if(allowTempField){
         TweenLite.to(tempPlane.material, 0.5, {opacity:0}); 
         setTimeout(function(){ scene.remove(tempPlane); }, 500);

         hideInfoLabels();
         allowTempField = false;
       }

       if(allowWindSimulation){
         hideMovingWind()
         setTimeout(function(){ scene.remove(wind_arrow_group); }, 500);
         allowWindSimulation = false;
       }

       if(allowWindField){
         scene.remove(wind_group);
         allowWindField = false;
       }

       if(allowRain){
         TweenLite.to(raindropSystem[$("#date_slider")[0].value].material, 0.5, {opacity:0}); 
         setTimeout(function(){ scene.remove(raindropSystem[currentTime]); }, 500);
         allowRain = false;
       }

       if(allowHumidtyField){
         TweenLite.to(humidityPlane.material, 0.5, {opacity:0}); 
         setTimeout(function(){ scene.remove(humidityPlane); }, 500);

         hideInfoLabels();
         allowHumidtyField = false;
       }

       if(toggleLocations){
         allowLocations = false;
         toggleLocations(false);
       } 

     }, 700);

     $('#cloud_sim').prop('checked', false);
     $('#cloud_map').prop('checked', false);

     $('#temp_labels').prop('checked', false);
     $('#temp_map').prop('checked', false);

     $('#rain_sim').prop('checked', false);
     $('#rain_map').prop('checked', false);

     $('#wind_sim').prop('checked', false);
     $('#wind_map').prop('checked', false);
     $('#wind_field').prop('checked', false);

     $('#humidity_map').prop('checked', false);
   }

   var location_sprites = [];
   var allowLocations = true;
   function addLocations()
   {
     for (var i = 0; i < locations.length; i++) {
       locations[i].convertPos = [];
       locations[i].convertPos.x = (locations[i].lon-3)*2-x_center;
       locations[i].convertPos.y = ((locations[i].lat-53)*2-y_center)*Y_SCALE;

       var position = toScreenPosition(locations[i].convertPos);
       locations[i].x = position.x;
       locations[i].y = position.y;

       var marker_map = THREE.ImageUtils.loadTexture( "img/marker.png" );
       marker_map.minFilter = THREE.NearestFilter;
       var marker_material = new THREE.SpriteMaterial( { map:marker_map, color: 0xffffff } );

       var url = "http://opendata-download-metfcst.smhi.se/api/category/pmp2g/version/1/geopoint/lat/"+locations[i].lat+"/lon/"+locations[i].lon+"/data.json";
       $.getJSON(url,
         (function(index) {
           return function(data) {
             locations[index].weatherData = data;
             console.log(data)
             var city_text = locations[index].name+" "+locations[index].weatherData.timeseries[0].t+'°Cs';

             var city_canvas = document.createElement('canvas');
             city_canvas.fillStyle = "rgba(255, 255, 255, 0)";
             city_canvas.width = 200;
             city_canvas.height = 200;

             var city_context = city_canvas.getContext('2d');
             city_context.font="400 25px roboto, sans-serif";
             city_context.fillStyle = "#fff";
             city_context.strokeStyle = 'black';
             var w = (200-city_context.measureText(city_text).width)/2;
             city_context.fillText(city_text, w, 90);
             city_context.strokeText(city_text, w, 20);

            /// city_context.drawImage(getIcon(locations[index].weatherData.timeseries[0]), 40, 0, 64, 64);

             var texture = new THREE.Texture(city_canvas);
             texture.minFilter = THREE.NearestFilter;
             texture.needsUpdate = true;
             var cities_material = new THREE.SpriteMaterial( { 
               map:texture, 
               depthTest:false, 
               depthWrite:false, 
               color: 0xffffff,
               opacity: 0.7,
               useScreenCoordinates: false
             });

             locations[index].sprite = new THREE.Sprite(cities_material);
             locations[index].sprite.position.set(locations[index].convertPos.x, locations[index].convertPos.y,0.2);
             locations[index].sprite.scale.x = 3;
             locations[index].sprite.scale.y = 3;
             locations[index].sprite.rotation.y = 0;
             locations[index].sprite.rotation.x = 0;
             locations[index].sprite.renderDepth = 2;
             locations[index].sprite.index = index;
             top_scene.add(locations[index].sprite);  
             
             location_sprites.push(locations[index].sprite);  

             locations[index].marker = new THREE.Sprite( marker_material );
             locations[index].marker.position.x = (locations[index].lon-3)*2-x_center;
             locations[index].marker.position.y = ((locations[index].lat-53)*2-y_center)*Y_SCALE;
             locations[index].marker.position.z = 0;
             locations[index].marker.scale.x = 0.2;
             locations[index].marker.scale.y = 0.2;

             top_scene.add( locations[index].marker );

             //Lägger till platsen i sidomenyn
             var listString = "<li class='city_list' id='city_"+index+"'>"+locations[index].name
                             +'<button class="remove_city_btn" id="'+index+'_removebutton"></button></li>';

             $("#locations ul").append(listString);

             $( "#"+index+"_removebutton" ).click(function() {
               $(this).data('clicked', true);
             });

             $( "#city_"+index ).click(function() {
               if($( "#"+index+"_removebutton" ).data('clicked')){
                 removeLocationCookie(locations[index]);
                 $("#city_"+index).remove();

                 top_scene.remove( locations[index].marker );
                 top_scene.remove( locations[index].sprite );

               }else 
                 animateCameraToLocation(this.id.replace('city_',''));

             });

             $( ".remove_city_btn" ).button({
               icons: {
                 primary: "ui-icon-close"
               },
               text: false
             });

            };
         }(i))
       );  
     }
   }

   function addLocation(i)
   {
     $("#listitems").html(""); 
     addLocationParse(locations[i]);

     locations[i].convertPos = [];
     locations[i].convertPos.x = (locations[i].lon-3)*2-x_center;
     locations[i].convertPos.y = ((locations[i].lat-53)*2-y_center)*Y_SCALE;

     var position = toScreenPosition(locations[i].convertPos);
     locations[i].x = position.x;
     locations[i].y = position.y;

     var marker_map = THREE.ImageUtils.loadTexture( "img/marker.png" );
     marker_map.minFilter = THREE.NearestFilter;
     var marker_material = new THREE.SpriteMaterial( { map:marker_map, color: 0xffffff } );

     var url = "http://opendata-download-metfcst.smhi.se/api/category/pmp2g/version/1/geopoint/lat/"+locations[i].lat+"/lon/"+locations[i].lon+"/data.json";
     $.getJSON(url,
       (function(index) {
         return function(data) {
           locations[index].weatherData = data;

             var city_text = locations[index].name+" "+locations[index].weatherData.timeseries[0].t+'°C';

             var city_canvas = document.createElement('canvas');
             city_canvas.fillStyle = "rgba(255, 255, 255, 0)";
             city_canvas.width = 200;
             city_canvas.height = 200;

             var city_context = city_canvas.getContext('2d');
             city_context.font="300 25px roboto, sans-serif";
             city_context.fillStyle = "#fff";
             var w = (200-city_context.measureText(city_text).width)/2;
             city_context.fillText(city_text, w, 90);

             city_context.drawImage(getIcon(locations[index].weatherData.timeseries[0]), 40, 0, 64, 64);

             var texture = new THREE.Texture(city_canvas);
             texture.minFilter = THREE.NearestFilter;
             texture.needsUpdate = true;
             var cities_material = new THREE.SpriteMaterial( { 
               map:texture, 
               depthTest:false, 
               depthWrite:false, 
               color: 0xffffff,
               opacity: 0.7,
               useScreenCoordinates: false
             });

             locations[index].sprite = new THREE.Sprite(cities_material);
             locations[index].sprite.position.set(locations[index].convertPos.x, locations[index].convertPos.y,0.2);
             locations[index].sprite.scale.x = 3;
             locations[index].sprite.scale.y = 3;
             locations[index].sprite.rotation.y = 0;
             locations[index].sprite.rotation.x = 0;
             locations[index].sprite.renderDepth = 2;
             locations[index].sprite.index = index;
             top_scene.add(locations[index].sprite);  
             
             location_sprites.push(locations[index].sprite);  

             locations[index].marker = new THREE.Sprite( marker_material );
             locations[index].marker.position.x = (locations[index].lon-3)*2-x_center;
             locations[index].marker.position.y = ((locations[index].lat-53)*2-y_center)*Y_SCALE;
             locations[index].marker.position.z = 0;
             locations[index].marker.scale.x = 0.2;
             locations[index].marker.scale.y = 0.2;

             top_scene.add( locations[index].marker );

             //Lägger till platsen i sidomenyn
             var listString = "<li class='city_list' id='city_"+index+"'>"+locations[index].name
                             +'<button class="remove_city_btn" id="'+index+'_removebutton"></button></li>';

             $("#locations ul").append(listString);

             $( "#"+index+"_removebutton" ).click(function() {
               $(this).data('clicked', true);
             });

             $( "#city_"+index ).click(function() {
               if($( "#"+index+"_removebutton" ).data('clicked')){
                 removeLocationCookie(locations[index]);
                 $("#city_"+index).remove();

                 top_scene.remove( locations[index].marker );
                 top_scene.remove( locations[index].sprite );
                 
               }else 
                 animateCameraToLocation(this.id.replace('city_',''));

             });

             $( ".remove_city_btn" ).button({
               icons: {
                 primary: "ui-icon-close"
               },
               text: false
             });

            };
          
       }(i))
     );
   }

   function toggleLocations(opacity){
     for (var i = 0; i < locations.length; i++) {
       TweenLite.to(locations[i].sprite.material, 0.5, {opacity:opacity/1.5}); 
       TweenLite.to(locations[i].marker.material, 0.5, {opacity:opacity/1.5}); 
     }
   }


   function getIcon(data)
   {

     switch(data.pcat){
       case 0:
         if(data.tcc_mean < 1)
           return icons.sunny;
         else if(data.tcc_mean < 3 )
           return icons.cloudy1;
         else if(data.tcc_mean < 5 )
           return icons.cloudy2;
         else if(data.tcc_mean < 7 )
           return icons.cloudy3;
         else if(data.tcc_mean < 8 )
           return icons.cloudy4;
         else
           return icons.cloudy5;
       break;

       case 3:
         if(data.tcc_mean == 8 && data.pit < 2)
           return icons.drizzle;
         else if(data.tcc_mean == 8)
           return icons.rainy3;
         else if(data.pit < 0.5 )
           return icons.rainy1;
         else
           return icons.rainy2;
       break;

       case 2:
         return icons.snowrain;
       break;

       case 1:
         if(data.pis < 0.5 && data.pis == 8)
           return icons.snowy4;
         else if(data.pis == 8)
           return icons.snowy5;
         else if(data.pis < 0.5)
           return icons.snowy1;
         else if(data.pis < 1)
           return icons.snowy2;
         else
           return icons.snowy3;
       break;

       case 4:
         return icons.drizzle;
       break;

       case 5:
         return icons.hail;
       break;

       case 6:
         return icons.hail;
       break;
     }
   }


    var cloud_mesh;
    var cloudField;
    var cloud_group;
    var allowCloudSimulation = false;
    //Funktioner för molnfält
   function createClouds(cloud)
   {
     cloudField = cloud;
     cloud_group = new THREE.Object3D();

     x_middle = cloud[0].length/2;
     y_middle = cloud[0][0].length/2;

     var cloud_map = THREE.ImageUtils.loadTexture( "img/cloud_2.png" );
     cloud_map.minFilter = THREE.NearestFilter;

     cloud_mesh = new Array(cloudField[0].length);
     for(x=C_MIN_X; x<C_MAX_X; x=x+C_STEP_X){
       cloud_mesh[x] = new Array(cloudField[1].length);
        for(y=C_MIN_Y; y<C_MAX_Y; y=y+C_STEP_Y){

           var material = new THREE.SpriteMaterial( { 
             map:cloud_map, 
             color: 0xffffff, 
             depthTest: false,
             depthWrite: true,
             rotation: Math.random()*Math.PI*2,
             useScreenCoordinates: true
           });
           cloud_mesh[x][y] = new THREE.Sprite( material );

           cloud_mesh[x][y].position.x = x - x_middle + Math.random()*0.5-0.5;
           cloud_mesh[x][y].position.y = (y - y_middle + Math.random()*0.5-0.5)*Y_SCALE;
           cloud_mesh[x][y].position.z = Math.random()*2-2+C_HEIGHT;
           cloud_mesh[x][y].material.opacity = 0;
           cloud_mesh[x][y].spin = (Math.random()-0.5)*0.015;

           if( cloudField[0][x][y] > 2){
             var scale = cloudField[0][x][y]/8*C_SCALE;
             cloud_mesh[x][y].scale.x = scale;
             cloud_mesh[x][y].scale.y = scale;
           }else{
             cloud_mesh[x][y].scale = 0.001;
           }
           
           cloud_group.add( cloud_mesh[x][y] );
       }
     }
     scene.add( cloud_group );
     allowCloudSimulation = true;

    // setTimeout(function(){ animateToTime(0, 0); }, 500);
     
   }

   function hideClouds()
   {
     for(x=C_MIN_X; x<C_MAX_X; x=x+C_STEP_X){
       for(y=C_MIN_Y; y<C_MAX_Y; y=y+C_STEP_Y){
         TweenLite.to(cloud_mesh[x][y].material, 0.5, {opacity:0}); 
       }
     }
   }

   function animateClouds(time, prev_time)
   {
     var x_middle = cloudField[0].length/2;
     var y_middle = cloudField[0][0].length/2;
     
     for(x=C_MIN_X; x<C_MAX_X; x=x+C_STEP_X){
       for(y=C_MIN_Y; y<C_MAX_Y; y=y+C_STEP_Y){

         if(cloudField[time][x][y] > 1){

           var opacity = Math.pow(cloudField[time][x][y]/8, 3)*C_OPACITY
           var scale = cloudField[time][x][y]/8*C_SCALE;

           
           if(x > C_MAX_X-5){
             TweenLite.to(cloud_mesh[x][y].scale, C_ANIM_TIME, {x:scale,y:scale}); 
             TweenLite.to(cloud_mesh[x][y].material, C_ANIM_TIME, {opacity:opacity*((C_MAX_X-x)*0.2) }); 
           }else if(x-C_MIN_X < 5){
             TweenLite.to(cloud_mesh[x][y].scale, C_ANIM_TIME, {x:scale,y:scale}); 
             TweenLite.to(cloud_mesh[x][y].material, C_ANIM_TIME, {opacity:opacity*(x-C_MIN_X)*0.2 }); 
           }else{
              	if(Math.abs(cloud_mesh[x][y].material.opacity-opacity) > 0.1){
            		TweenLite.to(cloud_mesh[x][y].scale, C_ANIM_TIME, {x:scale,y:scale}); 
            		TweenLite.to(cloud_mesh[x][y].material, C_ANIM_TIME, {opacity:opacity}); 
               }
           }
         }else if(Math.abs(cloud_mesh[x][y].material.opacity-opacity) > 0.1){
           cloud_mesh[x][y].scale = 0.001;
           TweenLite.to(cloud_mesh[x][y].material, C_ANIM_TIME, {opacity:0}); 
         }

       }
     }
   }

   function create3Clouds(cloud)
   {

     cloudField = cloud;
     cloud_group = new THREE.Object3D();

     x_middle = cloud[0].length/2;
     y_middle = cloud[0][0].length/2;

     var cloud_map = THREE.ImageUtils.loadTexture( "img/cloud_2.png" );
     cloud_map.minFilter = THREE.NearestFilter;
   	

     cloud_mesh = new Array(cloudField[0].length);
     for(x=C_MIN_X; x<C_MAX_X; x=x+C_STEP_X){
       cloud_mesh[x] = new Array(cloudField[1].length);
        for(y=C_MIN_Y; y<C_MAX_Y; y=y+C_STEP_Y){
         cloud_mesh[x][y] = new Array(3);
         for(h=0; h<3; h=h+1){
           var material = new THREE.SpriteMaterial( { 
             map:cloud_map, 
             color: 0xffffff, 
             depthTest: false,
             rotation: Math.random()*Math.PI*2 
           });
           cloud_mesh[x][y][h] = new THREE.Sprite( material );

           cloud_mesh[x][y][h].position.x = x - x_middle + Math.random()*0.5-0.5;
           cloud_mesh[x][y][h].position.y = (y - y_middle + Math.random()*0.5-0.5)*Y_SCALE;

           switch(h){
             case 0:
               cloud_mesh[x][y][h].position.z = C_HEIGHT;
   			//Math.random()*0.5-0.5;
             break;
             case 1:
               cloud_mesh[x][y][h].position.z = C_HEIGHT + C_HEIGHT_DIFF;
             break;
             case 2:
               cloud_mesh[x][y][h].position.z = C_HEIGHT + 2*C_HEIGHT_DIFF;
             break;
           }

           cloud_mesh[x][y][h].material.opacity = 0;
           cloud_mesh[x][y][h].spin = (Math.random()-0.5)*0.015;

           if( cloudField[0][x][y] && cloudField[0][x][y][h] > 3){
             var scale = cloudField[0][x][y][h]/8*C_SCALE;
             cloud_mesh[x][y][h].scale.x = scale;
             cloud_mesh[x][y][h].scale.y = scale;
             TweenLite.to(cloud_mesh[x][y][h].material, 1.5, {opacity: Math.pow(cloudField[0][x][y][h]/8, 4)*C_OPACITY }); 
           }else{
             cloud_mesh[x][y][h].scale = 0.001;
             cloud_mesh[x][y][h].material.opacity = 0;          
           }

           cloud_group.add( cloud_mesh[x][y][h] );
         }
       }
     }
     scene.add( cloud_group );
   }

   function animate3Clouds(time, prev_time)
   {

     var x_middle = cloudField[0].length/2;
     var y_middle = cloudField[0][0].length/2;

     for(x=C_MIN_X; x<C_MAX_X; x=x+C_STEP_X){
       for(y=C_MIN_Y; y<C_MAX_Y; y=y+C_STEP_Y){
         for(h=0; h<3; h=h+1){
           if(cloudField[0][x][y] && cloudField[time][x][y][h] > 3){

             var opacity = Math.pow(cloudField[time][x][y][h]/8, 4)*C_OPACITY; 
             var scale = cloudField[time][x][y][h]/8*C_SCALE;

             if(x > C_MAX_X-10){
             TweenLite.to(cloud_mesh[x][y][h].scale, C_ANIM_TIME, {x:scale,y:scale}); 
             TweenLite.to(cloud_mesh[x][y][h].material, C_ANIM_TIME, {opacity:opacity*((C_MAX_X-x)*0.1) }); 
           }else if(x-C_MIN_X < 10){
             TweenLite.to(cloud_mesh[x][y][h].scale, C_ANIM_TIME, {x:scale,y:scale}); 
             TweenLite.to(cloud_mesh[x][y][h].material, C_ANIM_TIME, {opacity:opacity*(x-C_MIN_X)*0.1 }); 
           }else{
             TweenLite.to(cloud_mesh[x][y][h].scale, C_ANIM_TIME, {x:scale,y:scale}); 
             TweenLite.to(cloud_mesh[x][y][h].material, C_ANIM_TIME, {opacity:opacity}); 
           }
           }else{
             cloud_mesh[x][y][h].scale = 0.001;
             TweenLite.to(cloud_mesh[x][y][h].material, C_ANIM_TIME, {opacity:0}); 
           }
         }
       }
     }
   }

   var cloudColorScale;
   var cloudPlane;
   var allowCloudField = false;
   function createCloudField()
   {
     var cloudFieldGeometry = new THREE.PlaneGeometry( x_length-1, y_length, x_length-1, y_length);
     cloudColorScale = chroma.scale(['black', 'white']);
     
     var x = 0;
     var y = 0;

     for(i=0; i<cloudFieldGeometry.faces.length; i++){

       if(x == 70){
         x = 0;
         y=y+1;      
       }
       else if(!(i % 2)){
         x=x+1;
       }


       cloudFieldGeometry.faces[i].vertexColors[0] = new THREE.Color( 0xff0000 );
       cloudFieldGeometry.faces[i].vertexColors[1] = new THREE.Color( 0xff0000 );
       cloudFieldGeometry.faces[i].vertexColors[2] = new THREE.Color( 0xff0000 );
         
       if(x < 6 || x > 60 || y < 1 || y > 33){
         cloudFieldGeometry.faces[i].vertexColors[0].setRGB(0,0,0);
         cloudFieldGeometry.faces[i].vertexColors[1].setRGB(0,0,0);
         cloudFieldGeometry.faces[i].vertexColors[2].setRGB(0,0,0);
       }
       else if(!(i % 2)){
         var color1 = cloudColorScale.mode('rgb')(cloudField[0][x][y_length-y]/12);
         cloudFieldGeometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = cloudColorScale.mode('rgb')(cloudField[0][x][y_length-y-1]/12);
         cloudFieldGeometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = cloudColorScale.mode('rgb')(cloudField[0][x+1][y_length-y]/12);
         cloudFieldGeometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
       else{
         var color1 = cloudColorScale.mode('rgb')(cloudField[0][x][y_length-y-1]/12);
         cloudFieldGeometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = cloudColorScale.mode('rgb')(cloudField[0][x+1][y_length-y-1]/12);
         cloudFieldGeometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = cloudColorScale.mode('rgb')(cloudField[0][x+1][y_length-y]/12);
         cloudFieldGeometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
     }

     var material = new THREE.MeshBasicMaterial({vertexColors:THREE.VertexColors, transparent: true, opacity: 0.6, depthWrite: false, depthTest: false}); 
     cloudPlane = new THREE.Mesh( cloudFieldGeometry, material );
     cloudPlane.scale.y = Y_SCALE;
   }

   function updateCloudField(time){

     cloudPlane.geometry.colorsNeedUpdate = true;
     //tempPlane.geometry.faces[1].vertexColors[0] = new THREE.Color( Math.random(),Math.random(),Math.random() );

     var x = 0;
     var y = 0;
     for(i=0; i<cloudPlane.geometry.faces.length; i++){

       if(x == 70){
         x = 0;
         y=y+1;      
       }
       else if(!(i % 2)){
         x=x+1;
       }

       cloudPlane.geometry.faces[i].vertexColors[0] = new THREE.Color( 0xff0000 );
       cloudPlane.geometry.faces[i].vertexColors[1] = new THREE.Color( 0xff0000 );
       cloudPlane.geometry.faces[i].vertexColors[2] = new THREE.Color( 0xff0000 );
         
       if(x < 6 || x > 60 || y < 1 || y > 33){
         cloudPlane.geometry.faces[i].vertexColors[0].setRGB(0,0,0);
         cloudPlane.geometry.faces[i].vertexColors[1].setRGB(0,0,0);
         cloudPlane.geometry.faces[i].vertexColors[2].setRGB(0,0,0);
       }
       else if(!(i % 2)){
         var color1 = cloudColorScale.mode('rgb')(cloudField[time][x][y_length-y]/20);
         cloudPlane.geometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = cloudColorScale.mode('rgb')(cloudField[time][x][y_length-y-1]/20);
         cloudPlane.geometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = cloudColorScale.mode('rgb')(cloudField[time][x+1][y_length-y]/20);
         cloudPlane.geometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
       else{
         var color1 = cloudColorScale.mode('rgb')(cloudField[time][x][y_length-y-1]/20);
         cloudPlane.geometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = cloudColorScale.mode('rgb')(cloudField[time][x+1][y_length-y-1]/20);
         cloudPlane.geometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = cloudColorScale.mode('rgb')(cloudField[time][x+1][y_length-y]/20);
         cloudPlane.geometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
     } 
   }

   //_____________________________________________________________________


   //Funktioner för regn _________________________________________________
   var rainField;
   var raindrops = [];
   var raindropSystem = [];
   var rainCount = [];
   var rainMaterial = [];
   function createRain(rain){
     rainField = rain;

     for(time=0; time<rainField[0][0].length; time++){
       rainCount[time] = 0;
       raindrops[time] = new THREE.Geometry;
     }

     for(x=C_MIN_X+5; x<C_MAX_X-5; x=x+C_STEP_X){
       for(y=C_MIN_Y+5; y<C_MAX_Y-5; y=y+C_STEP_Y){
         for(time=0; time<rainField[0][0].length; time++){ 
           var particleCount = 0;
           if(rainField[time][x][y] > 0.4)
             particleCount = rainField[time][x][y]*2;

           for(r=0; r<particleCount; r++){
             var pX = x - x_center + (Math.random()-1),
             pY = y - y_center + (Math.random()-1),
             pZ = Math.random()*(3),

             particle = new THREE.Vector3(pX, pY*Y_SCALE, pZ);
             particle.velocity = {};
             particle.velocity.z = 0;
             raindrops[time].vertices.push(particle);

             rainCount[time]++;
           }
         }
       }
     }

     for(time=0; time<rainField[0][0].length; time++){

       texture = THREE.ImageUtils.loadTexture( "img/raindrop2.png" );
       texture.minFilter = THREE.NearestFilter;

       rainMaterial[time] = new THREE.PointCloudMaterial({
         color: 0xFFFFFF,
         size: 0.4,
         map: texture,
         blending: THREE.AdditiveBlending,
         depthTest: false,
         transparent: true
       });
       raindropSystem[time] = new THREE.PointCloud(raindrops[time], rainMaterial[time]);
       if(time!=0)
         raindropSystem[time].material.opacity = 0;
     }

     raindropSystem[0].material.opacity = 0.2
     top_scene.add(raindropSystem[0]);
   }

   var allowRain = true;
   function changeRain(time, prev_time){
     if(allowRain){
       TweenLite.to(raindropSystem[prev_time].material, 1, {opacity:0, onComplete:removeSystem}); 
       top_scene.add(raindropSystem[time]);
       TweenLite.to(raindropSystem[time].material, 1, {opacity:0.2});
     }

     function removeSystem(){
       top_scene.remove(raindropSystem[prev_time]);
     } 
   }

   function simulateRain(){
     var rCount = rainCount[currentTime];
     while (rCount--) {
       var particle = raindrops[currentTime].vertices[rCount];

       if (particle.z < 0) {
         particle.z = 3-1;
         particle.velocity.z = 0;
       }

       particle.velocity.z -= Math.random() * .005;
       particle.z += particle.velocity.z;
     }

     raindrops[currentTime].verticesNeedUpdate = true;
   };

   var rainColorScale;
   var rainPlane;
   var allowRainField = true;
   function createRainField()
   {
     var rainFieldGeometry = new THREE.PlaneGeometry( x_length-1, y_length, x_length-1, y_length);
     rainColorScale = chroma.scale(['black','darkblue', 'blue']);
     
     var x = 0;
     var y = 0;

     for(i=0; i<rainFieldGeometry.faces.length; i++){

       if(x == 70){
         x = 0;
         y=y+1;      
       }
       else if(!(i % 2)){
         x=x+1;
       }

       rainFieldGeometry.faces[i].vertexColors[0] = new THREE.Color( 0xff0000 );
       rainFieldGeometry.faces[i].vertexColors[1] = new THREE.Color( 0xff0000 );
       rainFieldGeometry.faces[i].vertexColors[2] = new THREE.Color( 0xff0000 );
         
       if(x < 6 || x > 60 || y < 1 || y > 33){
         rainFieldGeometry.faces[i].vertexColors[0].setRGB(0,0,0);
         rainFieldGeometry.faces[i].vertexColors[1].setRGB(0,0,0);
         rainFieldGeometry.faces[i].vertexColors[2].setRGB(0,0,0);
       }
       else if(!(i % 2)){
         var color1 = rainColorScale.mode('rgb')(rainField[0][x][y_length-y]);
         rainFieldGeometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = rainColorScale.mode('rgb')(rainField[0][x][y_length-y-1]);
         rainFieldGeometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = rainColorScale.mode('rgb')(rainField[0][x+1][y_length-y]);
         rainFieldGeometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
       else{
         var color1 = rainColorScale.mode('rgb')(rainField[0][x][y_length-y-1]);
         rainFieldGeometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = rainColorScale.mode('rgb')(rainField[0][x+1][y_length-y-1]);
         rainFieldGeometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = rainColorScale.mode('rgb')(rainField[0][x+1][y_length-y]);
         rainFieldGeometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
     }

     var material = new THREE.MeshBasicMaterial({vertexColors:THREE.VertexColors, transparent: true, opacity: 0.6, depthWrite: false, depthTest: false}); 
     rainPlane = new THREE.Mesh( rainFieldGeometry, material );
     rainPlane.scale.y = Y_SCALE;

     scene.add(rainPlane)
   }

   function updateRainField(time){

     var info_index = 0;
     for(x=L_MIN_X; x<L_MAX_X; x=x+INFO_STEP){
       for(y=L_MIN_Y; y<L_MAX_Y; y=y+INFO_STEP){
         if(rainField[time][x][y] > 0.6){
           infoLabels[info_index].visible = true;
           var info_text = rainField[time][x][y]+"mm";

           var info_canvas = document.createElement('canvas');
           info_canvas.id = x+"_"+y+"_temp";
           info_canvas.width = 64;
           info_canvas.height = 64;

           var info_context = info_canvas.getContext('2d');
           info_context.font="200 20px roboto, sans-serif";
           info_context.fillStyle = "#fff";
           var w = (64-info_context.measureText(info_text).width)/2;
           info_context.fillText(info_text, w, 20);

           var texture = new THREE.Texture(info_canvas);
           texture.minFilter = THREE.NearestFilter;

           texture.needsUpdate = true;
           var info_material = new THREE.SpriteMaterial( { map:texture, color: 0xffffff } );
           infoLabels[info_index].material = info_material;
         }else if(infoLabels[info_index].material.opacity == 1){
           TweenLite.to(infoLabels[info_index].material, 0.5, {
             opacity:0
           }); 
         }
         info_index++;
       }
     }

     rainPlane.geometry.colorsNeedUpdate = true;
     //tempPlane.geometry.faces[1].vertexColors[0] = new THREE.Color( Math.random(),Math.random(),Math.random() );
     var x = 0;
     var y = 0;
     if(tempPlane){
       for(i=0; i<tempPlane.geometry.faces.length; i++){

         if(x == 70){
           x = 0;
           y=y+1;      
         }
         else if(!(i % 2)){
           x=x+1;
         }

         rainPlane.geometry.faces[i].vertexColors[0] = new THREE.Color( 0xff0000 );
         rainPlane.geometry.faces[i].vertexColors[1] = new THREE.Color( 0xff0000 );
         rainPlane.geometry.faces[i].vertexColors[2] = new THREE.Color( 0xff0000 );
           
         if(x < 6 || x > 60 || y < 1 || y > 33){
           rainPlane.geometry.faces[i].vertexColors[0].setRGB(0,0,0);
           rainPlane.geometry.faces[i].vertexColors[1].setRGB(0,0,0);
           rainPlane.geometry.faces[i].vertexColors[2].setRGB(0,0,0);
         }
         else if(!(i % 2)){
           var color1 = rainColorScale.mode('rgb')(rainField[time][x][y_length-y]);
           rainPlane.geometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

           var color2 = rainColorScale.mode('rgb')(rainField[time][x][y_length-y-1]);
           rainPlane.geometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

           var color3 = rainColorScale.mode('rgb')(rainField[time][x+1][y_length-y]);
           rainPlane.geometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
         }
         else{
           var color1 = rainColorScale.mode('rgb')(rainField[time][x][y_length-y-1]);
           rainPlane.geometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

           var color2 = rainColorScale.mode('rgb')(rainField[time][x+1][y_length-y-1]);
           rainPlane.geometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

           var color3 = rainColorScale.mode('rgb')(rainField[time][x+1][y_length-y]);
           rainPlane.geometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
         }
       }
     } 
   }

   /////

   //Funktioner för luftfuktighet__________________________________________

   var humidityColorScale;
   var humidityPlane;
   var allowHumidtyField = false;
   var humidityField;
   function createHumidityField(humidity)
   {
     humidityField = humidity;

     var humidtyFieldGeometry = new THREE.PlaneGeometry( x_length-1, y_length, x_length-1, y_length);
     humidityColorScale = chroma.scale(['black','green','yellow','red']);
     
     var x = 0;
     var y = 0;

     for(i=0; i<humidtyFieldGeometry.faces.length; i++){

       if(x == 70){
         x = 0;
         y=y+1;      
       }
       else if(!(i % 2)){
         x=x+1;
       }

       humidtyFieldGeometry.faces[i].vertexColors[0] = new THREE.Color( 0xff0000 );
       humidtyFieldGeometry.faces[i].vertexColors[1] = new THREE.Color( 0xff0000 );
       humidtyFieldGeometry.faces[i].vertexColors[2] = new THREE.Color( 0xff0000 );
         
       if(x < 6 || x > 60 || y < 1 || y > 33){
         humidtyFieldGeometry.faces[i].vertexColors[0].setRGB(0,0,0);
         humidtyFieldGeometry.faces[i].vertexColors[1].setRGB(0,0,0);
         humidtyFieldGeometry.faces[i].vertexColors[2].setRGB(0,0,0);
       }
       else if(!(i % 2)){
         var color1 = humidityColorScale.mode('rgb')(humidityField[0][x][y_length-y]/100);
         humidtyFieldGeometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = humidityColorScale.mode('rgb')(humidityField[0][x][y_length-y-1]/100);
         humidtyFieldGeometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = humidityColorScale.mode('rgb')(humidityField[0][x+1][y_length-y]/100);
         humidtyFieldGeometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
       else{
         var color1 = humidityColorScale.mode('rgb')(humidityField[0][x][y_length-y-1]/100);
         humidtyFieldGeometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = humidityColorScale.mode('rgb')(humidityField[0][x+1][y_length-y-1]/100);
         humidtyFieldGeometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = humidityColorScale.mode('rgb')(humidityField[0][x+1][y_length-y]/100);
         humidtyFieldGeometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
     }

     var material = new THREE.MeshBasicMaterial({vertexColors:THREE.VertexColors, transparent: true, opacity: 0.6, depthWrite: false, depthTest: false}); 
     humidityPlane = new THREE.Mesh( humidtyFieldGeometry, material );
     humidityPlane.scale.y = Y_SCALE;
   }

   function updateHumidityField(time)
   {
     humidityPlane.geometry.colorsNeedUpdate = true;
     var x = 0;
     var y = 0;
     for(i=0; i<humidityPlane.geometry.faces.length; i++){

       if(x == 70){
         x = 0;
         y=y+1;      
       }
       else if(!(i % 2)){
         x=x+1;
       }

       humidityPlane.geometry.faces[i].vertexColors[0] = new THREE.Color( 0xff0000 );
       humidityPlane.geometry.faces[i].vertexColors[1] = new THREE.Color( 0xff0000 );
       humidityPlane.geometry.faces[i].vertexColors[2] = new THREE.Color( 0xff0000 );
         
       if(x < 6 || x > 60 || y < 1 || y > 33){
         humidityPlane.geometry.faces[i].vertexColors[0].setRGB(0,0,0);
         humidityPlane.geometry.faces[i].vertexColors[1].setRGB(0,0,0);
         humidityPlane.geometry.faces[i].vertexColors[2].setRGB(0,0,0);
       }
       else if(!(i % 2)){
         var color1 = humidityColorScale.mode('rgb')(humidityField[time][x][y_length-y]/100);
         humidityPlane.geometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = humidityColorScale.mode('rgb')(humidityField[time][x][y_length-y-1]/100);
         humidityPlane.geometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = humidityColorScale.mode('rgb')(humidityField[time][x+1][y_length-y]/100);
         humidityPlane.geometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
       else{
         var color1 = humidityColorScale.mode('rgb')(humidityField[time][x][y_length-y-1]/100);
         humidityPlane.geometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = humidityColorScale.mode('rgb')(humidityField[time][x+1][y_length-y-1]/100);
         humidityPlane.geometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = humidityColorScale.mode('rgb')(humidityField[time][x+1][y_length-y]/100);
         humidityPlane.geometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
     } 
   }


   //______________________________________________________________________


   var border_line = [];
   var lakeborder_line = [];
   function createLand(border_data, lakes){
     var landShape = [];
     for(j=0; j<6; j++){
       var lineGeometry = new THREE.Geometry();
       landShape[j] = new THREE.Shape();
       landShape[j].moveTo( (border_data[j][0][0][0]-3)*2-x_center , ((border_data[j][0][0][1]-53)*2-y_center)*Y_SCALE ); 
       for(i=0; i<border_data[j][0].length; i++){
           landShape[j].lineTo( (border_data[j][0][i][0]-3)*2-x_center , ((border_data[j][0][i][1]-53)*2-y_center)*Y_SCALE );
           lineGeometry.vertices.push(new THREE.Vector3((border_data[j][0][i][0]-3)*2-x_center, ((border_data[j][0][i][1]-53)*2-y_center)*Y_SCALE, -0.1));
       }

       var landGeom = new THREE.ShapeGeometry( landShape[j] );
       var landMesh = new THREE.Mesh( landGeom, new THREE.MeshBasicMaterial( {color: 0x222222 }));
       landMesh.position.z = -0.1;   
     // scene.add( landMesh )

       var border_material = new THREE.LineBasicMaterial({
         color: 0x555555,
         linewidth: 0.5,
       });
       border_line[j] = new THREE.Line(lineGeometry, border_material);
       top_scene.add(border_line[j])
     }

     var lakeShape = [];
     for(l=0; l<lakes.length; l++){
       var lineGeometry = new THREE.Geometry();
       lakeShape[l] = new THREE.Shape();
       lakeShape[l].moveTo((lakes[l][0][0][0]-3)*2-x_center, ((lakes[l][0][0][1]-53)*2-y_center)*Y_SCALE) 
       for(lh=0; lh<lakes[l][0].length; lh++){
         lakeShape[l].lineTo((lakes[l][0][lh][0]-3)*2-x_center, ((lakes[l][0][lh][1]-53)*2-y_center)*Y_SCALE) 
         lineGeometry.vertices.push(new THREE.Vector3((lakes[l][0][lh][0]-3)*2-x_center, ((lakes[l][0][lh][1]-53)*2-y_center)*Y_SCALE, -0.1));
       }
       var landGeom = new THREE.ShapeGeometry( lakeShape[l] );
       var landMesh = new THREE.Mesh( landGeom, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
       landMesh.position.z = 0;   
       scene.add( landMesh );


       var border_material = new THREE.LineBasicMaterial({
         color: 0x555555,
         linewidth: 0.5,
       });
       lakeborder_line[j] = new THREE.Line(lineGeometry, border_material);
       top_scene.add(lakeborder_line[j])
     }
   }

   function createAlphaMap(){
     var alpha_map = THREE.ImageUtils.loadTexture( "img/alpha_map.png" );

     var alpha_geometry = new THREE.PlaneGeometry( x_length-1, y_length*Y_SCALE);
     var material = new THREE.MeshBasicMaterial({alphaMap: alpha_map, color: 0x000000}); 
     material.transparent = true;
     var alpha_plane = new THREE.Mesh( alpha_geometry, material );
     alpha_plane.position.z = 0.1;
     scene.add(alpha_plane);
   }



   //Funktioner för vindfält______________________________________________________________________________
   var windColorScale;
   var windPlane;
   var allowWindMap = false;
   function createWindMap()
   {
     var windFieldGeometry = new THREE.PlaneGeometry( x_length-1, y_length, x_length-1, y_length);
     windColorScale = chroma.scale(['black','black','red']);
     
     var x = 0;
     var y = 0;

     for(i=0; i<windFieldGeometry.faces.length; i++){

       if(x == 70){
         x = 0;
         y=y+1;      
       }
       else if(!(i % 2)){
         x=x+1;
       }

       windFieldGeometry.faces[i].vertexColors[0] = new THREE.Color( 0xff0000 );
       windFieldGeometry.faces[i].vertexColors[1] = new THREE.Color( 0xff0000 );
       windFieldGeometry.faces[i].vertexColors[2] = new THREE.Color( 0xff0000 );
         
       if(x < 6 || x > 60 || y < 1 || y > 33){
         windFieldGeometry.faces[i].vertexColors[0].setRGB(0,0,0);
         windFieldGeometry.faces[i].vertexColors[1].setRGB(0,0,0);
         windFieldGeometry.faces[i].vertexColors[2].setRGB(0,0,0);
       }
       else if(!(i % 2)){
         var color1 = windColorScale.mode('rgb')(wind_vectorfield[0][x][y_length-y][1]/10);
         windFieldGeometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = windColorScale.mode('rgb')(wind_vectorfield[0][x][y_length-y-1][1]/10);
         windFieldGeometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = windColorScale.mode('rgb')(wind_vectorfield[0][x+1][y_length-y][1]/10);
         windFieldGeometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
       else{
         var color1 = windColorScale.mode('rgb')(wind_vectorfield[0][x][y_length-y-1][1]/10);
         windFieldGeometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = windColorScale.mode('rgb')(wind_vectorfield[0][x+1][y_length-y-1][1]/10);
         windFieldGeometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = windColorScale.mode('rgb')(wind_vectorfield[0][x+1][y_length-y][1]/10);
         windFieldGeometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
     }

     var material = new THREE.MeshBasicMaterial({vertexColors:THREE.VertexColors, transparent: true, opacity: 0.6, depthWrite: false, depthTest: false}); 
     windPlane = new THREE.Mesh( windFieldGeometry, material );
     windPlane.scale.y = Y_SCALE;
   }

   function updateWindMap(time)
   {
     windPlane.geometry.colorsNeedUpdate = true;
     var x = 0;
     var y = 0;
     for(i=0; i<windPlane.geometry.faces.length; i++){

       if(x == 70){
         x = 0;
         y=y+1;      
       }
       else if(!(i % 2)){
         x=x+1;
       }

       windPlane.geometry.faces[i].vertexColors[0] = new THREE.Color( 0xff0000 );
       windPlane.geometry.faces[i].vertexColors[1] = new THREE.Color( 0xff0000 );
       windPlane.geometry.faces[i].vertexColors[2] = new THREE.Color( 0xff0000 );
         
       if(x < 6 || x > 60 || y < 1 || y > 33){
         windPlane.geometry.faces[i].vertexColors[0].setRGB(0,0,0);
         windPlane.geometry.faces[i].vertexColors[1].setRGB(0,0,0);
         windPlane.geometry.faces[i].vertexColors[2].setRGB(0,0,0);
       }
       else if(!(i % 2)){
         var color1 = windColorScale.mode('rgb')(wind_vectorfield[time][x][y_length-y][1]/10);
         windPlane.geometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = windColorScale.mode('rgb')(wind_vectorfield[time][x][y_length-y-1][1]/10);
         windPlane.geometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = windColorScale.mode('rgb')(wind_vectorfield[time][x+1][y_length-y][1]/10);
         windPlane.geometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
       else{
         var color1 = windColorScale.mode('rgb')(wind_vectorfield[time][x][y_length-y-1][1]/10);
         windPlane.geometry.faces[i].vertexColors[0].setRGB(color1._rgb[0]/255, color1._rgb[1]/255, color1._rgb[2]/255)

         var color2 = windColorScale.mode('rgb')(wind_vectorfield[time][x+1][y_length-y-1][1]/10);
         windPlane.geometry.faces[i].vertexColors[1].setRGB(color2._rgb[0]/255, color2._rgb[1]/255, color2._rgb[2]/255)

         var color3 = windColorScale.mode('rgb')(wind_vectorfield[time][x+1][y_length-y][1]/10);
         windPlane.geometry.faces[i].vertexColors[2].setRGB(color3._rgb[0]/255, color3._rgb[1]/255, color3._rgb[2]/255)
       }
     } 
   }


   var wind_vectorfield;
   var wind_vectors;
   var wind_group;
   var allowWindField = false;
   function createWindField(wind)
   {
     wind_vectorfield = wind;
     wind_group = new THREE.Object3D();

     var dir = new THREE.Vector3( 1, 0, 0 );
     var origin = new THREE.Vector3( 0, 0, 0 );
     var hex = 0xffffff;
     var headLength = 0.1;
     var headWidth = 0.2;

     wind_vectors = new Array(wind_vectorfield[0].length);
     for(x=10; x<wind_vectorfield[0].length-10; x=x+1){
       wind_vectors[x] = new Array(wind_vectorfield[1].length);
       for(y=1; y<wind_vectorfield[0][x].length-1; y=y+1){

         var x1 = 0;
         var x2 = 0;

         var y1 = -wind_vectorfield[0][x][y][1]*0.03;
         var y2 = wind_vectorfield[0][x][y][1]*0.03;

         var length = 0.2;
         if(wind_vectorfield[0][x][y][1] > 2)
           length = wind_vectorfield[0][x][y][1]*0.1;
         
         wind_vectors[x][y] = new THREE.ArrowHelper( dir, origin, length, hex, headLength, headWidth);
         wind_vectors[x][y].position.x = x - x_center;
         wind_vectors[x][y].position.y = (y - y_center)*Y_SCALE;
         //wind_vectors[x][y].position.z = 0;
         wind_vectors[x][y].rotation.z = (Math.PI/180)*wind_vectorfield[0][x][y][0];

         wind_group.add(wind_vectors[x][y]);
       }
     }
   }

   function animateWindField(time, prev_time)
   {
     var x_middle = wind_vectorfield[0].length/2;
     var y_middle = wind_vectorfield[0][0].length/2;

     for(x=10; x<wind_vectorfield[0].length-10; x=x+1){
       for(y=2; y<wind_vectorfield[0][x].length-2; y=y+1){
         new_angle = wind_vectorfield[time][x][y][0];
         wind_vectors[x][y].rotation.z = (Math.PI/180)*new_angle;
         var length = 0.2;
         if(wind_vectorfield[time][x][y][1] > 2)
           length = wind_vectorfield[time][x][y][1]*0.1;
         wind_vectors[x][y].setLength(length, 0.1, 0.2);
       }
     }

   }

   var wind_arrows = [];
   var wind_arrow_group;
   var allowWindSimulation = false;
   var simulationTime = 0;
   function createMovingWind(time)
   {
     simulationTime = time;
     scene.remove(wind_arrow_group);

     wind_arrow_group = new THREE.Object3D();

     var arrow_map = THREE.ImageUtils.loadTexture( "img/arrow_map.png" );
     arrow_map.minFilter = THREE.NearestFilter;

     var index = 0;
     for(x=10; x<wind_vectorfield[0].length-25; x=x+2){
       for(y=1; y<wind_vectorfield[0][x].length-5; y=y+2){
         var length = 0.2;
         if(wind_vectorfield[0][x][y][1] > 2)
           length = wind_vectorfield[time][x][y][1]*0.1;

         var material = new THREE.SpriteMaterial({ 
           map:arrow_map, 
           color: 0xffffff, 
           depthTest: false,
           depthWrite: true,
           useScreenCoordinates: false
         });
         material.polygonOffset = true;
         material.polygonOffsetFactor = -0.1;

         var geometry = new THREE.PlaneGeometry( 1, 1 );
         var material = new THREE.MeshBasicMaterial({map: arrow_map, color: 0xffffff}); 
         material.transparent = true;
         wind_arrows[index] = new THREE.Mesh( geometry, material );

         index++;
       }
     }
     scene.add(wind_arrow_group);
   }

   function hideMovingWind(){
     for(i=0; i<wind_arrows.length; i++){
        TweenLite.to(wind_arrows[i].material,0.5, {opacity:0});
     }
   }

   function updateMovingWind(time){
     var index = 0;
     simulationTime = time;
     for(x=10; x<wind_vectorfield[0].length-25; x=x+3){
       for(y=1; y<wind_vectorfield[0][x].length-5; y=y+2){
         wind_arrows[index].position.x = x - x_middle;
         wind_arrows[index].position.y = (y - y_middle)*Y_SCALE;
         wind_arrows[index].position.z = 0.3;
         wind_arrows[index].rotation.z = (Math.PI/180)*wind_vectorfield[time][x][y][0]; //time:0, xpos:x, ypos:y, [0]:vinkel, [1]:styrka
         
         wind_arrows[index].startX = x - x_middle;
         wind_arrows[index].startY = (y - y_middle)*Y_SCALE;

         wind_arrows[index].x_index = x;
         wind_arrows[index].y_index = y;

         wind_arrows[index].prevX = x - x_middle;
         wind_arrows[index].prevY = (y - y_middle)*Y_SCALE;

         wind_arrows[index].velocity = wind_vectorfield[time][x][y][1]*0.02;
         wind_arrows[index].scale.y = wind_vectorfield[time][x][y][1]*0.2;

         TweenLite.killTweensOf(wind_arrows[index].material)

         if(wind_arrows[index].velocity > 0.15){
           wind_arrows[index].material.opacity = 0;
           TweenLite.to(wind_arrows[index].material, 0.5, {opacity:1});

           wind_arrows[index].visible = true;
           wind_arrow_group.add(wind_arrows[index]);

           TweenLite.to(wind_arrows[index].material, 0.5/wind_arrows[index].velocity, {opacity:0, delay:0.5, onComplete:resetWindPosition, onCompleteParams:[index]});
         }else{
           wind_arrows[index].visible = false;
         }
         index++;
       }
     }
     scene.add(wind_arrow_group);
     // allowWindSimulation = true;
     // updateMovingWind(0);
   }

   function resetWindPosition(index)
   {
     TweenLite.to(wind_arrows[index].material, 0.5, {opacity:1});

     wind_arrows[index].position.x = wind_arrows[index].startX;
     wind_arrows[index].position.y = wind_arrows[index].startY;

     wind_arrows[index].velocity = wind_vectorfield[simulationTime][wind_arrows[index].x_index][wind_arrows[index].y_index][1]*0.02;
     wind_arrows[index].rotation.z = (Math.PI/180)*wind_vectorfield[simulationTime][wind_arrows[index].x_index][wind_arrows[index].y_index][0]; 

     TweenLite.to(wind_arrows[index].material, 0.5/wind_arrows[index].velocity, {opacity:0, delay:0.5, onComplete:resetWindPosition, onCompleteParams:[index]});
   }

   function simulateMovingWind()
   {
     var index = 0;
     for(x=10; x<wind_vectorfield[0].length-25; x=x+3){
       for(y=1; y<wind_vectorfield[0][x].length-5; y=y+2){

         if(wind_arrows[index].visible){
           wind_arrows[index].translateY(wind_arrows[index].velocity*0.1)

           var deltaX = Math.abs(wind_arrows[index].prevX - wind_arrows[index].position.x);
           var deltaY = Math.abs(wind_arrows[index].prevY - wind_arrows[index].position.y);
           if(deltaX >= 1 || deltaY >= Y_SCALE){
             var x_index = Math.round(wind_arrows[index].position.x + (x_length-1)/2);
             var y_index = Math.round(wind_arrows[index].position.y/Y_SCALE + (y_length-1)/2);

             if(x_index <= x_length/2-2 && y_index <= y_length/2-2 && x_index >= 2 && y_index >= 2 ){
               wind_arrows[index].rotation.z = (Math.PI/180)*wind_vectorfield[simulationTime][x_index][y_index][0]; 
               wind_arrows[index].velocity = wind_vectorfield[simulationTime][x_index][y_index][1]*0.02;
               wind_arrows[index].scale.y = wind_vectorfield[simulationTime][x_index][y_index][1]*0.2;
             }

             wind_arrows[index].prevX = wind_arrows[index].position.x;
             wind_arrows[index].prevY = wind_arrows[index].position.y;
           }

         }
         index++;
       }
     }
   }

   function decimalToHexString(number)
   {
       if (number < 0)
       {
         number = 0xFFFFFFFF + number + 1;
       }

       return number.toString(16).toUpperCase();
   }

   //Funktioner för temperaturfält
   //Funktioner för temperaturfält

   function getHSL(value){
     var color = [];
     color.h = (1 - value);
     color.s = 1;
     color.l = value * 0.5;

     return color;
   }


   var tempField;
   var tempColorScale;
   var tempPlane;
   var allowTempField = false;
   var h_temp, l_temp;
   function createTempField(temp)
   {
     tempField = temp;

     h_temp = -40;
     l_temp = 40;
     for(x=C_MIN_X; x<C_MAX_X; x=x+C_STEP_X){
       for(y=C_MIN_Y; y<C_MAX_Y; y=y+C_STEP_Y){

         if(tempField[0][x][y] > h_temp){
           h_temp = tempField[0][x][y];
         }

         if(tempField[0][x][y] < l_temp && tempField[0][x][y] != 0){
           l_temp = tempField[0][x][y];
         }
       }
     }

     var info_index = 0;
     for(x=L_MIN_X; x<L_MAX_X; x=x+INFO_STEP){
       for(y=L_MIN_Y; y<L_MAX_Y; y=y+INFO_STEP){
         // if(tempField[0][x][y] > h_temp-10 || tempField[0][x][y] < l_temp+5){
           infoLabels[info_index].visible = true;
           var info_text = tempField[0][x][y]+"°C";

           var info_canvas = document.createElement('canvas');
           info_canvas.id = x+"_"+y+"_temp";
           info_canvas.width = 64;
           info_canvas.height = 64;

           var info_context = info_canvas.getContext('2d');
           info_context.font="400 15px roboto, sans-serif";
           info_context.fillStyle = "#aaa";
           var w = (64-info_context.measureText(info_text).width)/2;
           info_context.fillText(info_text, w, 0);

           var texture = new THREE.Texture(info_canvas);
           texture.minFilter = THREE.NearestFilter;

           texture.needsUpdate = true;
           var info_material = new THREE.SpriteMaterial( { map:texture, color: 0xffffff } );
           infoLabels[info_index].material = info_material;
         // }else if(infoLabels[info_index].material.opacity == 1){
         //   TweenLite.to(infoLabels[info_index].material, 0.5, {
         //     opacity:0
         //   }); 
         // }
         info_index++;
       }
     }

     var tempFieldGeometry = new THREE.PlaneGeometry( x_length-1, y_length, x_length-1, y_length);
     tempColorScale = chroma.interpolate.bezier(['blue', 'yellow', 'red']);
     
     var x = 0;
     var y = 0;

     for(i=0; i<tempFieldGeometry.faces.length; i++){

       if(x == 70){
         x = 0;
         y=y+1;      
       }
       else if(!(i % 2)){
         x=x+1;
       }


       tempFieldGeometry.faces[i].vertexColors[0] = new THREE.Color( 0xff0000 );
       tempFieldGeometry.faces[i].vertexColors[1] = new THREE.Color( 0xff0000 );
       tempFieldGeometry.faces[i].vertexColors[2] = new THREE.Color( 0xff0000 );
         
       if(x < 6 || x > 60 || y < 1 || y > 33){
         tempFieldGeometry.faces[i].vertexColors[0].setHSL(0,0,0);
         tempFieldGeometry.faces[i].vertexColors[1].setHSL(0,0,0);
         tempFieldGeometry.faces[i].vertexColors[2].setHSL(0,0,0);
       }
       else if(!(i % 2)){
         var color1 = getHSL((tempField[0][x][y_length-y]-l_temp)/(h_temp-l_temp));
         tempFieldGeometry.faces[i].vertexColors[0].setHSL(color1.h, color1.s, color1.l)

         var color2 = getHSL((tempField[0][x][y_length-y-1]-l_temp)/(h_temp-l_temp));
         tempFieldGeometry.faces[i].vertexColors[1].setHSL(color2.h, color2.s, color2.l)

         var color3 = getHSL((tempField[0][x+1][y_length-y]-l_temp)/(h_temp-l_temp));
         tempFieldGeometry.faces[i].vertexColors[2].setHSL(color3.h, color3.s, color3.l)
       }
       else{
         var color1 = getHSL((tempField[0][x][y_length-y-1]-l_temp)/(h_temp-l_temp));
         tempFieldGeometry.faces[i].vertexColors[0].setHSL(color1.h, color1.s, color1.l)

         var color2 = getHSL((tempField[0][x+1][y_length-y-1]-l_temp)/(h_temp-l_temp));
         tempFieldGeometry.faces[i].vertexColors[1].setHSL(color2.h, color2.s, color2.l)

         var color3 = getHSL((tempField[0][x+1][y_length-y]-l_temp)/(h_temp-l_temp));
         tempFieldGeometry.faces[i].vertexColors[2].setHSL(color3.h, color3.s, color3.l)
       }
     }

     var material = new THREE.MeshBasicMaterial({vertexColors:THREE.VertexColors, transparent: true, opacity: 0.6, depthWrite: false, depthTest: false}); 
     tempPlane = new THREE.Mesh( tempFieldGeometry, material );
     tempPlane.scale.y = Y_SCALE;
   }

   function updateTempField(time, prev_time){

     h_temp = -40;
     l_temp = 40;
     for(x=C_MIN_X; x<C_MAX_X; x=x+C_STEP_X){
       for(y=C_MIN_Y; y<C_MAX_Y; y=y+C_STEP_Y){
         
         if(tempField[time][x][y] > h_temp){
           h_temp = tempField[time][x][y];
         }

         if(tempField[time][x][y] < l_temp && tempField[0][x][y] != 0){
           l_temp = tempField[time][x][y];
         }
       }
     }
     
     var info_index = 0;
     for(x=L_MIN_X; x<L_MAX_X; x=x+INFO_STEP){
       for(y=L_MIN_Y; y<L_MAX_Y; y=y+INFO_STEP){
         if(tempField[time][x][y] > h_temp-1 || tempField[time][x][y] < l_temp+5){
           infoLabels[info_index].visible = true;
           var info_text = tempField[time][x][y]+"°C";

           var info_canvas = document.createElement('canvas');
           info_canvas.id = x+"_"+y+"_temp";
           info_canvas.width = 64;
           info_canvas.height = 64;

           var info_context = info_canvas.getContext('2d');
           info_context.font="200 20px roboto, sans-serif";
           info_context.fillStyle = "#fff";
           var w = (64-info_context.measureText(info_text).width)/2;
           info_context.fillText(info_text, w, 20);

           var texture = new THREE.Texture(info_canvas);
           texture.minFilter = THREE.NearestFilter;

           texture.needsUpdate = true;
           var info_material = new THREE.SpriteMaterial( { map:texture, color: 0xffffff } );
           infoLabels[info_index].material = info_material;
         }else if(infoLabels[info_index].material.opacity == 1){
           TweenLite.to(infoLabels[info_index].material, 0.5, {
             opacity:0
           }); 
         }
         info_index++;
       }
     }

     tempPlane.geometry.colorsNeedUpdate = true;
     var x = 0;
     var y = 0;
     for(i=0; i<tempPlane.geometry.faces.length; i++){

       if(x == 70){
         x = 0;
         y=y+1;      
       }
       else if(!(i % 2)){
         x=x+1;
       }

       tempPlane.geometry.faces[i].vertexColors[0] = new THREE.Color( 0xff0000 );
       tempPlane.geometry.faces[i].vertexColors[1] = new THREE.Color( 0xff0000 );
       tempPlane.geometry.faces[i].vertexColors[2] = new THREE.Color( 0xff0000 );
         
       if(x < 6 || x > 60 || y < 1 || y > 33){
         tempPlane.geometry.faces[i].vertexColors[0].setHSL(0,0,0);
         tempPlane.geometry.faces[i].vertexColors[1].setHSL(0,0,0);
         tempPlane.geometry.faces[i].vertexColors[2].setHSL(0,0,0);
       }
       else if(!(i % 2)){
         var color1 = getHSL((tempField[time][x][y_length-y]-l_temp)/(h_temp-l_temp));
         tempPlane.geometry.faces[i].vertexColors[0].setHSL(color1.h, color1.s, color1.l)

         var color2 = getHSL((tempField[time][x][y_length-y-1]-l_temp)/(h_temp-l_temp));
         tempPlane.geometry.faces[i].vertexColors[1].setHSL(color2.h, color2.s, color2.l)

         var color3 = getHSL((tempField[time][x+1][y_length-y]-l_temp)/(h_temp-l_temp));
         tempPlane.geometry.faces[i].vertexColors[2].setHSL(color3.h, color3.s, color3.l)
       }
       else{
         var color1 = getHSL((tempField[time][x][y_length-y-1]-l_temp)/(h_temp-l_temp));
         tempPlane.geometry.faces[i].vertexColors[0].setHSL(color1.h, color1.s, color1.l)

         var color2 = getHSL((tempField[time][x+1][y_length-y-1]-l_temp)/(h_temp-l_temp));
         tempPlane.geometry.faces[i].vertexColors[1].setHSL(color2.h, color2.s, color2.l)

         var color3 = getHSL((tempField[time][x+1][y_length-y]-l_temp)/(h_temp-l_temp));
         tempPlane.geometry.faces[i].vertexColors[2].setHSL(color3.h, color3.s, color3.l)
       }
     } 
   }

   function hideInfoLabels(){
     for(i=0; i<infoLabels.length; i++)
       infoLabels[i].visible = false;
   }

   var infoLabels = [];
   function addInfoLabels(){
     var infoIndex = 0;
     var even_y = 0;
     for(x=L_MIN_X; x<L_MAX_X; x=x+INFO_STEP){
       for(y=L_MIN_Y; y<L_MAX_Y; y=y+INFO_STEP){
         var info_text = "1.0 mm"

         var info_canvas = document.createElement('canvas');
         info_canvas.id = x+"_"+y+"_temp";
         info_canvas.width = 64;
         info_canvas.height = 64;

         var info_context = info_canvas.getContext('2d');
         info_context.font="400 12px roboto, sans-serif";
         info_context.fillStyle = "#faa";
         var w = (64-info_context.measureText(info_text).width)/2;
         info_context.fillText(info_text, w, 20);

         var texture = new THREE.Texture(info_canvas);
         texture.minFilter = THREE.NearestFilter;
         texture.needsUpdate = true;
         var info_material = new THREE.SpriteMaterial( { 
           map:texture, 
           depthTest:false, 
           depthWrite:false, 
           color: 0xffffff,
           useScreenCoordinates: false
         });

         if(even_y == 0)
           even_y = 1;
         else
           even_y = 0;

         infoLabels[infoIndex] = new THREE.Sprite(info_material);
         infoLabels[infoIndex].position.set(x-even_y*INFO_STEP/2-x_length/2, y-y_length/2, 0);

         infoLabels[infoIndex].rotation.y = 0;
         infoLabels[infoIndex].rotation.x = 0;
         infoLabels[infoIndex].scale.x = 1.5;
         infoLabels[infoIndex].scale.y = 1.5;
         infoLabels[infoIndex].renderDepth = 2;
         infoLabels[infoIndex].visible = false;
         top_scene.add(infoLabels[infoIndex]);  

         infoIndex++;
       }
     }
   }

   function updateCameraAnim(){
     camera.lookAt(new THREE.Vector3(-5.406176081937662, -1.7519303785479108, -2.9452610886812214));
   }

   function completeCameraAnim(){ 
     allowCameraAnimation=true; 
    // cameraSmoothing.x = 1;
     TweenLite.to(cameraSmoothing, 1, {
       x:1,
       y:1
     });
   }


   // FUNCTIONS    
   var allowCameraAnimation = false;
   function init() 
   {
     $("#sidebar_left").hide(); 
     $("#sidebar_right").hide();
     $("#interface").hide();

     // SCENE
     scene = new THREE.Scene();
     top_scene = new THREE.Scene();
     clock = new THREE.Clock();
     clock.start();
     //currentTime = $("#time_slider").slider("value")+1;
     // CAMERA
     var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
     var VIEW_ANGLE = 25, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
     camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);Math.floor(Math.random()*16777215).toString(16);

     scene.add(camera);
     top_scene.add(camera);

     raycaster = new THREE.Raycaster();

     // RENDERER
     if ( Detector.webgl )
       renderer = new THREE.WebGLRenderer();
     else
       renderer = new THREE.CanvasRenderer(); 

     renderer.autoClear = false;
     renderer.setClearColor( 0x000000, 1);
     renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
     container = document.getElementById( 'ThreeJS' );
     container.appendChild( renderer.domElement );
     // EVENTS
     THREEx.WindowResize(renderer, camera);
     // CONTROLS
     //controls = new THREE.OrbitControls( camera, renderer.domElement );
     // // STATS
     // stats = new Stats();
     // stats.domElement.style.position = 'absolute';
     // stats.domElement.style.bottom = '0px';
     // stats.domElement.style.zIndex = 100;
     // container.appendChild( stats.domElement );

     //$("#ui").animate({backgroundColor:"transparent"}, 2000);
   }

   function animate() 
   {
     clockTime = clock.getElapsedTime();
     clockDelta = clock.getDelta();

     if(allowCameraAnimation){
       camera.position.x += Math.sin(clockTime*0.5)*0.005*cameraSmoothing.x;
       camera.position.y += Math.cos(clockTime*0.5)*0.003*cameraSmoothing.x;
     }

     // if(allowCloudSimulation){
     //   if(C_NUM == 1){
     //     if(cloud_mesh != null){
     //       for(x=C_MIN_X; x<C_MAX_X; x=x+C_STEP_X){
     //         for(y=C_MIN_Y; y<C_MAX_Y; y=y+C_STEP_Y){
     //           cloud_mesh[x][y].material.rotation += cloud_mesh[x][y].spin*0.8;
     //         }
     //       }
     //     }
     //   }else{
     //     if(cloud_mesh != null){
     //      for(x=C_MIN_X; x<C_MAX_X; x=x+C_STEP_X){
     //        for(y=C_MIN_Y; y<C_MAX_Y; y=y+C_STEP_Y){
     //           for(h=0; h<3; h=h+1){
     //             cloud_mesh[x][y][h].material.rotation = cloud_mesh[x][y][h].spin*30;
     //           }
     //         }
     //       }
     //     }
     //   }
     // }

     if(allowWindSimulation){
       simulateMovingWind();
     }

     // camera.rotation.z = 1
     // camera.up(0,0,1);

     // for (var i = 0; i < locations.length; i++) {
     //   if(locations[i].html){
     //     var position = toScreenPosition(locations[i].convertPos);
     //     locations[i].x = position.x;
     //     locations[i].y = position.y;

     //     locations[i].html.style.top = locations[i].y + 'px';
     //     locations[i].html.style.left = locations[i].x + 'px';
     //     //locations[i].html.style.transform = "rotate("+camera.rotation.z*0.1+"rad)";
     //   }
     // }
     

     // if(allowCameraAnimation){
     //   camera.position.x += (-mouse.x - camera.position.x)*0.02 - 0.1;
     //   camera.position.y += (mouse.y - camera.position.y)*0.02 -1.1;

     //   if(camera.rotation.z <= 0.05 && camera.rotation.z >= 0.01)
     //     camera.rotation.z += (mouse.x - camera.rotation.z)*0.0005;
     //   else if(camera.rotation.z >= 0.05)
     //     camera.rotation.z = 0.05
     //   else if(camera.rotation.z <= 0.01)
     //     camera.rotation.z = 0.01

     //   if(camera.rotation.x <= 0.96 && camera.rotation.x >= 0.95)
     //     camera.rotation.x += (mouse.y - camera.rotation.x)*0.0002 +0.0002;
     //   else if(camera.rotation.x >= 0.96)
     //     camera.rotation.x = 0.96
     //   else if(camera.rotation.x <= 0.95)
     //     camera.rotation.x = 0.95
     // }

     //console.log(camera.rotation.x)

     requestAnimationFrame( animate );

     if(currentTime!=undefined){ 
       if(rainCount[currentTime]>0){
         simulateRain();
       }
     }

     render();   
     update();
   }

   function update()
   {
     // stats.update();
     //controls.update();
   }

   function render() 
   {
     renderer.clear();                    
     renderer.render( scene, camera );    
     renderer.clearDepth();                
     renderer.render( top_scene, camera );   
   }