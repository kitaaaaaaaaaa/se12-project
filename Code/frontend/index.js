// This contains the code for the first page that the user sees
// The user will first see a login/signin page

import { saveToken, clearErrors, showError, sendFormData, redirectToError, sendRequest } from './components/app.js';
// import { DOMPurify } from '../libs/purify.min.js';

const signup_switch = document.getElementById("signup-switch-button");

const authentication_section = document.getElementById("authentication-section");
const header = document.querySelector("header");

const signin_form = document.getElementById("signin-form");

signin_form.addEventListener('submit', async (event) => {
    clearErrors();

    // Prevent the page from reloading
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Perform basic data validation before sending to backend
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
        } catch (error) {
            // Catch other unforeseen errors
            // Errors are handled in app.js
        }
    }
});