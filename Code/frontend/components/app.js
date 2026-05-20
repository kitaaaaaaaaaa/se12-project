// This file contains all the code for the main components, alongside any functions that may be required
// or used across the web application.

// Variables to change
const backend_url = "http://127.0.0.1:5000";

// Import web components
import './eventCard.js';
import './stepCard.js';
import './editStepCard.js';
import './dialog.js';
import { createDialog } from './dialog.js';

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

// Function to update the date in the header
export function updateHeaderDate() {
    const date_element = document.querySelector("header span");
    const current_date = new Date();
    date_element.textContent = current_date.toLocaleDateString('en-GB', { dateStyle: 'full' });
}

// Function to clear all error messages
export function clearErrors() {
    const errorElements = document.querySelectorAll(".error");
    errorElements.forEach((element) => element.textContent = "");
}

// Function to show an error message
export function showError(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

// Sends data from a form as a JSON object as seen on MDN Docs
export async function sendFormData(form, route, method) {
    showLoading();

    const formData = new window.FormData(form);
    const data = Object.fromEntries(formData);
    const url = backend_url + route;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const parsed_response = await response.json();

        // Deal with errors in the response
        if ("error" in parsed_response || !response.ok) {
            const error_dialog = createDialog("An error occurred (・ω・)ノ", parsed_response.error);
            error_dialog.showModal();
        }

        // If the response was successful
        if (response.ok) {
            hideLoading();
            return parsed_response;
        }
    } catch(error) {
        // Deal with client side errors
        const error_dialog = createDialog("An error occurred (・ω・)ノ", "The server could not be contacted...Please try again.");
        error_dialog.showModal();
    }

    hideLoading();
}

// Function to redirect the user to the error page
export function redirectToError(error) {
    const encoded_msg = encodeURIComponent(error);

    // URLs are automatically encoded, so XSS cannot be performed here
    window.location.href = `/error.html?err=${encoded_msg}`;
}

// Run this when the page loads
updateHeaderDate();
