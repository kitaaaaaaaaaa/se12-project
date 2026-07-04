// This contains the code for the sign up and account creation page

import { saveToken, getToken, clearErrors, showError, sendFormData, sendRequest } from '../components/app.js';

const signin_switch = document.getElementById("signin-switch-button");

const authentication_section = document.getElementById("authentication-section");
const header = document.querySelector("header");


const signup_form = document.getElementById("signup-form");

signup_form.addEventListener('submit', async (event) => {
    clearErrors();

    // Prevent the page from reloading
    event.preventDefault();

    const email = DOMPurify.sanitize(document.getElementById("email").value);
    const password = DOMPurify.sanitize(document.getElementById("password").value);
    const reenterPassword = DOMPurify.sanitize(document.getElementById("reenter-password").value);

    // Track if the form is valid
    let isValid = true;

    // Validate email
    if (email === "") {
        showError("email-error", "Email cannot be blank");
        isValid = false;
    }

    // Validate Password (min 8 characters, at least one letter, one number and one special character)
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=])[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/;

    if (!passwordPattern.test(password)) {
        showError("password-error", `
            Password must be:
            \n• At least 8 characters long
            \n• Contain a mix of letters and numbers
            \n• Contains special characters such as !@#$%^&*()_+-=
            `);
        isValid = false;
    }

    // Check if reentered password matches to verify data
    if (reenterPassword !== password) {
        showError("reenter-password-error", "The reentered password does not match the password above");
        isValid = false;
    }

    if (isValid) {
        const response = await sendFormData(signup_form, "/create_account", "POST");
        
        // Deal with a successful response
        try {
            // Save the token to session storage
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
            // Catch other unforeseen errors to prevent information leakage to consoles
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
        changeDelay(7000);
    } else {
        // If there isn't a response and change delay to 1s
        connection_display.innerHTML = `🔴 Backend not connected`
        connection_display.style.color = "#ba4646"
        changeDelay(1000);
    }
}

