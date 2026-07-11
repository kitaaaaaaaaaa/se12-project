// This file contains all the code for the event card web component
// which displays an event and its details for admins.
// It includes any functions related to it.
// ---------------------------------------------------------------------------

import { sendRequest } from "./app.js";
import { createDeleteConfirmation } from "./dialog.js";
import { populateEvents, resetFilter, saveEventId } from "../homepage/homepage.js";

// Create a web component for an event card
export class eventCard extends HTMLElement {
    // Run this code when the component is added to the page
    connectedCallback() {
        const event_name = this.getAttribute("event-name");
        const event_date = this.getAttribute("event-date");
        const event_location = this.getAttribute("event-location");
        const past = this.getAttribute("past");

        this.innerHTML = `
            <div class="event-card">
                <h2 class="figtree-medium">${event_name}</h2>
                <div class="event-information grid-container">
                    <div class="event-details flex-container">
                        <span class="secondary-text-clr">
                            <i class="fa-regular fa-calendar"></i> ${event_date}
                        </span>
                        <span class="secondary-text-clr">
                            <i class="fa-solid fa-location-dot"></i> ${event_location}
                        </span>
                    </div>
                    <div class="event-actions">
                        <button type="button" class="play-button">
                            <i class="fa-solid fa-play" style="color: #d4f6a8;"></i>
                        </button>

                        <button type="button" class="edit-button">
                            <i class="fa-solid fa-pencil"></i>
                        </button>

                        <button type="button" class="del-button">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </div>
                <div class="event-indicator ${past}"></div>
            </div>
        `;
        const play_button = this.querySelector(".play-button");
        const edit_button = this.querySelector(".edit-button");
        const del_button = this.querySelector(".del-button");

        play_button.addEventListener("click", () => {
            // Save event id in session storage
            const event_id = this.getAttribute("event-id");
            saveEventId(event_id);

            // Redirect the user to the admin live view page
            window.location.href = "/admin/admin.html";
        });

        edit_button.addEventListener("click", () => {
            // Save event id in session storage
            const event_id = this.getAttribute("event-id");
            saveEventId(event_id);

            // Redirect the user to the edit page
            window.location.href = "/edit/edit.html";
        });

        del_button.addEventListener("click", () => {
            // Add a confirmation box
            const event_data = this.getEventData();

            const confirm = createDeleteConfirmation("Are you sure?", `Would you like to delete '${event_data.event_name}'?`);
            confirm.showModal();
            
            confirm.querySelector('.dialog-submit').addEventListener('click', async () => {
                // Send a request to the server to delete the event
                const response = await sendRequest(event_data.event_id, "/delete_event", "DELETE");

                try {
                    if (response.message) {
                        // Refresh the UI if the request is successful
                        confirm.close();
                        confirm.remove();
                        resetFilter();
                        populateEvents();
                    }
                } catch (error) {
                    // Catch unforeseen errors
                    // Errors are already handled in app.js
                }
            });
            
        });
    }

    getEventData() {
        const event_id = this.getAttribute("event-id");
        const event_name = this.getAttribute("event-name");
        const event_date = this.getAttribute("event-date");
        const event_location = this.getAttribute("event-location");
        const past = this.getAttribute("past");
        return {
            "event_id": event_id,
            "event_name": event_name,
            "event_date": event_date,
            "event_location": event_location,
            "past": past
        };
    }
}
if (typeof customElements !== 'undefined') {
    customElements.define("event-card", eventCard);
}