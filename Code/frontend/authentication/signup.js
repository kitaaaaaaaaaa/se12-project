// This contains the code for the sign up and account creation page

import { showLoading, hideLoading, clearErrors, showError, sendFormData } from '../components/app.js';

const signin_switch = document.getElementById("signin-switch-button");

const authentication_section = document.getElementById("authentication-section");
const header = document.querySelector("header");


const signup_form = document.getElementById("signup-form");

signup_form.addEventListener('submit', async (event) => {
    clearErrors();

    // Prevent the page from reloading
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const reenterPassword = document.getElementById("reenter-password").value;
    // const role = document.getElementById("role").value;

    // Track if the form is valid
    let isValid = true;

    // Validate email
    if (email === "") {
        showError("email-error", "Email cannot be blank");
        isValid = false;
    }

    // Validate Password (min 12 characters, at least one letter, one number and one special character)
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=])[A-Za-z\d!@#$%^&*()_+\-=]{12,}$/;

    if (!passwordPattern.test(password)) {
        showError("password-error", "Password must be at least 12 characters long, contain letters, numbers and special characters such as !@#$%^&*()_+-=");
        isValid = false;
    }

    // Check if reentered password matches to verify data
    if (reenterPassword !== password) {
        showError("reenter-password-error", "The reentered password does not match the password above");
        isValid = false;
    }

    if (isValid) {
        const response = await sendFormData(signup_form, "/create_account", "POST");
        console.log(response);
        // Decide where to redirect the user...
        // Backend will check for authorisation
    }
});

