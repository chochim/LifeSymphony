var timer = new Timer();
timer.start();
timer.addEventListener('secondsUpdated', function (e) {
    $('#basicUsage').html(timer.getTimeValues().toString());
});

var TIMEOUT = 700;
var BIRTH_COLOR = 'blue';
var DEATH_COLOR = 'red';
var DEFAULT_COLOR = 'green';
var TIME_INFO = 1500;

var INSTRUMENTS = new Array('#piano', '#flute', '#drums');

var totalDeaths = 0;
var totalBirths = 0;

var countries = {};
var countryObjs = Datamap.prototype.worldTopo.objects.world.geometries;
for (var i = 0, j = countryObjs.length; i < j; i++) {  
  countries[countryObjs[i].id] = countryObjs[i].properties.name;  
}

var map = new Datamap({
	element: document.getElementById('map'),
	geographyConfig: {
            highlightOnHover: true,
            popupOnHover: true,
            hideAntarctica: true,
            popupTemplate: function(geography, data) {
            	return getCountryInfoString(geography.id, true);
            }         
        },    
    fills: {
      defaultFill: DEFAULT_COLOR
    },
    responsive: true,
});

var timeouts = [];
var j=0;

function humanizeTime(time) {
	var timeObj = moment.duration(time, 'ms');
	return timeObj.humanize();
}

function getCountryInfoString(countryCode, ifBackground) {	
	var countryName = countries[countryCode];
	var birthRate = data[countryCode]['birth'];
	var deathRate = data[countryCode]['death'];
	var infoStr = '';
	if(ifBackground) {
		infoStr = '<div class="row bg"'
	} else {
		infoStr = '<div class="row">';
	}
	infoStr+= '<b><u>' + countryName+'</u></b><br />';
	var deathSentence = '<i>Death</i>: '+ humanizeTime(deathRate);
	var birthSentence = '<i>Birth</i>: '+ humanizeTime(birthRate);
	infoStr += deathSentence+'<br />';
	infoStr += birthSentence+'</div>';
	return infoStr;
}

function backToOriginalColor(countryCode) {	
	var obj = {};
	obj[countryCode] = DEFAULT_COLOR;
	map.updateChoropleth(obj);
}

function updateDeathCount() {
	var dc = 'Total deaths: '+totalDeaths;
	$('.deaths').text(dc);
}

function updateBirthCount() {
	var bc = 'Total births: '+totalBirths;
	$('.birth').text(bc);
}

function updateRealTime(strng) {
	$('#live').append('<li class="collection-item">'+strng+'</li>');	
	$('.live-status').animate({scrollTop: $('#live').prop('scrollHeight')}, 10);
}

function applyDeath(countryCode, deathRate) {	
	updateRealTime('Death in '+countries[countryCode]);
	++totalDeaths;
	updateDeathCount();
	var obj = {};
	obj[countryCode] = DEATH_COLOR;
	map.updateChoropleth(obj);	
	timeouts[j] = setTimeout(function(){
		backToOriginalColor(countryCode);
	}, TIMEOUT);	
	++j;
	setTimeout(function(){		
		applyDeath(countryCode, deathRate);
	}, deathRate);	
}

function applyBirth(countryCode, birthRate) {		
	updateRealTime('Birth in '+countries[countryCode]);
	++totalBirths;
	updateBirthCount();
	var obj = {};
	obj[countryCode] = BIRTH_COLOR;
	map.updateChoropleth(obj);	
	timeouts[j] = setTimeout(function(){
		backToOriginalColor(countryCode);
	}, TIMEOUT);	
	++j;
	setTimeout(function(){		
		applyBirth(countryCode, birthRate);
	}, birthRate);		
}

function displayMapMode() {
	$('#text-mode').hide();	
	$('#map').show();	
}

function displayTextMode() {
	$('#map').hide();
	$('#text-mode').show();	
}

$(document).ready(function(){
	$('ul.tabs').tabs();
});

function addSelect(countryCode) {
	for(var i=0;i<INSTRUMENTS.length;++i) {
		$(INSTRUMENTS[i]).append('<option value=' + countryCode + '>' + countries[countryCode] + '</option>');
	}
}

$.each(data, function(countryCode, birthDeathObj){
	//TODO: Check error here
	if (!(countryCode=='FLK')) {		
		var deathRate = birthDeathObj['death'];
		var birthRate = birthDeathObj['birth'];		
		setTimeout(function(){		
			applyBirth(countryCode, birthRate);
		}, birthRate);				
		setTimeout(function(){		
			applyDeath(countryCode, deathRate);
		}, deathRate);	
		addSelect(countryCode);
	}
});

function setupList() {
	var height = $('#map').innerHeight() - $('#results').outerHeight();
	var width = $('#map').innerWidth();
	console.log('height = '+height);
	$('.live-status').height(500);
	$('.live-status').width(width);
}
$(document).ready(function() {
    $('select').material_select();
});

setupList();

function getNote(event, instrument) {
	if(event=='birth') {
		return 50;
	} else {
		return 70;
	}
}

var countryMusic = new Array();

for(var k=0; k<INSTRUMENTS.length;++k) {
	$(INSTRUMENTS[k]).change(function(){
		var instrument = this.id;
		var countryCode = $(this).val();

		console.log(countryCode+' selected '+instrument);		
	});
	$(INSTRUMENTS[k]+'-switch').change(function() {
		console.log('Instrument switch ='+this.id);
		var instrumentSwitch = this.id;
		if($(this).is(':checked')) {

		} else {

		}
	});
}

function playDeathSound(countryCode, instrument) {
	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: "acoustic_grand_piano",
		onprogress: function(state, progress) {
			//console.log(state, progress);
		},
		onsuccess: function() {
			var delay = 0; // play one note every quarter second
			var note = 50; // the MIDI note
			var velocity = 127; // how hard the note hits
			// play the note
			MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 0.75);
		}
	});
}

function playBirthSound(countryCode, instrument) {
	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: "acoustic_grand_piano",
		onprogress: function(state, progress) {
			//console.log(state, progress);
		},
		onsuccess: function() {
			var delay = 0; // play one note every quarter second
			var note = 50; // the MIDI note
			var velocity = 127; // how hard the note hits
			// play the note
			MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 0.75);
		}
	});
}
