// Helper functions

// Detect daylight savings

Date.prototype.stdTimezoneOffset = function() {
    var a = new Date(this.getFullYear(), 0, 1);
    var b = new Date(this.getFullYear(), 6, 1);
    return Math.max(a.getTimezoneOffset(), b.getTimezoneOffset());
}

Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

// String endsWith

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


// VARIABLES
var OPTIONS_OPEN = false;
var UPDATING_PAUSED = false;
var UPDATE_IN_PROGRESS = false;
var PAGE_UPDATE_IN = 0;
var TIME_BETWEEN_UPDATES = 300;
var MAX_RESULTS = 0;
var DEFAULT_RESULT_COUNT = 21;
var RESULT_COUNT = DEFAULT_RESULT_COUNT;
var LAUNCH_DATA = [];
var FIRST_UPDATE = true;
var ANIMATE_UPDATE = false;
var USER_SETTINGS = localStorage;
var HISTORY_MODE =  function() { var p = window.location.href; return p.endsWith("#history") || p.endsWith("history/"); }();
var SINGLE_MODE = function() { var p = window.location.href; return p.indexOf("/launch/") > -1; }();

var IS_INSIDE_LAUNCH = false;

var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
var BACKGROUNDS = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "8.jpg"];
var BACKGROUND_CLASSES = ["midnightCity", "sunrise", "horizon", "darkSkies", "frozen"];
var CURRENT_BACKGROUND = "";
var LAUNCH_TIMER_UTC_STRING = "{TIME} UTC";
var LAUNCH_TIMER_LOCAL_STRING = "{TIME} local";
var LAUNCH_COUNTDOWN_HOLDING_STRING = "HOLDING";
var LAUNCH_COUNTDOWN_TBD_STRING = "";
var LAUNCH_COUNTDOWN_POST_LAUNCH_STRING = "L+{TIME}";
var LAUNCH_COUNTDOWN_PRE_LAUNCH_STRING = "L-{TIME}";
var LAUNCH_COUNTDOWN_PRE_LAUNCH_THRESHOLD = 3600;
var LAUNCH_WINDOW_CLOSES_HTML = "<span class=\"hoverable\" title=\"Window Closes In\">WCI</span>: ";
var LAUNCH_NOEARLIERTHAN_HTML = "<span class=\"launch-NET\" title=\"No Earlier Than\">NET</span> ";
var LAUNCH_DAYLIGHTSAVINGS_HTML = " (<span class=\"launch-DST\" title=\"Daylight Savings Time\">DST</span>)";
var DEFAULT_COUNTDOWN_STRING = "";
var INSIDE_LAUNCH_MAX = 3600;
var INSIDE_LAUNCH_MIN = -3600;
var IS_INSIDE_LAUNCH = false;
var IS_DEBUG = false;
var SHOWMORE_DEFAULT_HTML = "<i class=\"fa fa-caret-down fa-fw\"></i>Show more launches<i class=\"fa fa-caret-down fa-fw\"></i>";
var SHOW_MORE_VISIBLE = false;

var SEARCH_GO_FUNCTION = function() { $(".loadIndicator").fadeIn(function() { updatePageInfo(); }); };
var SEARCH_INTERVAL_ID = 0;

var SETTINGS = ["use12HourTimes", "backgrounds"]; // So we can programatically create the options check boxes (because I don't want to do all that work manually D:)
var SETTINGS_DESC = {"use12hourtimes": "Use 12 hour time notation?", "backgrounds": "Disable randomised background colours*"};
var SETTINGS_PER_LINE = 2;

var popupNextID = 0;

// Set up the page and all the jQuery magic we need

