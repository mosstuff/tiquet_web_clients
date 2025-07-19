boilerplateSetup(false);
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        activity: urlParams.get('activity'),
        subactivity: urlParams.get('planeairportid'),
        timeslot: urlParams.get('time'),
        name: urlParams.get('name'),
        qr_code: urlParams.get('code'),
        arrived: false
    };
}
function populateTableFields() {
    const params = getUrlParams();
    if (params.activity) document.getElementById('activityField').innerText = params.activity;
    if (params.subactivity) document.getElementById('subactivityField').innerText = params.subactivity;
    if (params.timeslot) document.getElementById('timeField').innerText = params.timeslot;
    if (params.name) document.getElementById('nameField').innerText = params.name;
    if (params.qr_code) document.getElementById('codeField').innerText = params.qr_code;
}
async function handleButtonClick() {
    const button = document.getElementById('submitButton');
    button.classList.add('is-loading');
    await fetch("https://api.tiquet.mosstuff.de/api/v1/booking/create_booking", {
        method: "POST",
        body: JSON.stringify(getUrlParams()),
        headers: {
            'access_token': apiKey
        }
    });
    window.location.href = 'index.html';
}
window.onload = populateTableFields;