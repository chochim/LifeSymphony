var TIMEOUT = 700;
var BIRTH_COLOR = 'teal';
var DEATH_COLOR = 'maroon';
var DEFAULT_COLOR = 'DarkGrey';
var TIME_INFO = 1500;

var INSTRUMENTS = new Array('#C', '#D', '#E', '#F', '#G', '#H');
var instrumentMap = {};
for (var k = 0; k < INSTRUMENTS.length; ++k) {
    instrumentMap[INSTRUMENTS[k]] = new Array();
}

var toneMap = {};
for (var k=0; k<INSTRUMENTS.length; ++k) {
    toneMap[INSTRUMENTS[k]] = {};
    toneMap[INSTRUMENTS[k]]['note'] = 'death';
}

var instrumentNotes = {};
function instrumentNoteSetup() {
    instrumentNotes['acoustic_grand_piano'] = {};
    instrumentNotes['acoustic_grand_piano']['code'] = 0;
    instrumentNotes['acoustic_grand_piano']['name'] = 'Acoustic Piano';
    instrumentNotes['flute'] = {};
    instrumentNotes['flute']['code'] = 73;
    instrumentNotes['flute']['name'] = 'Flute';
    instrumentNotes['sitar'] = {};
    instrumentNotes['sitar']['code'] = 104;
    instrumentNotes['sitar']['name'] = 'Sitar';
    instrumentNotes['synth_drum'] = {};
    instrumentNotes['synth_drum']['code'] = 118;
    instrumentNotes['synth_drum']['name'] = 'Synth Drum';
    instrumentNotes['violin'] = {};
    instrumentNotes['violin']['code'] = 40;
    instrumentNotes['violin']['name'] = 'Violin';
    instrumentNotes['xylophone'] = {};
    instrumentNotes['xylophone']['code'] = 13;
    instrumentNotes['xylophone']['name'] = 'Xylophone';
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
    var secondRate = rate/1000;
    var bpm = 60/(secondRate);
    var prefix = d3.formatPrefix(bpm);
    return  prefix.scale(bpm).toFixed()+ prefix.symbol + ' BPM';
}

function getBPMString(countryCode) {
    if(!(data[countryCode]==undefined)) {
        var birthRate = data[countryCode]['birth'];
        var deathRate = data[countryCode]['death'];
        //console.log('(Birth: '+getBPMFromRate(birthRate)+', Death: '+getBPMFromRate(deathRate)+')');
        return '(Birth: '+getBPMFromRate(birthRate)+', Death: '+getBPMFromRate(deathRate)+')';
    } else {
        return '';
    }
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
        if('country' in toneMap[INSTRUMENTS[k]]) {
            var countryCode = toneMap[INSTRUMENTS[k]]['country'];
            if('instrument' in toneMap[INSTRUMENTS[k]]) {
                var instrument = toneMap[INSTRUMENTS[k]]['instrument'];
                if('scale' in toneMap[INSTRUMENTS[k]]) {
                    var scale = toneMap[INSTRUMENTS[k]]['scale'];
                    var note = toneMap[INSTRUMENTS[k]]['note'];
                    var identifier = INSTRUMENTS[k];
                    if(note==event) {
                        playSound(countryCode, instrument, scale, event, identifier);
                    }
                }
            }
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
                if(!getBPMString(code)==undefined || getBPMString(code)!='') {         
                    $(INSTRUMENTS[i]+'-country').append('<option value=' + code + '>' 
                        + country +'&nbsp;<br />' + getBPMString(code)+'</option>');
                }
            }            
        });      
    }
}

function addInstrumentOptions() {
    for (var i=0; i< INSTRUMENTS.length; ++i) {                
        $.each(instrumentNotes, function(instrumentCode, instrumentObj) {
            var instrumentName = instrumentObj['name'];
            $(INSTRUMENTS[i]+'-instrument').append('<option value='+instrumentCode+'>'
                +instrumentName+ '</option>');
        });
    }
}

function addScaleOptions() {
    var scales = new Array('A','B','C', 'D', 'E', 'F', 'G');
    for (var i=0; i< INSTRUMENTS.length; ++i) {                
        for(var k=0; k<scales.length; ++k) {
            var scale = scales[k];
            $(INSTRUMENTS[i]+'-scale').append('<option value='+scale+'>'
                +scale+ '</option>');
        }
    }
}

addInstrumentOptions();
addScaleOptions();

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

function getIdFromSwitch(switchId) {
    var index = switchId.search('-switch');
    return switchId.substr(0, index);
}

function getSwitchId(instrument) {
    return '#' + instrument + '-switch';
}

var countryMusic = new Array();

function getInstrumentFromId(instrument) {
    var split = instrument.split('-');
    return split[0];    
}

for (var k = 0; k < INSTRUMENTS.length; ++k) {    
    $(INSTRUMENTS[k]+'-country').change(function() {
        var instrument = getInstrumentFromId(this.id);        
        var countryCode = $(this).val();
        toneMap['#'+instrument]['country'] = countryCode;        
    });

    $(INSTRUMENTS[k]+'-instrument').change(function() {
        var instrument = getInstrumentFromId(this.id);        
        var instrumentCode = $(this).val();
        toneMap['#'+instrument]['instrument'] = instrumentCode;            
    });

    $(INSTRUMENTS[k]+'-scale').change(function() {
        var instrument = getInstrumentFromId(this.id);        
        var scaleCode = $(this).val();
        toneMap['#'+instrument]['scale'] = scaleCode;        
    });

    $(INSTRUMENTS[k] + '-switch').change(function() {        
        var instrumentSwitch = this.id;
        var instrumentId = getIdFromSwitch(instrumentSwitch);
        if ($('#' + instrumentSwitch).is(':checked')) {
            //birth
            toneMap['#' + instrumentId]['note'] = 'birth';
        } else {
            //death
            toneMap['#' + instrumentId]['note'] = 'death';
        }              
    });
}

function applyCircleAnimation(instrument, event) {    
    if (isBirth(event)) {
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

function getNote(event, instrument) {       
    var eventNotes = notes[event]['#'+instrument];    
    return eventNotes[Math.floor(Math.random() * eventNotes.length)];    
}

function playSound(countryCode, instrument, scale, event, identifier) {
    applyCircleAnimation(identifier, event);

    MIDI.loadPlugin({
        soundfontUrl: "./soundfont/",
        instrument: instrument,
        onprogress: function(state, progress) {
            //console.log(state, progress);
        },
        onsuccess: function() {
            var delay = 0.75; // play one note every quarter second
            var note = getNote(event, scale); // the MIDI note
            var velocity = 127; // how hard the note hits
            var code = instrumentNotes[instrument]['code'];
            // play the note
            MIDI.programChange(0, code);
            MIDI.setVolume(0, 127);
            MIDI.noteOn(0, note, velocity, 0);
            MIDI.noteOff(0, note, delay);
        }
    });
}

