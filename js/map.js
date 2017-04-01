var map = new Datamap({
	element: document.getElementById('map'),	
	geographyConfig: {
            highlightOnHover: true,
            popupOnHover: true,
            hideAntarctica: false
        },    
    fills: {
      defaultFill: 'green'
    },
    responsive: true,
});

var TIMEOUT = 700;
var birthColor = 'blue';
var deathColor = 'red';
var defaultColor = 'green';

var data = {
	'USA': {
		'birth': 8000,
		'death': 11000
	},
	'IND': {
		'birth': 2000,
		'death': 6000
	}
}

var timeouts = [];
var j=0;

function backToOriginalColor(countryCode) {	
	map.updateChoropleth({countryCode: 'black'}, {reset: true});
}

function countryCodeToString(countryCode) {
	return countryCode;
}

function applyDeath(countryCode, duration) {		
	map.updateChoropleth({countryCode: deathColor}, {reset: true});
	console.log(countryCode+'--> death');	
	timeouts[j] = setTimeout(function(){
			backToOriginalColor(countryCode);
		}, TIMEOUT);	
	++j;
}

function applyBirth(countryCode, duration) {	
	map.updateChoropleth({countryCode: birthColor}, {reset: true});
	console.log(countryCode+'--> birth');
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
		applyBirth(countryCode, TIMEOUT);
	}, birthRate);
	deathIntervals[i] = setInterval(function(){		
		applyDeath(countryCode, TIMEOUT);
	}, deathRate);
	++i;
});