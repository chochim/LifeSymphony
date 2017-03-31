$(document).ready(function() {
    $('#loader').hide();
});

(function() {
    var search = document.getElementById('search');
    search.addEventListener('keypress', function(event) {
        if (event.keyCode == 13) {
        	$('#loader').show();
            event.preventDefault();
            //alert($('#search').val());
        }
    });
}());
