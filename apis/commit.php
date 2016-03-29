<?php


    $l = file("../commit");
    $hash = str_replace(array('\r','\n',"\r","\n"), '', $l[1]);


    $v = array();
    $v['full'] = $hash;
    $v['short'] = substr($hash, 0, 7);
    header("Content-Type: application/json");
    die(json_encode($v)); 


?>
    