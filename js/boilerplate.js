function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
    
function boilerplateSetup(simidreq) {
    var apiKey = getCookie("tiquet_api_key");
    if (apiKey == ""){
        alert("ERROR! ApiKey not found. Please set it using the settings.");
        location.href = "https://tiquet.mosstuff.de/settings";
    }
    if (simidreq){
        var simId = getCookie("tiquet_sim_id");
        if (simId == ""){
            alert("ERROR! SimId required. Please set it using the settings.");
            location.href = "https://tiquet.mosstuff.de/settings";
        }
    }
}