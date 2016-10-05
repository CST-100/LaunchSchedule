var CHANGE_HISTORY_API_URL = "//ipeer.auron.co.uk/launchschedule/api/1/changes/";

$(document).ready(

    function() {
        
        getChangeData();
        
    }
    
)

function getChangeData() {
    
    
    var _json = $.getJSON(CHANGE_HISTORY_API_URL)
    .done(
        function (data) 
        {
            var c = data["change_list"];
            var html = "";
            for (var x = 0; x < c.length; x++) {
                var e = c[x];
                var event = e["event"];
                var time = e["time"];
                var rocket = e["rocket_name"];
                var payload = e["payload_name"];
                var lID = e["launchid"];
                
                html += "<div class=\"change-entry\">"; // Open change entry div
                html += "<div class=\"change-type\">";
                html += "<span class=\"change-type\">"+event+"</span>";
                html += "<span class=\"change-date\">"+time+"</span>";
                html += "</div>";
                
                html += "<div class=\"change-data\">"; // Open change data div
                
                html += "<span class=\"affected-id\">Launch ID: "+lID+"</span>";
                html += "<span class=\"affected-rn\">Rocket name: "+rocket+"</span>";
                html += "<span class=\"affected-pl\">Payload: "+payload+"</span>";
                
                html += "<div class=\"change-list\">"; // Open change list div
                
                
                if (event == "DELETE") {
                
                    html += "<span class=\"change-entry\">";
                    
                    /*Object.keys(e["data"]).forEach(
                    
                        function (key) { 
                            
                            html += "<span class=\"change-entry\">";
                            html += code(key)+": "+old(e["data"][key]);
                            html += "</span>";
                            
                        }
                        
                    );*/
                    
                    html += old("This entry was removed from the database");
                    html += "</span>";
                
                }
                else if (event == "CREATE") {
                    
                    Object.keys(e["data"]).forEach(
                    
                        function (key) { 
                            
                            html += "<span class=\"change-entry\">";
                            if (key == "windowclose" || key == "windowopens" || key == "launchtime") {
                                html += code(key)+": "+formatTimes(e["data"][key], false);
                            }
                            else {
                                html += code(key)+": "+_new(e["data"][key]);
                            }
                            html += "</span>";
                            
                        }
                        
                    );
                    
                }
                else if (event == "UPDATE") {
                    
                    for (var k in e["changes"]) {
                        html += "<span class=\"change-entry\">";
                        if (k == "windowclose" || k == "windowopens" || k == "launchtime") {
                            html += code(k)+": "+formatTimes(e["changes"][k]["old"], true)+" <i class=\"fa fa-long-arrow-right\"></i> "+formatTimes(e["changes"][k]["new"], false);
                        }
                        else if (k == "tags" || k == "streamurl") {
                            html += code(k)+": ";
                            html += "<div class=\"list-change-list\">";
                            for (var lc in e["changes"][k]["added"]) {
                                var _s = e["changes"][k]["added"][lc];
                                html += "<span class=\"code list-change-item-added\"><i class=\"fa fa-plus-circle\"></i>"+_s+"</span>";
                            }
                            
                            for (var lc in e["changes"][k]["removed"]) {
                                var _s = e["changes"][k]["removed"][lc];
                                html += "<span class=\"code list-change-item-removed\"><i class=\"fa fa-minus-circle\"></i>"+_s+"</span>";
                            }
                            
                            html += "</div>";
                        }
                        else {
                            html += code(k)+": "+old(e["changes"][k]["old"])+" <i class=\"fa fa-long-arrow-right\"></i> "+_new(e["changes"][k]["new"]);
                        }
                        html += "</span>";
                        
                    }
                    
                }
                
                html += "</div>"; // Close change list div
                
                html += "</div>"; // Close change data div
                
                html += "</div>"; // Close change entry div
                
            }
            
            if (html == "") {
                html += "<div class=\"no-history\">";
                html += old("There is no history to display");
                html += "</div>";
            }
            
            $("div.page").html(html);

        }
    )
    .fail(
        function(xhr) {

            
            
        }
    );
    
}

function formatTimes(_time, _old) {
    var d = new Date(0);
    d.setUTCSeconds(_time);
    var str = (_old ? old(_time) : _new(_time));
    str += " <span class=\"change-date-string\">("+d.toISOString().slice(0, 19)+"Z)</span>";
    return str;
}

function code(string) {
    return "<span class=\"code\">"+string+"</span>";
}

function old(string) {
    if (string == "") { string = "{blank field}"; }
    return "<span class=\"code change-old-value\">"+string+"</span>";
}

function _new(string) {
    if (string == "") { string = "{blank field}"; }
    return "<span class=\"code change-new-value\">"+string+"</span>";
}