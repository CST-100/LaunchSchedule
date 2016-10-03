<?php

    $f=file("commit");
    $shash = str_replace(array("\n", "\r"), "", $f[0]);
    $lhash = $f[1];

?>
<!DOCTYPE html>
<html>
<head>
<meta name="description" content="A list of upcoming rocket launches"/>
<meta name="keywords" content="iPeer,Space,Flight,Rocket,Launch,Countdown,Timer"/>
<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="version" content="<?php echo $lhash; ?>" />
<link rel="stylesheet" type="text/css" href="css/history.css?v=<?php echo $shash ?>"/>
<link rel="stylesheet" type="text/css" href="css/font-awesome.min.css"/>
<link href='//fonts.googleapis.com/css?family=Lato' rel='stylesheet' type='text/css'>
<title>Upcoming Rocket Launch countdowns - Update history</title>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
<script src="js/history.js?v=<?php echo $shash ?>"></script>
</head>
<body>
    
    <div class="schedule-link">
    
        <a href="../"><i class="fa fa-long-arrow-left"></i> Back to Launch Schedule</a>
        
    </div>
    
    <div class="page">
    
        <div class="no-history">
            Acquiring history data, please stand by...
        </div>
        
    </div>
    
</body>
</html>