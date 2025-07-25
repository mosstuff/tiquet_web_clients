async function fetchConfig() {
    try {
        const response = await fetch("https://api.tiquet.mosstuff.de/api/v1/config", {headers: {'access_token': apiKey}});
        if (!response.ok) throw new Error("Failed to fetch config");
        return await response.json();
    } catch (error) {
        console.error("Error fetching config:", error);
        return null;
    }
}

async function fetchTimeframesForActivity(activity) {
    try {
        const response = await fetch(`https://api.tiquet.mosstuff.de/api/v1/config/get_timeframe_by_activity?activity=${activity}`, {headers: {'access_token': apiKey}});
        if (!response.ok) throw new Error(`Failed to fetch timeslots for ${activity}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching timeslots for ${activity}:`, error);
        return [];
    }
}

async function fetchBookings() {
    try {
        const response = await fetch("https://api.tiquet.mosstuff.de/api/v1/booking/get_booking", {headers: {'access_token': apiKey}});
        if (!response.ok) throw new Error("Failed to fetch bookings");
        return await response.json();
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
}

async function handleAction(qrCode, action) {
    const endpoint = `https://api.tiquet.mosstuff.de/api/v1/booking/${action}/${qrCode}`;
    try {
        const response = await fetch(endpoint, { action,method: "POST", headers: {'access_token': apiKey}});
        if (!response.ok) throw new Error("Action failed");
        populateTables();
    } catch (error) {
        console.error(`Error performing ${action}:`, error);
    }
}

async function populateTables() {
    const config = await fetchConfig();
    const bookings = await fetchBookings();
    if (!config) return;

    const wrapper = document.getElementById("tableWrapper");
    wrapper.innerHTML = "";

    for (const activity of Object.keys(config.activities)) {
        const timeslots = await fetchTimeframesForActivity(activity);

        const container = document.createElement("div");
        container.className = "box";

        const title = document.createElement("h2");
        title.className = "title is-4";
        title.textContent = activity;
        container.appendChild(title);

        const table = document.createElement("table");
        table.className = "table is-striped";

        let headerRow = `<tr><th>Time</th><th>Status / Actions</th></tr>`;
        table.innerHTML += headerRow;

        timeslots.forEach(timeslot => {
            const booking = bookings.find(b => b.activity === activity && b.timeslot === timeslot);
            let row = `<tr><td>${timeslot}</td><td>`;

            if (booking) {
                row += `
                <span class="tag is-warning is-medium">Booked by: ${booking.name}</span>
                <span class="tag is-primary is-medium">Activity: ${booking.subactivity}</span>
                <div style="margin-top: 5px;">
                    <button class="button is-small is-primary" onclick="handleAction('${booking.qr_code}', 'checkin')">Check-In</button>
                    <button class="button is-small is-link" onclick="window.open('https://tiquet.mosstuff.de/info?id=${booking.qr_code}', '_blank')">Info</button>
                    <button class="button is-small is-danger" onclick="handleAction('${booking.qr_code}', 'delete_booking')">Delete</button>
                </div>
            `;
            } else {
                row += `<span class="tag is-success is-medium">Available</span>`;
            }

            row += `</td></tr>`;
            table.innerHTML += row;
        });

        container.appendChild(table);
        wrapper.appendChild(container);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    boilerplateSetup(false);
    populateTables();
});