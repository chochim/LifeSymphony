var map = new Datamap({
    element: document.getElementById('map'),
    responsive: true,
});

function change(countryCode) {
    var cnt = ['USA'];        
    map.updateChoropleth({
        cnt[0] : 'blue'
    });
    console.log(countryCode + '--> colorChange');
}

setInterval(function() {
    change("USA");
}, 2000);
