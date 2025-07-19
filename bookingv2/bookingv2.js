// Global variables
boilerplateSetup(false);

let selectedTime = '';
let selectedPlaneId = '';
let selectedAirportId = '';
let selectedActivity = '';
let planes = {};
let airports = {};
let activities = {};

// Fetch data from API
async function fetchData(url) {
    try {
        const response = await fetch(url, {headers: {'access_token': apiKey}});
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return {};
    }
}

// Load initial data
async function loadData() {
    planes = await fetchData('https://api.tiquet.mosstuff.de/api/v1/config/planes');
    airports = await fetchData('https://api.tiquet.mosstuff.de/api/v1/config/airports');
    const config = await fetchData('https://api.tiquet.mosstuff.de/api/v1/config');
    activities = config.activities || {};

    populateDropdown('dropdown-content1', planes, 'selectedPlaneId', 'dropdownButton1', 'dropdown1');
    populateDropdown('dropdown-content2', airports, 'selectedAirportId', 'dropdownButton2', 'dropdown2');
}

// Populate dropdowns
function populateDropdown(dropdownContentId, items, variableName, buttonId, dropdownId) {
    const dropdownContent = document.getElementById(dropdownContentId);
    dropdownContent.innerHTML = '';

    Object.entries(items).forEach(([id, item]) => {
        const a = document.createElement('a');
        a.href = '#';
        a.classList.add('dropdown-item');
        a.textContent = item.name;
        a.addEventListener('click', function(event) {
            event.preventDefault();

            if (variableName === 'selectedPlaneId') {
                selectedPlaneId = id;
            } else if (variableName === 'selectedAirportId') {
                selectedAirportId = id;
            }

            document.getElementById(buttonId).innerHTML = `<span>${item.name}</span> <span class="icon is-small"><i class="fas fa-angle-down" aria-hidden="true"></i></span>`;
            document.getElementById(dropdownId).classList.remove('is-active');

            if (selectedPlaneId && selectedAirportId) {
                updateActivityDropdown();
            }
        });
        dropdownContent.appendChild(a);
    });
}

// Get compatible activities based on selected plane and airport
function getCompatibleActivities() {
    if (!selectedPlaneId || !selectedAirportId) return [];

    let planeCompat = planes[selectedPlaneId]?.compat || [];
    let airportCompat = airports[selectedAirportId]?.compat || [];

    return planeCompat.filter(sim => airportCompat.includes(sim));
}

function updateActivityDropdown() {
    let compatibleSimulators = getCompatibleActivities();
    const dropdownContent = document.getElementById('dropdown-content3');
    dropdownContent.innerHTML = '';

    if (compatibleSimulators.length > 0) {
        compatibleSimulators.forEach(simName => {
            const a = document.createElement('a');
            a.href = '#';
            a.classList.add('dropdown-item');
            a.textContent = simName;
            a.addEventListener('click', function(event) {
                event.preventDefault();
                selectedActivity = simName;
                document.getElementById('dropdownButton3').innerHTML = `<span>${simName}</span> <span class="icon is-small"><i class="fas fa-angle-down" aria-hidden="true"></i></span>`;
                document.getElementById('dropdown3').classList.remove('is-active');
                if (selectedActivity) {
                    updateTimeDropdown();
                }
            });
            dropdownContent.appendChild(a);
        });
    } else {
        dropdownContent.innerHTML = `<a href="#" class="dropdown-item">No compatible simulators</a>`;
    }
}

async function updateTimeDropdown() {
        const tfUrl = "https://api.tiquet.mosstuff.de/api/v1/config/get_timeframe_by_activity?activity=";
        const bookingUrl = "https://api.tiquet.mosstuff.de/api/v1/booking/get_booking";
        const urlParams = new URLSearchParams(window.location.search);

        try {
            document.getElementById("dropdownButton4").innerHTML = `
                    <span>Select Time</span>
                    <span class="icon is-small">
                        <i class="fas fa-angle-down" aria-hidden="true"></i>
                    </span>`;
        }catch{}

        try {
            const tfData = await fetchData(tfUrl + selectedActivity);
            const configData = await fetchData('https://api.tiquet.mosstuff.de/api/v1/config');
            const currentTime = configData.system_time;
            let availableTimeslots = tfData;

            // Filter out timeslots that have already passed
            availableTimeslots = availableTimeslots.filter(slot => slot > currentTime);

            // Fetch booking data
            const bookings = await fetchData(bookingUrl);

            // Remove timeslots that are already booked for the selected activity
            const bookedTimeslots = new Set(
                bookings
                    .filter(booking => booking.activity === selectedActivity)
                    .map(booking => booking.timeslot)
            );

            availableTimeslots = availableTimeslots.filter(slot => !bookedTimeslots.has(slot));

            // Populate dropdown with filtered timeslots
            const dropdownMenu = document.getElementById("dropdown-content4");
            dropdownMenu.innerHTML = ""; // Clear existing items

            availableTimeslots.forEach(slot => {
                const a = document.createElement("a");
                a.href = "#";
                a.className = "dropdown-item";
                a.dataset.value = slot;
                a.textContent = slot;
                a.addEventListener("click", function () {
                    selectedTime = slot;
                    document.getElementById("dropdownButton4").innerHTML = `
                    <span>${slot}</span>
                    <span class="icon is-small">
                        <i class="fas fa-angle-down" aria-hidden="true"></i>
                    </span>`;
                    document.getElementById("dropdown4").classList.remove("is-active");
                });
                dropdownMenu.appendChild(a);
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
}

// Event listeners for dropdown buttons
document.querySelectorAll('.dropdown-trigger button').forEach(button => {
    button.addEventListener('click', function(event) {
        event.stopPropagation();
        let dropdown = this.closest('.dropdown');
        dropdown.classList.toggle('is-active');
    });
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('is-active');
        }
    });
});

// Handle continue button click
function handleButtonClick() {
    const nameField = document.getElementById('name');
    const enteredName = nameField.value
    const codeField = document.getElementById('code');
    const enteredCode = codeField.value.trim();
    if (!selectedPlaneId || !selectedAirportId || !selectedActivity || !selectedTime || !enteredName || !enteredCode) {
        alert("Please fill out all fields!");
        return;
    }
    try {
        const url = new URL(enteredCode);
        const id = url.searchParams.get('id');

        if (!id) {
            alert("Invalid URL format. Please enter a valid ticket link.");
            return;
        }
        document.getElementById('continueButton').classList.add('is-loading');
        window.location.href = `finish.html?planeairportid=${encodeURIComponent(selectedAirportId)}${encodeURIComponent(selectedPlaneId)}&activity=${encodeURIComponent(selectedActivity)}&time=${selectedTime}&name=${enteredName}&code=${id}`;
    } catch (error) {
        alert("Invalid input. Please enter a valid URL.");
        return
    }
}

// Load data when the page loads
loadData();