$(document).ready(
    function() {
        /*setGradientBackground();*/
        createSettings();
        $(".searchBox").on("input propertychange paste", function() {
            //console.log("---> "+$(".searchBox").val());
            if (SEARCH_INTERVAL_ID != 0) { clearInterval(SEARCH_INTERVAL_ID); }
            SEARCH_INTERVAL_ID = setInterval(SEARCH_GO_FUNCTION, 500);
        })
        $(".pageOptions, .optionsClose").click(function(){OPTIONS_OPEN = !OPTIONS_OPEN; $(".optionsPane").slideToggle();});
        $(".playPause").click(function(){toggleUpdating();});
        $(".searchClear").click(function(){$(".searchBox").val("");updatePageInfo();UPDATE_IN_PROGRESS=true;updateTimers();UPDATE_IN_PROGRESS=false;})
        $(".historyButton").click(function(){switchMode();});
        $(".showMore").click(function(){showMore();});
        /*$("[class^='launch-']").click(function() { 
            var me = "."+$(this).attr('class').split(" ")[0];
            console.log(me);
            var id = me.split("-")[1];
            var iS = ".informationSpan-"+id;
            var dataH = $(iS).height();
            var fullHeight = $(me).height();
            
            console.log(fullHeight+" / "+dataH);
            
            var expanded = (fullHeight > dataH);
            
            console.log(expanded);
            
            $(me).css({overflow: 'hidden'});
            
            if (expanded) {
                var newHeight = (fullHeight - dataH);
                console.log(newHeight);
                $(me).animate({height: newHeight}, 600);
            }
            else {
                $(iS).css({display: 'block'});
                $(me).animate({height: (fullHeight + dataH)}, 600);
            }

        });*/
        
        if (window.location.href.indexOf("/beta/") > -1) { $("span.betaButton").hide(); }
        if (SINGLE_MODE) {
            $(".topBar").hide();
            $(".footer").hide();
            $("body, html").css({minWidth: "0px"});
        }
        
        if (HISTORY_MODE) { HISTORY_MODE = false; switchMode(); }
        else { getAPIData(); }
        if (!SINGLE_MODE) {
            setInterval(checkVersion, 1800000); /* 30 minutes */
        }
    }
);

function switchMode() {
    RESULT_COUNT = DEFAULT_RESULT_COUNT;
    if (SHOW_MORE_VISIBLE) { SHOW_MORE_VISIBLE = false; $(".showMore").slideToggle(); }
    HISTORY_MODE = !HISTORY_MODE;
    $(".historyButton").css({minWidth: "155px"});
    $(".pageTitle").fadeOut(
        function() { 
            $(".pageTitle").text($(".pageTitle").text().replace((HISTORY_MODE ? "Upcoming" : "Previous"), (HISTORY_MODE ? "Previous" : "Upcoming"))); 
        }
    );
    $(".historyButtonText").fadeOut(
        function() {
            $(".historyButton").animate({maxWidth: (HISTORY_MODE ? "165" : "155")+"px"}, 
                function() {
                    $(".historyButtonText").html($(".historyButtonText").html().replace((HISTORY_MODE ? "Previous" : "Upcoming"), (HISTORY_MODE ? "Upcoming" : "Previous")));
                    $(".historyButtonText").fadeIn();
                }
            );
        }
    );
    ANIMATE_UPDATE = true;
    $(".loadIndicator").fadeIn(function() { getAPIData(); });
    $(".pageTitle").fadeIn();
}

function showMore() {
    RESULT_COUNT += 4;
    $(".showMore").html("<img src=\""+$('.loadIndicator').attr('src')+"\" />");
    getAPIData();
    $(".showMore").html(SHOWMORE_DEFAULT_HTML);
    $("html, body").animate({scrollTop: $(".showMore").offset().top});
    checkShowMoreAvailable();
}

function checkShowMoreAvailable() {
    if (RESULT_COUNT >= MAX_RESULTS && SHOW_MORE_VISIBLE) { SHOW_MORE_VISIBLE = false; $(".showMore").slideToggle(); }
}

function getAPIURL() {
    if (HISTORY_MODE) { 
        return "//ipeer.auron.co.uk/launchschedule/api/1/launches/?history=true&orderby=launchtime&order=DESC&limit="+RESULT_COUNT+"&cutoff="+Math.floor(new Date().getTime() / 1000)+"&omitapidata=1";
    }
    else if (SINGLE_MODE) {
        // Get the requested ID
        var p = window.location.href;
        var id = p.split("/launch/")[1].replace("/", "");
        if (id == undefined || id == "next") {
            return "//ipeer.auron.co.uk/launchschedule/api/1/launches/?limit=1&omitapidata=1";
        }
        else {
            var num = parseInt(id);
            return "//ipeer.auron.co.uk/launchschedule/api/1/launches/?launchid="+num+"&omitapidata=1";
        }
    }
    else { 
        return "//ipeer.auron.co.uk/launchschedule/api/1/launches/?limit="+RESULT_COUNT+"&omitapidata=1";
    }
}

