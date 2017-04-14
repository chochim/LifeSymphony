$(document).ready(function() {
    $('#loader').hide();
});

function hideLoader() {
    $('#loader').hide();
}

function showLoader() {
    $('#loader').show();
}

function getSingleTweetDisplay(handle, tweet) {
    var tweetDisplay = '<li class="collection-item">';
    //tweetDisplay += '<img src="' + getImageUrl(handle) + '" alt="" class="circle">';
    //tweetDisplay += '<span class="title">' + handle + '</span><blockquote><i>' + tweet + '</i></blockquote>';
    tweetDisplay += tweet + '</li>';
    //tweetDisplay += '<a href="#!" class="secondary-content"><i class="medium material-icons">play_arrow</i></a></li>';
    return tweetDisplay;
}

function getDisplayResults(twitterObjs) {
    var htmlString = '';
    var numTweets = 0;
    $.each(twitterObjs, function(handle, tweet) {
        htmlString += getSingleTweetDisplay(handle, tweet);
        numTweets += 1;
    });
    if (numTweets==0) {
        return '<li class="collection-item">No results</li>';
    }
    return htmlString;
}

function displayResults(twitterObjs) {
    var htmlString = getDisplayResults(twitterObjs);
    $('.res').show();
    $('.collection').append(htmlString);
    $('.collection').show();
}

function getImageUrl(screenName) {
    return 'https://twitter.com/' + screenName + '/profile_image?size=bigger';
}

function showError(errorMsg) {
    Materialize.toast(errorMsg, 4000);
}

function removeList() {
    $('ul li').not('li:first').remove()
}

function getTwitterResults(searchTerm) {
    $.post("twitter.php", { 'search_term': searchTerm }, function(data) {
            data = jQuery.parseJSON(data);
            if (data['error']) {
                showError(data['error']);
            } else { //if error
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
            if ($('#search').val().trim()) {
                $('#loader').show();
                event.preventDefault();
                removeList();
                getTwitterResults($('#search').val().trim());
            }
        }
    });
}());
