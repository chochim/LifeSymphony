/*var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	 	center: new google.maps.LatLng(-34.397, 150.644),
	    zoom: 2,
	    minZoom: 1
	});
}*/
var map = new Datamap({
	element: document.getElementById('map'),
	//projection: 'mercator'
	geographyConfig: {
            highlightOnHover: false,
            popupOnHover: false,
            hideAntarctica: false
        },    
    fills: {
      defaultFill: 'green' //the keys in this object map to the "fillKey" of [data] or [bubbles]
    },
});

function fadeToColor(fromColor, toColor) {
	var interpolate = d3.interpolateRgb(fromColor, toColor);
	var i = 0;

	function interpolateColor () {
   		setTimeout(function () {    
   			//console.log(interpolate(i/200.0));
      		map.updateChoropleth({USA: interpolate(i/100.0)}, {reset: true});
      		i++;                     
      		if (i <= 100) {            
         		interpolateColor();             
      		}                        
   		}, 10)
	}

	interpolateColor();
}

var birthColor = 'blue';
var deathColor = 'red';
var defaultColor = 'green';

function applyColor(toColor, duration) {
	var easing = 'easeInOutCubic';
	var from = {color: defaultColor};
	var to = {color: toColor};
	jQuery(from).animate(to, {
		duration: duration/2,
		easing: easing,
		step: function() {
			map.updateChoropleth({USA: this.color}, {reset: true});
		}
	});
	from = {color: toColor};
	to = {color: defaultColor};
	jQuery(from).animate(to, {
		duration: duration/2,
		easing: easing,
		step: function() {
			map.updateChoropleth({USA: this.color}, {reset: true});
		}
	});
}

function easeToColor(fromColor, toColor, duration) {	
	var from = {color: fromColor};
	var to = {color: toColor};
 
	jQuery(from).animate(to, {
    	duration: duration,
    	step: function() {        	
        	map.updateChoropleth({USA: this.color}, {reset: true});
    	}
	});
}

function applyDeath(duration) {
	applyColor(deathColor, duration);
}

function applyBirth(duration) {
	applyColor(birthColor, duration);
}

setInterval(function() {
	map.updateChoropleth({USA: birthColor}, {reset: true});
	//fadeToColor(birthColor,defaultColor);
	easeToColor(birthColor, defaultColor, 600)
	//applyDeath(600);
}, 8000);//birth//

setInterval(function() {
	map.updateChoropleth({USA: deathColor}, {reset: true});
	//fadeToColor(deathColor, defaultColor);
	easeToColor(deathColor, defaultColor, 600);
	//applyDeath(600);

}, 11000);//death//11s
/*
var statsBirthArray = {USA: 8000, IND: 1760};

for(var country in statsBirthArray) {	
	setInterval(function(){
		console.log('called='+country);
		map.updateChoropleth({country: birthColor}, {reset: true});
	}, statsBirthArray[country]);	
}*/


//