function getAPIData() {

	UPDATE_IN_PROGRESS = true;
	var _json = $.getJSON(getAPIURL())
    .done(
        function (data) {

            //console.log(data);
            //console.log("---> "+data['launches'].length);

            MAX_RESULTS = data['maxcount'];

            LAUNCH_DATA = data['launches'];

            if (FIRST_UPDATE || ANIMATE_UPDATE) { $(".launches").fadeOut(function() { updatePageInfo(); }); }
            else { updatePageInfo(); }

            UPDATE_IN_PROGRESS = false;
            PAGE_UPDATE_IN = TIME_BETWEEN_UPDATES;
            /*$(".loadIndicator").fadeOut();*/

	})
    .fail(
        function(xhr) {
            UPDATE_IN_PROGRESS = false;
            PAGE_UPDATE_IN = TIME_BETWEEN_UPDATES;
        });

}

function updatePageInfo() {

    var num = -1;
    var displayResults = 0;
    var fullHTML = "";
    var col = 0;
    
    for (var x = 0; x < LAUNCH_DATA.length; x++) {
        
        
        var launch = LAUNCH_DATA[x];
        if ($(".searchBox").val() != "" && !(searchMatches(launch['vehicle']) || searchMatches(launch['payload']) || (launch['hasTags'] && searchMatchesArray(launch['tags'])))) { continue; }
        displayResults++;
        num++;
        var id = x + 1;
        var thisHTML = "";
        var featured = /*x == 0*/num < 1;
        
        var delayed = launch['delayed'];
        
        if (!featured) { col++; } // Increment "column" number if we're not rendering featured
        
        if (!featured && col == 3) { // Close the launch "row"
            thisHTML += "</div>";
            col = 1;
        }

        if (!featured && col == 1) { // Start a launch "row" if we're not rendering the featured launch
            thisHTML += "<div class=\"launchesRow\">";
        }
    
        //console.log("------> "+col);
        thisHTML += "<div class=\"launchContainer\">"; // Open launch contriner
        
        thisHTML += "<div class=\"launch"+(featured?" featured":" small")+(delayed && !SINGLE_MODE?" net":"")+(SINGLE_MODE ?  " single" : "")+"\">"; // Open launch div
            
        
        thisHTML += "<div class=\"top\">"; // Open top div
            
        thisHTML += "<span class=\"rocket-"+id+"\">"; // open rocket
        thisHTML += launch['vehicle'];
             
        /*thisHTML += "<span class=\"location-"+id+"\">"; // open location
        thisHTML += "&nbsp;from: "+launch['location'];
        thisHTML += "</span>"; // close location*/
        // ^^ Doesn't look right, will maybe revisit
        
        
        thisHTML += "</span>"; // close rocket
        
            
        thisHTML += "<span class=\"payload-"+id+"\">";
        thisHTML += launch['payload'];
        thisHTML += "</span>";
            
        thisHTML += "</div>"; // Close top div
        
        var placeTagsDiv = (!featured || (featured && launch['hasTags']));
        if (placeTagsDiv) thisHTML += "<div class=\"tags\">"; // Open tags div

        if (launch['hasTags']) {
            
            
            var t = launch['tags'];
            t.forEach(function(e) { 
                
                thisHTML += "<span class=\"tag"+("titletext" in e ? " hoverable" : "")+"\""+("colour" in e ? " style=\"background-color: "+e['colour']+";\"" : "")+("titletext" in e ? "title=\""+e['titletext']+"\"" : "")+" data-title=\""+e['text']+"\">"; // Open tag span
                thisHTML += e['text'];
                thisHTML += "</span>"; // Close tag span
                
            });
            
            
        }
        
        if (placeTagsDiv) thisHTML += "</div>"; // Close tags div
            
        thisHTML += "<div class=\"bottom\">"; // Open bottom div
            
        thisHTML += "<div class=\"left\">"; // Left side of bottom div
            
        thisHTML += "<span class=\"countdown-"+id+"\">";
        if (FIRST_UPDATE) { thisHTML += "Calculating..."; }
        else { thisHTML += ($(".countdown-"+id).text() == "" ? "Calculating..." : checkCountdownLength(id, $(".countdown-"+id).html())); }
        thisHTML += "</span>";
        if (!launch['delayed'] && !launch['monthonlyeta']) {
            thisHTML += "<span class=\"windowinfo-"+id+"\">" // Open window info span
        
            thisHTML += getWindowString(launch);
        
            thisHTML += "</span>"; // close window info span
        }
            
        thisHTML += "</div>"; // Close left side bottom
            
        if (launch['hasStream'] || "url" in launch || launch['hasPressKit'] || launch['hasWeather']) {
                
            thisHTML += "<div class=\"right\">"; // Open bottom right side
        
            thisHTML += "<span class=\"links-"+id+"\">";
                
            if (launch['hasStream']) {
                var arr = launch['streamURLs'];
                arr.forEach(function(l) {
                    
                    var isYoutube = (l.indexOf("youtube.com") > -1 || l.indexOf("youtu.be") > -1);
                    if (!isYoutube && HISTORY_MODE) { return; }
                    var buttonClass = (isYoutube ? "fa-youtube-play" : "fa-tv");
                    //if (isYoutube) { buttonClass = "fa-youtube-play"; }
                    
                    thisHTML += "<a href=\""+l+"\" target=\"_blank\" title=\"Watch launch coverage\"><i class=\"launchIcon launchStream fa "+buttonClass+" fa-fw\"></i></a>";
                
                });
            }
                
            if ("url" in launch) {
                thisHTML += "<a href=\""+launch['url']+"\" target=\"_blank\" title=\"View payload information\"><i class=\"launchIcons payloadInfo fa fa-info-circle fa-fw\"></i></a>";
            }
            if (launch['hasWeather']) {
                
                thisHTML += "<a href=\""+launch['weatherURL']+"\" target=\"_blank\" title=\"View weather report\"><i class=\"launchIcon launchWeather fa fa-cloud fa-fw\"></i></a>";
                
            }
            if (launch['hasPressKit']) {
                
                thisHTML += "<a href=\""+launch['pressKitURL']+"\" target=\"_blank\" title=\"View presskit\"><i class=\"launchIcon launchPressKit fa fa-file-text fa-fw\"></i></a>";
                
            }
                
            thisHTML += "</span>";
                
            thisHTML += "</div>"; // Close bottom right side
                
        }
                    
        thisHTML += "</div>"; // Close bottom div
            
        thisHTML += "</div>"; // Close launch div
        
        thisHTML += "</div>"; // Close launch container
        
        fullHTML += thisHTML;
        
        console.log(fullHTML);
        
    }
    
    if (displayResults == 0) { fullHTML = "The search came up empty: "+$(".searchBox").val(); }
    else { fullHTML += "</tr></table>"; }
    
    if (SINGLE_MODE) {
        $(".launches").addClass("single");
    }
    
    $(".launches").html(fullHTML);
    
    // Clear interval of search polling if one has been performed
    if (SEARCH_INTERVAL_ID != 0) { clearInterval(SEARCH_INTERVAL_ID); SEARCH_INTERVAL_ID = 0; }
    
    if (FIRST_UPDATE || ANIMATE_UPDATE) {
        ANIMATE_UPDATE = false;
        $(".launches").fadeIn();
        updateTimers();
        if (FIRST_UPDATE) {
            setInterval(updateTimers, 1000);
        }
        FIRST_UPDATE = false;
    }
    $(".loadIndicator").fadeOut();
    if (RESULT_COUNT < MAX_RESULTS && !SHOW_MORE_VISIBLE && !SINGLE_MODE) { SHOW_MORE_VISIBLE = true; $(".showMore").slideToggle(); }

}

