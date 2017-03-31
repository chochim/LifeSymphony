<?php
error_reporting(E_ALL); 
ini_set('display_errors', 1);

require_once('TwitterAPIExchange.php');
$settings = array(
    'oauth_access_token' => "845508174216134656-6yShm1CJisjMNtnK4gYpYS1iFpu57qO",
    'oauth_access_token_secret' => "rnlTV3Udk8JdoV1U0oq0xBxhQSpcyhOm0zwgnxF2UUitg",
    'consumer_key' => "UnAkQ7LeyIKJTe5ZEK9FWrub5",
    'consumer_secret' => "ijtIkeyC2Rv3Hyn6f60m3JB1SZV4S5sOPMqs298dIV44NDjlRP"
);

function getJsonFromFile($fileName) {
	$string = file_get_contents($fileName);
	return json_decode($string, true);
}

function cleanTweet($tweet, $searchTerm) {
    if (strpos($tweet, $searchTerm)) {
        //find the end after the search term

    }
}

function cleanTweetArray($tweetArray, $searchTerm) {
    $cleaned = array();
    foreach($tweetArray as $user) {
        $tweet = $tweetArray[$user];
        if(cleanTweet($tweet, $searchTerm)!=null) {
            $cleaned[$user] = cleanTweet($tweet, $searchTerm);
        }
    }
}

function getTweetsFromJson($jsonObj) {
    $tweets = array();
	$userStatus = $jsonObj['statuses'];
    foreach($userStatus as $status) {
        $tweets[$status['user']['screen_name']] = $status['text'];
    }
    return $tweets;
}

$url = "https://api.twitter.com/1.1/statuses/user_timeline.json";
$search_url = "https://api.twitter.com/1.1/search/tweets.json";
$search_term = 'search_term';
$to_search = '';
if(isset($_GET[$search_term])) {
	$to_search = $_GET[$search_term];
}
$search_field = '?q='.urlencode($to_search);

//$getfield = '?screen_name='.$twitter_handle.'&count=10';
$requestMethod = 'GET';

/*$twitter = new TwitterAPIExchange($settings);
echo '<pre>';
echo $search_field.'<br />';
echo $twitter->setGetfield($search_field)
             ->buildOauth($search_url, $requestMethod)
             ->performRequest();*/
echo '<pre>';
$result = getTweetsFromJson(getJsonFromFile('tt.json'));
foreach($result as $rr) {
    echo $rr.'=>'.$result[$rr].'<br />';
    break;
}

?>