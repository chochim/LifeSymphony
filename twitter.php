<?php
error_reporting(E_ALL); 
ini_set('display_errors', 1);

require_once('TwitterAPIExchange.php');

$url = "https://api.twitter.com/1.1/statuses/user_timeline.json";
$search_url = "https://api.twitter.com/1.1/search/tweets.json";
$search_term = 'search_term';

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
    $split_sentences = '%(?#!php/i split_sentences Rev:20160820_1800)
    # Split sentences on whitespace between them.
    # See: http://stackoverflow.com/a/5844564/433790
    (?<=          # Sentence split location preceded by
      [.!?]       # either an end of sentence punct,
    | [.!?][\'"]  # or end of sentence punct and quote.
    )             # End positive lookbehind.
    (?<!          # But don\'t split after these:
      Mr\.        # Either "Mr."
    | Mrs\.       # Or "Mrs."
    | Ms\.        # Or "Ms."
    | Jr\.        # Or "Jr."
    | Dr\.        # Or "Dr."
    | Prof\.      # Or "Prof."
    | Sr\.        # Or "Sr."
    | T\.V\.A\.   # Or "T.V.A."
                 # Or... (you get the idea).
    )             # End negative lookbehind.
    \s+           # Split on whitespace between sentences,
    (?=\S)        # (but not at end of string).
    %xi';  // End $split_sentences.
    if (strpos($tweet, $searchTerm)) {
        //find the sentence-end after the search term
        $sentenceEnd = substr($tweet, strpos($tweet, $searchTerm), strlen($tweet));
        //search for full-stop or the end
        $sentences = preg_split($split_sentences, $sentenceEnd, -1, PREG_SPLIT_NO_EMPTY);
        return $sentences[0];
    } else {    
        //check if serachTerm is contained in the tweet
        return '';
    }
}

function isNullOrEmptyString($question){
    return (!isset($question) || trim($question)==='');
}

function cleanTweetArray($tweetArray, $searchTerm) {
    $cleaned = array();
    foreach($tweetArray as $user=>$tweet) {
        $cleanedTweet = cleanTweet($tweet, $searchTerm);  
        if(!isNullOrEmptyString($cleanedTweet)) {
            $cleaned[$user] = $cleanedTweet;
        }        
    }
    return $cleaned;
}

function isJson($string) {
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}

function getTweetsFromJson($jsonObj) {
    $tweets = array();
    echo '<pre>';
    echo $jsonObj;
	$userStatus = json_decode($jsonObj['statuses']);
    echo $userStatus;
    foreach($userStatus as $status) {
        $tweets[$status['user']['screen_name']] = $status['text'];
    }
    return $tweets;
}

$to_search = '';
if(isset($_GET[$search_term])) {
	$to_search = '"'.$_GET[$search_term].'"';
}
$search_field = '?q='.urlencode($to_search);

//$getfield = '?screen_name='.$twitter_handle.'&count=10';
$requestMethod = 'GET';

$twitter = new TwitterAPIExchange($settings);
/*echo '<pre>';
echo $search_field.'<br />';*/
$twitterResults =  $twitter->setGetfield($search_field)
                        ->buildOauth($search_url, $requestMethod)
                        ->performRequest();
echo '<pre>';
$result = getTweetsFromJson($twitterResults);
$result = cleanTweetArray($result, "Trump is");
foreach($result as $user=>$tweet) {    
    echo $user.'=>'.$tweet.'<br />';    
}

?>