function searchMatches(queryText) {
    var searchWords = $(".searchBox").val().split(" ");
    // Remove search terms shorter than MIN_SEARCH_TERM_LENGTH
    /*for (var x = 0; x < searchWords.length; x ++) { 
        if (searchWords[x].length < SEARCH_MIN_WORD_LENGTH) { searchWords.splice(x, 1); }
    }*/
    for (x = 0; x < searchWords.length; x++) {
        var word = searchWords[x];
        if (searchWords[x] == "") { return false; }
        if (queryText.toLowerCase().indexOf(searchWords[x].toLowerCase()) > -1) {
            return true;
        }
    }
    return false;
}

function searchMatchesArray(arr) {
    for (x = 0; x < arr.length; x++) {
        if (arr[x]['text'].toLocaleLowerCase() == $(".searchBox").val().toLocaleLowerCase()) { return true; }
    }
    return false;
}

function applyMilitary(hour) {
	if (hour > 12 && USER_SETTINGS.use12HourTimes) { return (hour - 12); }
	return hour;
}

function pad(num) {
	if (num < 10) { return "0"+num; }
	return num;
}

function toggleUpdating() {
    var ctrl = $(".playPause");
    if (UPDATING_PAUSED) { UPDATING_PAUSED = false; ctrl.removeClass("fa-play"); ctrl.addClass("fa-pause"); }
    else { UPDATING_PAUSED = true; ctrl.removeClass("fa-pause"); ctrl.addClass("fa-play"); }
}

