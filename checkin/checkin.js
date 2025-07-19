async function onScanSuccess(decodedText, decodedResult) {
    // Extract the id parameter from the URL
    const urlParams = new URLSearchParams(decodedText.split('?')[1]);
    const id = urlParams.get('id');
    html5QrcodeScanner.pause();
    if (!id) {
        await new Audio('./error.mp3').play();
        alert("Invalid QR code!");
        html5QrcodeScanner.resume();
        return;
    }

    // Show the throbber (loading spinner)
    document.getElementById('throbber').style.display = 'block';

    // Make the API call
    fetch(`https://api.tiquet.mosstuff.de/api/v1/booking/checkin/${id}`, {
        method: 'POST',
        headers: {'access_token': apiKey}
    })
        .then(response => response.json())
        .then(data => {
            // Hide throbber
            document.getElementById('throbber').style.display = 'none';

            // Check response status
            if (data.status === 'success') {
                // Play a verifying sound
                new Audio('./correct.mp3').play();

                // Show success modal
                document.getElementById('modal-icon').innerHTML = '<i class="fas fa-check-circle" style="color: green; font-size: 4rem;"></i>';
                document.getElementById('modal-message').innerText = `Welcome, ${data.name}!`;
                document.getElementById('modal-message-2').innerText = `Activity ID: ${data.activity}`;
                document.getElementById('modal-header').innerText = `Welcome`;
                document.getElementById('modal-header-block').style.background = '#48c68e';
                document.getElementById('modal').style.display = 'block';
            } else {
                // Play an error sound
                new Audio('./error.mp3').play();

                // Show error modal
                document.getElementById('modal-icon').innerHTML = '<i class="fas fa-times-circle" style="color: red; font-size: 4rem;"></i>';
                document.getElementById('modal-message').innerText = `Error: ${data.status}`;
                document.getElementById('modal-message-2').innerText = ``;
                document.getElementById('modal-header').innerText = `Error!`;
                document.getElementById('modal-header-block').style.background = '#ff6585';
                document.getElementById('modal').style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('throbber').style.display = 'none';
            alert('An error occurred while processing your request.');
            html5QrcodeScanner.resume();
        });
}

function onScanFailure(error) {
    console.warn(`Code scan error = ${error}`);
}

let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: {width: 250, height: 250} },
    /* verbose= */ false
);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);

// Close the modal
document.getElementById('close-modal').addEventListener('click', function() {
    document.getElementById('modal').style.display = 'none';
    html5QrcodeScanner.resume();
});

document.addEventListener("DOMContentLoaded", () => {
    boilerplateSetup(false);
    new Audio('./correct.mp3').play();
    new Audio('./error.mp3').play();
});