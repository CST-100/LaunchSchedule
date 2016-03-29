<?php

	/* TEMPORARY FILE - TO BE USED FOR TESTING PURPOSES ONLY */


    // CHANGE TO FULL PATHS IN PRODUCTION
    $checks = array();
    $checks[0] = "apis/launches.php";
    $checks[1] = "apis/pageversion.php";
    $checks[2] = "js/main.js";
    $checks[3] = "css/main.css";
    $checks[4] = "index.php";

    $vNames = array("API", "PAGEVER", "JS", "CSS", "INDEX");

    $versions = array();

    $x = 0;

    foreach ($checks as $c) {

        $hash = hash_file('crc32', $c);
        $versions[$vNames[$x]] = $hash;
        $x++;
        
    }

    if (defined('APP_RAN')) {
        die(json_encode($versions)); 
    }

    $str = "";
    foreach ($versions as $v) {
        $str = $str.(strlen($str) == 0 ? "" : ".").$v;
    }
    
    echo $str;

?>
    