function getCountdownDay(launch) {
    
    var epoch = launch['launchtime_epoch'] * 1000;
    var date = new Date(epoch);
    var date_now = new Date();
    
    var week = Math.abs((date.getTime() - date_now.getTime())) >= (518400 * 1000);
    var delayed = launch['delayed'];
    var monthonly = launch['monthonlyeta'];
    
    if (delayed || monthonly) {
        if (monthonly) {
            return LAUNCH_NOEARLIERTHAN_HTML+MONTHS_LONG[date.getMonth()];
        }
        return MONTHS_LONG[date.getMonth()]+" "+ord(date.getDate());
    }
    else if (week) {
        
        var time = pad(applyMilitary(date.getHours()))+":"+pad(date.getMinutes())+":"+pad(date.getSeconds());
        if (time.endsWith(":00"))
            time = time.substr(0, time.length - 3);
        
        var day = MONTHS_LONG[date.getMonth()]+" "+ord(date.getDate());
        
        return time+" "+day;
    }
    else {
        var dayDiff = date.getDate() - date_now.getDate();
        var dayDesc = {"-1": "Yesterday", "0": "Today", "1": "Tomorrow"};
        var day = (dayDiff > -2 && dayDiff < 2 ? dayDesc[dayDiff] : DAYS[date.getDay()]);
        
        var time = pad(applyMilitary(date.getHours()))+":"+pad(date.getMinutes())+":"+pad(date.getSeconds());
        if (time.endsWith(":00"))
            time = time.substr(0, time.length - 3);
        
        return time+" "+day;
    }
    
}

function ord(n) {
    
    if (n == 11 || n == 12 || n == 13) { return n+"th"; }
    var endChar = n.toString().substr(n.toString().length - 1, 1);
    switch (endChar) {
        case "1":
            return n+"st";
        case "2":
            return n+"nd";
        case "3":
            return n+"rd";
    }
    return n+"th";
    
}
    

