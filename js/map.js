var timer = new Timer();
timer.start();
timer.addEventListener('secondsUpdated', function(e) {
    $('#basicUsage').html(timer.getTimeValues().toString());
});

var TIMEOUT = 700;
var BIRTH_COLOR = 'blue';
var DEATH_COLOR = 'red';
var DEFAULT_COLOR = 'green';
var TIME_INFO = 1500;

var INSTRUMENTS = new Array('#piano', '#flute', '#drums');
var instrumentMap = {};
for (var k = 0; k < INSTRUMENTS.length; ++k) {
    instrumentMap[INSTRUMENTS[k]] = {};
    instrumentMap[INSTRUMENTS[k]]['event'] = 'death';
}

var instrumentNotes = {};
for (var k = 0; k < INSTRUMENTS.length; ++k) {
    instrumentNotes[INSTRUMENTS[k]] = {};
    instrumentNotes[INSTRUMENTS[k]]['death'] = {};
    instrumentNotes[INSTRUMENTS[k]]['birth'] = {};
    instrumentNotes[INSTRUMENTS[k]]['instrument'] = '';
}


function instrumentNoteSetup() {
    //drum
    instrumentNotes['#drums']['death']['note'] = 50;
    instrumentNotes['#drums']['death']['velocity'] = 127;
    instrumentNotes['#drums']['death']['delay'] = 0.75;
    instrumentNotes['#drums']['birth']['note'] = 30;
    instrumentNotes['#drums']['birth']['velocity'] = 127;
    instrumentNotes['#drums']['birth']['delay'] = 0.75;
    instrumentNotes['#drums']['instrument'] = 'synth_drum';
    instrumentNotes['#drums']['code'] = 118;

    //piano
    instrumentNotes['#piano']['death']['note'] = 50;
    instrumentNotes['#piano']['death']['velocity'] = 127;
    instrumentNotes['#piano']['death']['delay'] = 0.75;
    instrumentNotes['#piano']['birth']['note'] = 30;
    instrumentNotes['#piano']['birth']['velocity'] = 127;
    instrumentNotes['#piano']['birth']['delay'] = 0.75;
    instrumentNotes['#piano']['instrument'] = 'acoustic_grand_piano';
    instrumentNotes['#piano']['code'] = 0;

    //flute
    instrumentNotes['#flute']['death']['note'] = 50;
    instrumentNotes['#flute']['death']['velocity'] = 127;
    instrumentNotes['#flute']['death']['delay'] = 0.75;
    instrumentNotes['#flute']['birth']['note'] = 30;
    instrumentNotes['#flute']['birth']['velocity'] = 127;
    instrumentNotes['#flute']['birth']['delay'] = 0.75;
    instrumentNotes['#flute']['instrument'] = 'flute';
    instrumentNotes['#flute']['code'] = 73;
}

instrumentNoteSetup();

var totalDeaths = 0;
var totalBirths = 0;

var countries = {};
var countryObjs = Datamap.prototype.worldTopo.objects.world.geometries;
for (var i = 0; i < countryObjs.length; i++) {
    //console.log('code='+countryObjs[i].id+', '+countryObjs[i].properties.name);
    if (!(countryObjs[i].properties.name === undefined)) {
        countries[countryObjs[i].id] = countryObjs[i].properties.name;
    }
}

var map = new Datamap({
    element: document.getElementById('map'),
    projection: "mercator",
    geographyConfig: {
        highlightOnHover: true,
        popupOnHover: true,
        hideAntarctica: true,
        popupTemplate: function(geography, data) {
            return getBPM(geography.id, true);
        }
    },
    fills: {
        defaultFill: DEFAULT_COLOR
    },
    responsive: true,
});

var timeouts = [];
var j = 0;

function humanizeTime(time) {
    var timeObj = moment.duration(time, 'ms');
    return timeObj.humanize();
}

function getBPMFromRate(rate) {
    var bpm = 60*rate/1000.0;
    return bpm+' BPM';
}

