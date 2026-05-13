// This file contains all the code for the main components, alongside any functions that may be required
// or used across the web application.

import './eventCard.js';
import './stepCard.js';
import './editStepCard.js';

// Function to show a loading screen
export function showLoading() {
    const screen = document.createElement('div');
    screen.id = "loading-screen";
    screen.classList.add("loading");

    const anim = document.createElement('div');
    anim.classList.add("loading-anim");
    screen.appendChild(anim);
    document.body.appendChild(screen);
}

// Function to hide a loading screen
export function hideLoading() {
    document.getElementById("loading-screen").remove();
}

// Functino to create a new event card
function createNewEvent(eventjson) {
    // Use given event data to create a new event card
    const new_event = document.createElement("event-card");
    new_event.setAttribute("event-name", eventjson.name);
    new_event.setAttribute("event-date", eventjson.date);
    new_event.setAttribute("event-location", eventjson.location);
    new_event.setAttribute("past", eventjson.past);
    return new_event;
}

export function updateHeaderDate() {
    const date_element = document.querySelector("header span");
    const current_date = new Date();
    date_element.textContent = current_date.toLocaleDateString('en-GB', { dateStyle: 'full' });
}

// Run this when the page loads
updateHeaderDate();
