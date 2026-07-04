// This contains the code for the first page that the user sees
// The user will first see a login/signin page

import { saveToken, clearErrors, showError, sendFormData, redirectToError, sendRequest } from './components/app.js';

const signup_switch = document.getElementById("signup-switch-button");

const authentication_section = document.getElementById("authentication-section");
const header = document.querySelector("header");

const signin_form = document.getElementById("signin-form");



signin_form.addEventListener('submit', async (event) => {
    clearErrors();

    // Prevent the page from reloading
    event.preventDefault();

    const email = DOMPurify.sanitize(document.getElementById("email").value);
    const password = document.getElementById("password").value;

    // Perform basic data validation before sending to backend
    // Prevents unnecessary requests
    let isValid = true;

    // Validate email
    if (email === "") {
        showError("email-error", "Email cannot be blank");
        isValid = false;
    }

    // Validate password
    if (password === "") { 
        showError("password-error", "Password cannot be blank");
        isValid = false;
    }

    if (isValid) {
        const response = await sendFormData(signin_form, "/login", "POST");

        // Deal with a successful response
        try {
            if (response.token) {
                saveToken(response.token);
            }

            if (response.level === 1) {
                // Redirect the user to dashboard
                window.location.href = "/homepage/homepage.html";
            } else {
                // Redirect to user page
                window.location.href = "/crew/crew.html";
            }
        } catch (error) {
            // Catch other unforeseen errors to prevent information leakage to console
            // Errors are handled in app.js so nothing needs to go here
        }
    }
});

// Functions to handle the connection display
let delay = 1000
// Run this function every 1 second initially
let connection_interval = setInterval(checkConnection, delay)

// Function to change the delay at which the interval is ran
function changeDelay(time) {
    clearInterval(connection_interval);
    delay = time;
    connection_interval = setInterval(checkConnection, delay)
}

// Function to check the connection and update the UI accordingly
async function checkConnection() {
    const connection_display = document.getElementById("connection-display");
    // Send a ping to the server
    const response = await sendRequest("", "/get_server_status", "GET", () => {}, true);

    if (response) {
        // If there is a response update UI and change delay to 5s
        connection_display.innerHTML = `🟢 Connected`
        connection_display.style.color = "#24941a"
        changeDelay(5000);
    } else {
        // If there isn't a response and change delay to 1s
        connection_display.innerHTML = `🔴 Backend not connected`
        connection_display.style.color = "#ba4646"
        changeDelay(1000);
    }
}