function getBPM(countryCode, ifBackground) {
    var countryName = countries[countryCode];
    var birthRate = data[countryCode]['birth'];
    var deathRate = data[countryCode]['death'];
    var infoStr = '';
    if (ifBackground) {
        infoStr = '<div class="row bg"'
    } else {
        infoStr = '<div class="row">';
    }
    infoStr += '<b><u>' + countryName + '</u></b><br />';
    var deathSentence = '<i>Death</i>: ' + getBPMFromRate(deathRate);
    var birthSentence = '<i>Birth</i>: ' + getBPMFromRate(birthRate);
    infoStr += deathSentence + '<br />';
    infoStr += birthSentence + '</div>';
    return infoStr;
}

function getCountryInfoString(countryCode, ifBackground) {
    var countryName = countries[countryCode];
    var birthRate = data[countryCode]['birth'];
    var deathRate = data[countryCode]['death'];
    var infoStr = '';
    if (ifBackground) {
        infoStr = '<div class="row bg"'
    } else {
        infoStr = '<div class="row">';
    }
    infoStr += '<b><u>' + countryName + '</u></b><br />';
    var deathSentence = '<i>Death</i>: ' + deathRate;
    var birthSentence = '<i>Birth</i>: ' + birthRate;
    infoStr += deathSentence + '<br />';
    infoStr += birthSentence + '</div>';
    return infoStr;
}

function backToOriginalColor(countryCode) {
    var obj = {};
    obj[countryCode] = DEFAULT_COLOR;
    map.updateChoropleth(obj);
}

function updateDeathCount() {
    var dc = 'Total deaths: ' + totalDeaths;
    $('.deaths').text(dc);
}

function updateBirthCount() {
    var bc = 'Total births: ' + totalBirths;
    $('.birth').text(bc);
}

function updateRealTime(strng) {
    $('#live').append('<li class="collection-item">' + strng + '</li>');
    $('.live-status').animate({ scrollTop: $('#live').prop('scrollHeight') }, 10);
}

function applyDeath(countryCode, deathRate) {
    checkAndPlaySound(countryCode, 'death');
    updateRealTime('Death in ' + countries[countryCode]);
    ++totalDeaths;
    updateDeathCount();
    var obj = {};
    obj[countryCode] = DEATH_COLOR;
    map.updateChoropleth(obj);
    timeouts[j] = setTimeout(function() {
        backToOriginalColor(countryCode);
    }, TIMEOUT);
    ++j;
    setTimeout(function() {
        applyDeath(countryCode, deathRate);
    }, deathRate);
}

function isBirth(event) {
    return event == 'birth';
}

function checkAndPlaySound(countryCode, event) {
    for (var k = 0; k < INSTRUMENTS.length; ++k) {
        //instrumentMap[instrument][country]
        //instrumentMap[instrument][event]
        if ((instrumentMap[INSTRUMENTS[k]]['country'] == countryCode) && (instrumentMap[INSTRUMENTS[k]]['event'] == event)) {
            playSound(countryCode, INSTRUMENTS[k], isBirth(event));
        }
    }
}

