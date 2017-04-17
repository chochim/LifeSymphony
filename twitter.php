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
    $tweet = $tweetObj['status'];
    $dateObj = $tweetObj['date'];
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

function cleanTweetArray($tweetArray, $searchTerm) {
    $cleaned = array();
    foreach($tweetArray as $user=>$tweet) {
        $cleanedTweet = cleanTweet($tweet, $searchTerm);  
        if(!isNullOrEmptyString($cleanedTweet)) {
            $cleaned[$user] = array('status'=>$cleanedTweet, 'date'=>$tweet['date']);
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

    $settings = array(
        'oauth_access_token' => "845508174216134656-6yShm1CJisjMNtnK4gYpYS1iFpu57qO",
        'oauth_access_token_secret' => "rnlTV3Udk8JdoV1U0oq0xBxhQSpcyhOm0zwgnxF2UUitg",
        'consumer_key' => "UnAkQ7LeyIKJTe5ZEK9FWrub5",
        'consumer_secret' => "ijtIkeyC2Rv3Hyn6f60m3JB1SZV4S5sOPMqs298dIV44NDjlRP"
    );
    $search_field = '?q='.urlencode('"'.$to_search.'"');
    $requestMethod = 'GET';
    try {
        $twitter = new TwitterAPIExchange($settings);
        $twitterResults =  json_decode($twitter->setGetfield($search_field)
                                    ->buildOauth($search_url, $requestMethod)
                                    ->performRequest(), true);

        //echo $twitterResults;    
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
    //$to_search='Trump is';
    echo getTwitterResultJson($to_search);
    
} else if($_SERVER['REQUEST_METHOD']==='GET') {
    echo getResultString(getTwitterResultJson(readSearchTermFromFile()));
}

?>