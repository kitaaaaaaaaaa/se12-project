// This contains the code for the event admin's homepage

import { sendRequest, createNewEvent, logOut } from '../components/app.js';
import { createReloadDialog } from '../components/dialog.js';

async function populateEvents() {
    const response = await sendRequest("", "/get_events", "GET", () => {
        const error_dialog = createReloadDialog("An error occurred", "The server could not be contacted...Please reload the page.");
        error_dialog.showModal();
    });
    
    if (response && response.length !== 0) {
        const empty_screen = document.querySelector(".empty-screen");
        empty_screen.classList.add("hidden");
        
        // Create a new card for each event
        response.forEach(event => {
            const event_el = createNewEvent(event);
            const event_container = document.querySelector(".events-container");
            event_container.appendChild(event_el);
        });
    }
}

const log_out_btn = document.getElementById("log-out");

log_out_btn.addEventListener("click", logOut);

populateEvents();