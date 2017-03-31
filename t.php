<?php
require_once('TwitterAPIExchange.php');
$settings = array(
    'oauth_access_token' => "845508174216134656-6yShm1CJisjMNtnK4gYpYS1iFpu57qO",
    'oauth_access_token_secret' => "rnlTV3Udk8JdoV1U0oq0xBxhQSpcyhOm0zwgnxF2UUitg",
    'consumer_key' => "UnAkQ7LeyIKJTe5ZEK9FWrub5",
    'consumer_secret' => "ijtIkeyC2Rv3Hyn6f60m3JB1SZV4S5sOPMqs298dIV44NDjlRP"
);

$url = "https://api.twitter.com/1.1/statuses/user_timeline.json";
$twitter_handle = 'chochim';
/*if(isset($_GET['twitter_handler'])) {
	$twitter_handle = $_GET['twitter_handler'];
}*/
$getfield = '?screen_name='.$twitter_handle.'&count=10';
$requestMethod = 'GET';

$twitter = new TwitterAPIExchange($settings);
echo $twitter->setGetfield($getfield)
             ->buildOauth($url, $requestMethod)
             ->performRequest();

$jsonData = '';             

?>
