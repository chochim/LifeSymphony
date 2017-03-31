$(document).ready(function() {
    $('#loader').hide();
});

function hideLoader() {
	$('#loader').hide();
}

function showLoader() {
	$('#loader').show();
}

function displayResults(twitterObjs) {

}

function showError(errorMsg) {
	Materialize.toast(errorMsg, 4000);
}


function getTwitterResults(searchTerm) {
    $.post("twitter.php", { 'search_term': searchTerm }, function(data) {
    	data = jQuery.parseJSON(data);
    		if(data['error']) {    			
    			showError(data['error']);
    		} else {//if error
    			//alert(JSON.stringify(data['result']));
    			displayResults(data['result']);
    		}            
        })
        .fail(function() {
            showError('Error connecting to the server!');            
        })
        .always(function() {
        	hideLoader();
        });        
}

(function() {
    var search = document.getElementById('search');
    search.addEventListener('keypress', function(event) {
        if (event.keyCode == 13) {
            $('#loader').show();
            event.preventDefault();            
            getTwitterResults($('#search').val().trim());
        }
    });
}());
