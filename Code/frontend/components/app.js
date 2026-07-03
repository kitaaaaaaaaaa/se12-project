// This file contains all the code for the main components, alongside any functions that may be required
// or used across the web application.

// Import config
import config from '../config.json' with { type: 'json' };
const backend_url = config.backend_url + ":" + config.backend_port;

// Import web components
import './eventCard.js';
import './stepCard.js';
import './editStepCard.js';
import './dialog.js';
import { createDialog, createReloadDialog, createSessionExpDialog } from './dialog.js';

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
export function createNewEvent(eventjson) {
    // Use given event data to create a new event card
    const new_event = document.createElement("event-card");
    new_event.setAttribute("event-id", eventjson.event_id);
    new_event.setAttribute("event-name", eventjson.event_name);
    new_event.setAttribute("event-date", eventjson.event_date);
    new_event.setAttribute("event-location", eventjson.event_location);
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
    errorElements.forEach((element) => {element.textContent = ""; element.classList.add("hidden");});
}

// Function to show an error message
export function showError(elementId, message) {
    document.getElementById(elementId).classList.remove("hidden");
    document.getElementById(elementId).textContent = message;
}

// Sends data from a form as a JSON object as seen on MDN Docs
export async function sendFormData(form, route, method, logged_in) {
    showLoading();

    const formData = new window.FormData(form);
    const data = Object.fromEntries(formData);
    const url = backend_url + route;

    try {
        let response = "";
        if (logged_in) {
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
        const parsed_response = await response.json();

        // Deal with errors in the response
        if ("error" in parsed_response || !response.ok) {
            const error_dialog = createDialog("An error occurred", parsed_response.error);
            error_dialog.showModal();
        }

        // If the response was successful
        if (response.ok) {
            hideLoading();
            return parsed_response;
        }
    } catch (error) {
        // Deal with client side errors
        const error_dialog = createDialog("An error occurred", "The server could not be contacted...Please try again.");
        error_dialog.showModal();
    }

    hideLoading();
}

// Sends data from a form as a JSON object as seen on MDN Docs, returns parsed JSON
export async function sendRequest(body, route, method, error_func, disableLoading) {
    if (!disableLoading) {
        showLoading();
    }

    const url = backend_url + route;

    try {
        let response = "";

        if (method === "GET") {
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
            });
        } else {
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(body)
            });
        }

        const parsed_response = await response.json();

        // Deal with errors in the response
        if ("error" in parsed_response || !response.ok) {
            if (
                parsed_response.error === "Your session has expired. You will be redirected to the sign in page." || 
                parsed_response.error === "Your session is invalid. You will be redirected to the sign in page."
            ) {
                const exp_dialog = createSessionExpDialog("Session expired", parsed_response.error);
                exp_dialog.showModal();
            } else if (
                parsed_response.error === "There is no event playing right now" ||
                parsed_response.error === "There is no event being played right now. Ask your administrator for help."
            ) {
                const reload_dialog = createReloadDialog("An error occurred", parsed_response.error);
                reload_dialog.showModal();
            } else {
                const error_dialog = createDialog("An error occurred", parsed_response.error);
                error_dialog.showModal();
            }
        }

        // If the response was successful
        if (response.ok) {
            if (!disableLoading) {
                hideLoading();
            }

            return parsed_response;
        }
    } catch (error) {
        if (error_func) {
            // Run the defined error function if it was passed
            error_func();
        } else {
            // Deal with client side errors
            const error_dialog = createDialog("An error occurred", "The server could not be contacted...Please try again.");
            error_dialog.showModal();
        }
    }

    if (!disableLoading) {
        hideLoading();
    }
}

// Function to redirect the user to the error page
export function redirectToError(error) {
    const encoded_msg = encodeURIComponent(error);

    // URLs are automatically encoded, so XSS cannot be performed here
    window.location.href = `/error.html?err=${encoded_msg}`;
}

// Functions to save and retrieve tokens from session storage
export function saveToken(token) {
    window.sessionStorage.setItem("token", token);
}

export function getToken() {
    return window.sessionStorage.getItem("token");
}

export function logOut() {
    window.sessionStorage.removeItem("token");
    window.location.href = "/";
}

// Run this when the page loads
updateHeaderDate();