function updateTimers() {

	var active_launches = 0;

	for (var x = 0; x < LAUNCH_DATA.length; x++) {

		var id = x + 1;

		var launch = LAUNCH_DATA[x];
		//console.log("---> "+launchDatas.length);

		if (launch['holding']) { // launch is holding

			in_launch = true;
            var holding_string = LAUNCH_COUNTDOWN_HOLDING_STRING;
            if (launch['launchtime_epoch'] != launch['windowcloses_epoch'] && launch['windowcloses_epoch'] != undefined) {
                var w = launch['windowcloses_epoch'] * 1000;
                var wSecs = Math.floor((w - new Date().getTime()) / 1000);
                var wCloseTime = getCountdownString(wSecs);
                if (wSecs <= 0) { wCloseTime = "CLOSED"; }
                holding_string += " ("+LAUNCH_WINDOW_CLOSES_HTML+"<span class=\"launch-WindowTimer\"> "+wCloseTime+"</span>)";
            }
			$(".countdown-"+id).html(holding_string);
            active_launches++;
			continue;

		}

		if (launch['delayed']) { // launch is delayed

			$(".countdown-"+id).html((!launch['monthonlyeta']?LAUNCH_NOEARLIERTHAN_HTML:"")+" "+getCountdownDay(launch));
			continue;

		}


		var e = launch['launchtime_epoch'] * 1000;
		var d = new Date();
		var secs = Math.floor((e - d.getTime()) / 1000);
		var l = secs < 0;
		if ((secs >= INSIDE_LAUNCH_MIN && secs <= INSIDE_LAUNCH_MAX)) { active_launches++; }
        
		secs = Math.abs(secs);
        
        var tString = "";
        
        if (secs > 86400) { 
            var tString = getCountdownDay(launch);
            $(".countdown-"+id).html(checkCountdownLength(id, tString));
            continue;
        }

		var time = getCountdownString(secs);
        if (launch['launchtime_epoch'] != launch['windowcloses_epoch'] && launch['windowcloses_epoch'] != undefined) {
            
            var w = launch['windowcloses_epoch'] * 1000;
            var wSecs = Math.floor((w - d.getTime()) / 1000);
            var wCloseTime = getCountdownString(wSecs);
            if (wSecs <= 0) { wCloseTime = "CLOSED"; }
            time += " ("+LAUNCH_WINDOW_CLOSES_HTML+"<span class=\"launch-WindowTimer\">"+wCloseTime+"</span>)";
            
        }
		if (l) { tString += LAUNCH_COUNTDOWN_POST_LAUNCH_STRING.replace("{TIME}", time); }
		else if (secs < LAUNCH_COUNTDOWN_PRE_LAUNCH_THRESHOLD) { tString += LAUNCH_COUNTDOWN_PRE_LAUNCH_STRING.replace("{TIME}", time); }
		else { tString = time; }
		
		//console.log("---> "+tString);
        if (secs >= 3600) {
            //tString = getCountdownDay(launch)+" / "+tString;
            tString = getCountdownDay(launch)+" &dash; "+tString;
        }

		$(".countdown-"+id).html(checkCountdownLength(id, tString));


	}
    
    var in_launch = active_launches > 0;

	if (in_launch && !IS_INSIDE_LAUNCH && !SINGLE_MODE) {
        
		IS_INSIDE_LAUNCH = true;
		TIME_BETWEEN_UPDATES = 60;
		if (PAGE_UPDATE_IN > 60) { PAGE_UPDATE_IN = 60; }
		$("div.launchNotification").slideToggle();

	}

	else if (!in_launch && IS_INSIDE_LAUNCH && !SINGLE_MODE) {

		IS_INSIDE_LAUNCH = false;
		TIME_BETWEEN_UPDATES = 300;
		$("div.launchNotification").slideToggle();

	}

	if (!UPDATING_PAUSED && !UPDATE_IN_PROGRESS) {

		if (!FIRST_UPDATE) { PAGE_UPDATE_IN--; }
		var mins = Math.floor((PAGE_UPDATE_IN % 3600) / 60);
		var secs = PAGE_UPDATE_IN % 60;
		var updateTime = pad(mins)+":"+pad(secs);
		$("span.updateTimer").html(updateTime);
		if (PAGE_UPDATE_IN == 0) {
			$(".loadIndicator").fadeIn(function() { getAPIData() });
		}
	}


}

function checkCountdownLength(id, data) {
    var length = (data.indexOf(LAUNCH_DAYLIGHTSAVINGS_HTML) > -1 ? data.length - LAUNCH_DAYLIGHTSAVINGS_HTML.length : data.length);
    if (id > 1 && length >= 35 && $(".countdown-"+id).hasClass("smallText") == false) {
        $(".countdown-"+id).addClass("smallText");
    }
    return data;
}

