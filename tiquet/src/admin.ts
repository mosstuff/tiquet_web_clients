import { fetchConfig, fetchTimeframesForActivity } from './api/config.ts';
import { fetchBookings, handleAction } from './api/booking.ts';

async function populateTables(): Promise<void> {
    const config = await fetchConfig();
    const bookings = await fetchBookings();

    if (!config) return;

    const wrapper = document.getElementById("tableWrapper");
    if (!wrapper) return;
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

        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `<th>Time</th><th>Status / Actions</th>`;
        table.appendChild(headerRow);

        timeslots.forEach(timeslot => {
            const booking = bookings.find(
                b => b.activity === activity && b.timeslot === timeslot
            );

            const row = document.createElement("tr");
            const timeCell = document.createElement("td");
            timeCell.textContent = timeslot;

            const actionCell = document.createElement("td");

            if (booking) {
                actionCell.innerHTML = `
                    <span class="tag is-warning is-medium">Booked by: ${booking.name}</span>
                    <span class="tag is-primary is-medium">Activity: ${booking.subactivity}</span>
                    <div style="margin-top: 5px;">
                        <button class="button is-small is-primary checkin-btn">Check-In</button>
                        <button class="button is-small is-link info-btn">Info</button>
                        <button class="button is-small is-danger delete-btn">Delete</button>
                    </div>
                `;

                actionCell.querySelector(".checkin-btn")?.addEventListener("click", () => {
                    handleAction(booking.qr_code, "checkin").then(populateTables);
                });

                actionCell.querySelector(".info-btn")?.addEventListener("click", () => {
                    window.open(`https://tiquet.mosstuff.de/info?id=${booking.qr_code}`, "_blank");
                });

                actionCell.querySelector(".delete-btn")?.addEventListener("click", () => {
                    handleAction(booking.qr_code, "delete_booking").then(populateTables);
                });

            } else {
                actionCell.innerHTML = `<span class="tag is-success is-medium">Available</span>`;
            }

            row.appendChild(timeCell);
            row.appendChild(actionCell);
            table.appendChild(row);
        });

        container.appendChild(table);
        wrapper.appendChild(container);
    }
}

document.addEventListener("DOMContentLoaded", populateTables);
