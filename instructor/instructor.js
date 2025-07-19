let configCache = null;
async function getConfig() {
    const response = await fetch('https://api.tiquet.mosstuff.de/api/v1/config', {headers: {'access_token': apiKey}});
    return response.json();
}

async function fetchConfig() {
    if (configCache === null) {
        try {
            const response = await getConfig();
            configCache = response;
        } catch (error) {
            console.error('Failed to fetch config:', error);
            configCache = {};
        }
    }
    return configCache;
}

async function getTimeframe() {
    const response = await fetch('https://api.tiquet.mosstuff.de/api/v1/config/get_timeframe_by_activity?activity=' + simId, {headers: {'access_token': apiKey}});
    return response.json();
}

async function getBookings() {
    const response = await fetch('https://api.tiquet.mosstuff.de/api/v1/booking/get_booking', {headers: {'access_token': apiKey}});
    return response.json();
}

async function getRouteInfo() {
    const response = await fetch('https://api.tiquet.mosstuff.de/api/v1/routemanagement/getstr?activity=' + simId, {headers: {'access_token': apiKey}});
    return response.json();
}

function parseTimeString(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;  // Convert hours and minutes into total minutes since midnight
}

function findCurrentAndNextTimeslot(allTimeslots, systemTime) {
    const systemMinutes = parseTimeString(systemTime);

    for (let i = 0; i < allTimeslots.length; i++) {
        const [start, end] = allTimeslots[i].split(" - ").map(parseTimeString);

        if (systemMinutes >= start && systemMinutes < end) {
            return {
                current: allTimeslots[i],
                next: allTimeslots[i + 1] || "N/A"
            };
        }
    }

    return { current: "N/A", next: "N/A" };  // If no timeslot matches, return "N/A"
}

function populateCustomerData(slotData, elementPrefix, routeInfo) {
    document.getElementById(`${elementPrefix}-name`).textContent = slotData.name || "N/A";
    document.getElementById(`${elementPrefix}-airplane`).textContent = routeInfo.plane || "N/A";
    document.getElementById(`${elementPrefix}-airport`).textContent = routeInfo.airport || "N/A";
    const statusElement = document.getElementById(`${elementPrefix}-status`);
    const iconElement = document.getElementById(`${elementPrefix}-status-icon`);
    const iconIconElement = document.getElementById(`${elementPrefix}-status-icon-icon`);
    if(slotData.arrived !== undefined) {
        if (slotData.arrived) {
            statusElement.textContent = "Arrived";
            iconIconElement.classList.replace("fa-clock", "fa-check");
            iconIconElement.classList.replace("has-text-warning", "has-text-success");
        } else {
            statusElement.textContent = "Booked";
            iconIconElement.classList.replace("fa-check", "fa-clock");
            iconIconElement.classList.replace("has-text-success", "has-text-warning");
        }
    }else {
        statusElement.textContent = "N/A";
        iconIconElement.classList.replace("fa-check", "fa-clock");
        iconIconElement.classList.replace("has-text-success", "has-text-warning");
    }
}

async function initializePage() {
    const configData = await getConfig();
    const { system_time } = configData;
    const timeframe = await getTimeframe();
    const { current, next } = findCurrentAndNextTimeslot(timeframe, system_time);

    const bookings = await getBookings();
    const currentBooking = bookings.find(b => b.timeslot === current && b.activity === simId) || {};
    const nextBooking = bookings.find(b => b.timeslot === next && b.activity === simId) || {};

    const routeInfo = await getRouteInfo();

    populateCustomerData(currentBooking, "current", routeInfo.current);
    populateCustomerData(nextBooking, "next", routeInfo.next);
}

async function updateTimer() {
    const timerElement = document.getElementById('timer');
    const currentTime = new Date();

    try {
        const config = await fetchConfig();
        const offset = config?.activities[simId]?.offset || 0;

        const currentMinutes = currentTime.getMinutes();
        const currentSeconds = currentTime.getSeconds();

        const cycleStart = offset; // The start of each cycle
        const cycleLength = 10; // Cycle every 10 minutes

        const minutesSinceCycleStart = (currentMinutes - cycleStart + cycleLength) % cycleLength;
        const remainingSeconds = (cycleLength - minutesSinceCycleStart) * 60 - currentSeconds;
        const remainingMinutes = Math.floor(remainingSeconds / 60);
        const formattedSeconds = remainingSeconds % 60;

        timerElement.textContent = `${remainingMinutes.toString().padStart(2, '0')}:${formattedSeconds.toString().padStart(2, '0')}`;

        if (remainingMinutes < 1) {
            timerElement.classList.add('has-text-danger');
        } else {
            timerElement.classList.remove('has-text-danger');
        }
    } catch (error) {
        console.error('Failed to update timer:', error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    let configCache = null;
    const activityNameElement = document.getElementById(`sim-id`);
    boilerplateSetup(true);
    activityNameElement.textContent = `${simId}`;
    initializePage();
    updateTimer();
    setInterval(updateTimer, 1000);
    setInterval(initializePage, 10000);
});