function getCountdownString(secs) {
    var hours = Math.floor(secs / 3600);
    var minutes = Math.floor((secs % 3600) / 60);
    var seconds = secs % 60;

	var days = Math.floor(hours / 24);
    hours = hours - (days * 24);

    var weeks = Math.floor(days / 7);
    days = days - (weeks * 7);

		//console.log("---> "+weeks+" "+days+" "+hours+" "+minutes+" "+seconds);

    var time = "";
    if (weeks > 0) { time += weeks+" "+(weeks == 1 ? "week" : "weeks")+", "; }
    if (days > 0) { time += days+" "+(days == 1 ? "day" : "days")+", "; }
    if (weeks == 0) { time += pad(hours)+":"+pad(minutes)+":"+pad(seconds); }
    else { time = time.substr(0, time.length - 2); }
    
    return time;
}

function getWindowString(launch) {
    
    if (launch['delayed'] || launch['monthonlyeta']) return "Unknown";
    
    var open = launch['windowopens_epoch'];
    var close = launch['windowcloses_epoch'];
    if (close == undefined || open == close) { return "Instantaneous"; }
    var wString = getCountdownString(close - open);
    if (wString.endsWith(":00"))
        wString = wString.substr(0, wString.length - 3);
    
    var date = new Date(launch['windowopens_epoch'] * 1000);
    
    var dateStr1 = pad(applyMilitary(date.getHours()))+":"+pad(date.getMinutes())+":"+pad(date.getSeconds());
    if (dateStr1.endsWith(":00"))
        dateStr1 = dateStr1.substr(0, dateStr1.length - 3);
    
    date = new Date(launch['windowcloses_epoch'] * 1000);
    
    var dateStr2 = pad(applyMilitary(date.getHours()))+":"+pad(date.getMinutes())+":"+pad(date.getSeconds());
    if (dateStr2.endsWith(":00"))
        dateStr2 = dateStr2.substr(0, dateStr2.length - 3);
    
    return dateStr1+"&dash;"+dateStr2+" ("+wString+")";
}

function checkVersion() {
    var currentVersion = $('meta[name=version]').attr("content");
    var pageType = window.location.href.split('?')[0].split('/launchschedule/')[1].slice(0, -1);
    if (pageType != "beta" && pageType != "") { pageType = "beta"; }
    if (pageType == "") { pageType = "stable"; }
    var _json = $.getJSON("//ipeer.auron.co.uk/launchschedule/api/1/version/")
    .done(
        function (data) {

            var newVersion = data[pageType]['full'];
            if (currentVersion != newVersion) { $("div.updateNotification").slideToggle(); }

	})
}

function createSettings() {
    var num = 1;
    var settingsHTML = "<table class=\"settings\"><td>";
    for (var x = 0; x < SETTINGS.length; x++) {
        if (num == 2) { settingsHTML += "</td><td>"; }
        var name = SETTINGS[x];
        var boolSetting = USER_SETTINGS['name'] || true;
        var thisHTML = "<input class=\"optionCheck\" type=\"checkbox\" id=\""+name+"\""+(boolSetting ? " checked=\"true\"" : "")+"><label class=\"optionsLabel\" for="+name+">"+SETTINGS_DESC[name.toLowerCase()]+"</label></input>"+(x != SETTINGS.length - 1 ? "<br />" : "");
        settingsHTML += thisHTML;
        $("input#"+name).click(function(e) { console.log("Hi!"); });
        num++;
    }
    settingsHTML += "</td></table>";
    $(".optionsCheckboxes").html(settingsHTML);
}

function spawnPopup() {
    var id = popupNextID++;
    var popupHTML = "<div class=\"popup\" id=\"popup-"+id+"\"><iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/FCCyVCvN2bo\" frameborder=\"0\" allowfullscreen></iframe></div>";
    var elm = (id == 0 ? $(".topBar") : $("#popup-"+(id-1)));
    $(popupHTML).insertAfter(elm);
    $(".popup").css("overflow: hidden");
    $("#popup-"+id).dialog(
        {
            width: "auto",
            height: "auto",
            title: "Some super awesome livestream"
        }
    );
}