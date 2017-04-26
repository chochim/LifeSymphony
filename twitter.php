<?php
error_reporting(E_ALL); 
ini_set('display_errors', 1);

date_default_timezone_set('America/New_York');

require_once('TwitterAPIExchange.php');

function getJsonFromFile($fileName) {
	$string = file_get_contents($fileName);
	return json_decode($string, true);
}

function cleanTweet($tweetObj, $searchTerm) {  
    $firstSearchTerm = explode(' ', $searchTerm);
    $tweet = $tweetObj['status'];    
    $start = stripos($tweet, $firstSearchTerm[0]);//case insensitive
    return substr($tweet, $start);  
}

function readSearchTermFromFile() {
    $filename = 'search.txt';
    $searchTerm = '';
    if(file_exists($filename)) {
        $file = fopen($filename, 'r');
        $searchTerm = fread($file, filesize($filename));
        fclose($file);        
    }
    return $searchTerm;
}

function isNullOrEmptyString($question){
    return (!isset($question) || trim($question)==='');
}

function removeURLFromTweet($tweet) {
    // taken from http://daringfireball.net/2010/07/improved_regex_for_matching_urls
    $urlRegex = '~(?i)\b((?:[a-z][\w-]+:(?:/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:\'".,<>?«»“”‘’]))~';
    return preg_replace($urlRegex, '', $tweet); // remove urls
}

function cleanTweetArray($tweetArray, $searchTerm) {
    $cleaned = array();
    foreach($tweetArray as $user=>$tweet) {
        $cleanedTweet = cleanTweet($tweet, $searchTerm);  
        if(!isNullOrEmptyString($cleanedTweet)) {
            $cleaned[$user] = array('status'=>removeURLFromTweet($cleanedTweet), 'date'=>$tweet['date']);
        }        
    }
    return $cleaned;
}

function isJson($string) {
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}

function convert_date_to_est($date) {
    //$date = 'Thu Mar 30 23:49:06 +0000 2017';
    $time = strtotime(substr($date, 0, 20));
    $dateInLocal = date("Y-m-d H:i:s", $time);
    $year = substr($dateInLocal,0,10);
    $time = substr($dateInLocal, 11, 20);
    return array('day'=>$year, 'time'=>$time);
}

function getTweetsFromJson($jsonObj) {
    $tweets = array();    
    if(array_key_exists('statuses', $jsonObj)) {
    	$userStatus = $jsonObj['statuses'];       
        foreach($userStatus as $status) {
            //$tweets[$status['user']['screen_name']] = $status['text'];
            $date = convert_date_to_est($status['created_at']);      
            $tweets[$status['user']['screen_name']] =  array('status'=>$status['text'], 'date'=>$date);
        }
    }
    return $tweets;
}

function getTwitterResultJson($to_search) {
    $url = "https://api.twitter.com/1.1/statuses/user_timeline.json";
    $search_url = "https://api.twitter.com/1.1/search/tweets.json";  
    $result_count = 100;  

    $settings = array(
        'oauth_access_token' => "845508174216134656-6yShm1CJisjMNtnK4gYpYS1iFpu57qO",
        'oauth_access_token_secret' => "rnlTV3Udk8JdoV1U0oq0xBxhQSpcyhOm0zwgnxF2UUitg",
        'consumer_key' => "UnAkQ7LeyIKJTe5ZEK9FWrub5",
        'consumer_secret' => "ijtIkeyC2Rv3Hyn6f60m3JB1SZV4S5sOPMqs298dIV44NDjlRP"
    );
    $search_field = '?q='.urlencode('"'.$to_search.'"');    
    $search_field .= '&count='.$result_count;
    $search_field .= '&lang=en';
    $requestMethod = 'GET';
    try {
        $twitter = new TwitterAPIExchange($settings);
        $twitterResults =  json_decode($twitter->setGetfield($search_field)
                                    ->buildOauth($search_url, $requestMethod)
                                    ->performRequest(), true);
        $result = getTweetsFromJson($twitterResults);
        $cleanedResult = cleanTweetArray($result, $to_search);
        return json_encode(array('error' => NULL, 'result'=>$cleanedResult));
    } catch (Exception $ex) {
        return json_encode(array('error' => $ex->getMessage()));
    }
}

function isError($jsonObj) {
    return $jsonObj["errors"][0]["message"] != "";
}

function getResultString($twitterJson) {
    $jsonObj = json_decode($twitterJson);
    $resultArray = array();
    if(is_null($jsonObj->error)) {
        $resultObj = $jsonObj->result;
        foreach ($resultObj as $handle => $tweetObj) {
            $dateObj = $tweetObj->date;
            $resultArray[] = $tweetObj->status.'|'.$dateObj->day;
        }
        return implode('$$', $resultArray);
    } else {
        return 'Error: '+$jsonObj['error'];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $to_search = '';
    $search_term = 'search_term';
    if(isset($_POST[$search_term])) {
        $to_search = $_POST[$search_term];
    }    
    echo getTwitterResultJson($to_search);    
} else if($_SERVER['REQUEST_METHOD'] === 'GET') {
    $to_search = '';
    $search_term = 'search_term';    
    if(isset($_GET[$search_term])) {
        $to_search = $_GET[$search_term];
    }
    /*if(isset($_GET['year'])) {
        $year = intval($_GET['year']);
    }*/
    //echo getTwitterResultJson($to_search);
    echo getResultString(getTwitterResultJson($to_search));
}

?>