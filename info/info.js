async function fetchBookingData(id) {
    try {
        const response = await fetch(`https://api.tiquet.mosstuff.de/api/v1/booking/get_booking/${id}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching booking data:', error);
        return null;
    }
}

function getIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function populateTableFields() {
    const id = getIdFromUrl();
    if (!id) {
        console.error('No id parameter provided in the URL');
        return;
    }

    const bookingData = await fetchBookingData(id);
    if (!bookingData) return;

    document.getElementById('activityField').innerText = bookingData.activity || 'ERROR';
    document.getElementById('subactivityField').innerText = bookingData.subactivity || 'ERROR';
    document.getElementById('timeField').innerText = bookingData.timeslot || 'ERROR';
    document.getElementById('nameField').innerText = bookingData.name || 'ERROR';
}

window.onload = populateTableFields;