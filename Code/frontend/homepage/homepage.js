// This contains the code for the event admin's homepage

import { sendRequest, createNewEvent, logOut, sendFormData, showError } from '../components/app.js';
import { createReloadDialog, createEventDialog } from '../components/dialog.js';

export async function populateEvents(filter) {
    const response = await sendRequest("", "/get_events", "GET", () => {
        const error_dialog = createReloadDialog("An error occurred", "The server could not be contacted...Please reload the page.");
        error_dialog.showModal();
    });
    
    if (response && response.length !== 0) {
        // Hide the empty screen placeholder
        const empty_screen = document.querySelector(".empty-screen");
        empty_screen.classList.add("hidden");

        // Clear the events container
        const event_container = document.querySelector(".events-container");
        event_container.replaceChildren();
        
        // Create a new card for each event
        response.forEach(event => {
            // Convert the date into DD/MM/YYYY
            const date = new Date(event.event_date);
            const formatted_date = date.toLocaleDateString('en-GB');
            event.event_date = formatted_date;

            // Add a card for the event depending on the filter
            if (filter === "previous") {
                if (event.past === 'past') {
                    const event_el = createNewEvent(event);
                    event_container.appendChild(event_el);
                }
            } else if (filter === "upcoming") {
                if (event.past === '') {
                    const event_el = createNewEvent(event);
                    event_container.appendChild(event_el);
                }
            } else {
                const event_el = createNewEvent(event);
                event_container.appendChild(event_el);
            }
        });
    }
}

export function resetFilter() {
    document.querySelector('input[name="filter-events"][value="all"]').checked = true;
    document.querySelector('input[name="filter-events"][value="previous"]').checked = false;
    document.querySelector('input[name="filter-events"][value="upcoming"]').checked = false;
}

function filterEvents() {
    const pill_container = document.querySelector('.pill-container');

    pill_container.addEventListener('change', () => {
        const selected = document.querySelector('input[name="filter-events"]:checked').value;
        populateEvents(selected);
    });
}

// Intialise the home page once app.js is loaded on the correct page
if (document.querySelector('#app-js')) {
    document.querySelector('#app-js').addEventListener('load', () => {
        initHomepage();
    });
}

function initHomepage() {
    populateEvents();
    filterEvents();

    const log_out_btn = document.getElementById("log-out");
    log_out_btn.addEventListener("click", logOut);

    const create_event_btn = document.getElementById("create-event");
    create_event_btn.addEventListener('click', () => {
        const dialog = createEventDialog();
        dialog.showModal();

        // When the create button is pressed, submit the form
        const new_event_form = document.getElementById("new-event");

        new_event_form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = document.querySelector("#new-event #name").value;
            const date = document.querySelector("#new-event #date").value;
            const location = document.querySelector("#new-event #location").value;

            // Track if the form is valid
            let isValid = true;

            // Validate name
            if (name === "") {
                showError("name-error", "Name cannot be blank");
                isValid = false;
            }

            // Validate date
            if (isDateValid(date)) {
                showError("date-error", "The date is too far in the future");
                isValid = false;
            }

            if (date === "") {
                showError("date-error", "Date cannot be blank");
                isValid = false;
            }

            // Validate location
            if (location === "") {
                showError("location-error", "Location cannot be blank");
                isValid = false;
            }

            // If the form is valid, send the data
            if (isValid) {
                const response = await sendFormData(new_event_form, "/create_event", "POST", true);

                // Deal with a successful response
                try {
                    if (response) {
                        dialog.close();
                        dialog.remove();
                        populateEvents();
                    }

                } catch (error) {
                    // Catch other unforeseen errors
                    // Errors are handled in app.js
                }
            }

        });

    });
}

// Function to check if a date is valid
function isDateValid(date) {
    const limit = new Date("9999-12-31");
    const date_object = new Date(date);

    // Returns false if invalid, returns true if valid
    return date < limit;
}