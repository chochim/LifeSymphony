var TIMEOUT = 700;
var BIRTH_COLOR = 'blue';
var DEATH_COLOR = 'red';
var DEFAULT_COLOR = 'green';

var map = new Datamap({
	element: document.getElementById('map'),	
	geographyConfig: {
            highlightOnHover: true,
            popupOnHover: true,
            hideAntarctica: false
        },    
    fills: {
      defaultFill: DEFAULT_COLOR
    },
    responsive: true,
});

var timeouts = [];
var j=0;

function backToOriginalColor(countryCode) {	
	var obj = {};
	obj[countryCode] = DEFAULT_COLOR;
	map.updateChoropleth(obj);
}

function applyDeath(countryCode) {		
	var obj = {};
	obj[countryCode] = DEATH_COLOR;
	map.updateChoropleth(obj);	
	timeouts[j] = setTimeout(function(){
			backToOriginalColor(countryCode);
		}, TIMEOUT);	
	++j;
}

function applyBirth(countryCode) {	
	var obj = {};
	obj[countryCode] = BIRTH_COLOR;
	map.updateChoropleth(obj);	
	timeouts[j] = setTimeout(function(){
			backToOriginalColor(countryCode);
		}, TIMEOUT);	
	++j;
}

var birthIntervals = [];
var deathIntervals = [];
var i=0;

$.each(data, function(countryCode, birthDeathObj){
	var deathRate = birthDeathObj['death'];
	var birthRate = birthDeathObj['birth'];
	birthIntervals[i] = setInterval(function(){		
		applyBirth(countryCode);
	}, birthRate);
	deathIntervals[i] = setInterval(function(){		
		applyDeath(countryCode);
	}, deathRate);
	++i;
});