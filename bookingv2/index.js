boilerplateSetup(false);
fetch("https://api.tiquet.mosstuff.de/api/v1/state/booking/1/set/promo", {headers: {'access_token': apiKey}});
function animateProgress($progressBar, val, currentVal) {
    currentVal = currentVal || 0;
    var step = val * 16 / 500;
    function animate(currentVal) {
        currentVal += step;
        $progressBar.val(currentVal);
        currentVal < val && requestAnimationFrame(function() {
            animate(currentVal);
        });
    }
    animate(currentVal);
}
async function handleButtonClick() {
    const button = document.getElementById('startButton');
    animateProgress($('#progress'), 50);
    button.classList.add('is-loading');
    await fetch("https://api.tiquet.mosstuff.de/api/v1/state/booking/1/set/table", {headers: {'access_token': apiKey}});
    window.location.href = 'booking.html';
}