function applyBirth(countryCode, birthRate) {
    checkAndPlaySound(countryCode, 'birth');
    updateRealTime('Birth in ' + countries[countryCode]);
    ++totalBirths;
    updateBirthCount();
    var obj = {};
    obj[countryCode] = BIRTH_COLOR;
    map.updateChoropleth(obj);
    timeouts[j] = setTimeout(function() {
        backToOriginalColor(countryCode);
    }, TIMEOUT);
    ++j;
    setTimeout(function() {
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

$(document).ready(function() {
    $('ul.tabs').tabs();
});

function getSortedArray(data) {
    var countries = [];
    var reverseCountries = {};
    $.each(data, function(code, country) {
        if (!(code == 'FLK')) {
            countries.push(country);
            reverseCountries[country] = code;
        }
    });
    countries.sort();
    var sortedArray = {};
    for (var i = 0; i < countries.length; ++i) {
        sortedArray[reverseCountries[countries[i]]] = countries[i];
    }
    return sortedArray;
}

function addSelect(countries) {
    var sortedCountries  = getSortedArray(countries);
    for (var i = 0; i < INSTRUMENTS.length; ++i) {
        $.each(sortedCountries, function(code, country) {
            if(!(country==undefined)) {
                $(INSTRUMENTS[i]).append('<option value=' + code + '>' + country + '</option>')
            }
        });      
    }
}

$.each(data, function(countryCode, birthDeathObj) {
    //TODO: Check error here
    if (!(countryCode == 'FLK')) {
        var deathRate = birthDeathObj['death'];
        var birthRate = birthDeathObj['birth'];
        setTimeout(function() {
            applyBirth(countryCode, birthRate);
        }, birthRate);
        setTimeout(function() {
            applyDeath(countryCode, deathRate);
        }, deathRate);        
    }
});

addSelect(countries);

function setupList() {
    //TODO: Reset height
    var height = $('#map').innerHeight();
    var width = $('#map').innerWidth();
    $('.live-status').height(500);
    $('.live-status').width(width);
}
$(document).ready(function() {
    $('select').material_select();
});

setupList();

function getNote(event, instrument) {
    if (event == 'birth') {
        return 50;
    } else {
        return 70;
    }
}

function getIdFromSwitch(switchId) {
    var index = switchId.search('-switch');
    return switchId.substr(0, index);
}

function getSwitchId(instrument) {
    return '#' + instrument + '-switch';
}

var countryMusic = new Array();

for (var k = 0; k < INSTRUMENTS.length; ++k) {
    $(INSTRUMENTS[k]).change(function() {
        var instrument = this.id;
        var countryCode = $(this).val();
        instrumentMap['#' + instrument]['country'] = countryCode;
        //console.log(countryCode+' selected '+instrument);     
        //console.log(JSON.stringify(instrumentMap));
    });
    $(INSTRUMENTS[k] + '-switch').change(function() {
        //console.log('Instrument switch =' + this.id);
        var instrumentSwitch = this.id;
        var instrumentId = getIdFromSwitch(instrumentSwitch);
        if ($('#' + instrumentSwitch).is(':checked')) {
            //birth
            instrumentMap['#' + instrumentId]['event'] = 'birth';
        } else {
            //death
            instrumentMap['#' + instrumentId]['event'] = 'death';
        }
        //console.log(JSON.stringify(instrumentMap));
    });
}

function applyCircleAnimation(instrument, ifBirth) {
    if (ifBirth) {
        $(instrument + '-circle').animate({
            backgroundColor: BIRTH_COLOR
        }, {
            duration: 'fast',
            complete: function() {
                $(instrument + '-circle').animate({
                    backgroundColor: 'orange'
                }, {
                    duration: 'fast'
                });
            }
        });
    } else {
        $(instrument + '-circle').animate({
            backgroundColor: DEATH_COLOR
        }, {
            duration: 'fast',
            complete: function() {
                $(instrument + '-circle').animate({
                    backgroundColor: 'orange'
                }, {
                    duration: 'fast'
                });
            }
        });
    }
}

function playSound(countryCode, instrument, ifBirth) {
    applyCircleAnimation(instrument, ifBirth);

    var event = 'death';
    if (ifBirth) {
        event = 'birth';
    }
    MIDI.loadPlugin({
        soundfontUrl: "./soundfont/",
        instrument: instrumentNotes[instrument]['instrument'],
        onprogress: function(state, progress) {
            //console.log(state, progress);
        },
        onsuccess: function() {
            var delay = instrumentNotes[instrument][event]['delay']; // play one note every quarter second
            var note = instrumentNotes[instrument][event]['note']; // the MIDI note
            var velocity = instrumentNotes[instrument][event]['velocity']; // how hard the note hits
            var code = instrumentNotes[instrument]['code'];
            // play the note
            MIDI.programChange(0, code);
            MIDI.setVolume(0, 127);
            MIDI.noteOn(0, note, velocity, 0);
            MIDI.noteOff(0, note, delay);
        }
    });
}
