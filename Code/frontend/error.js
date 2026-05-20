import {updateHeaderDate} from "./components/app.js";

const back_button = document.getElementById("back-button");

// When the back button is clicked, go back to the previous page
back_button.addEventListener("click", () => {
    window.history.back();
});

// Update the error message on page load
const params = new URLSearchParams(window.location.search);
const error_message = document.getElementById("err-msg");

if (params.get('err')) {
    error_message.textContent = params.get('err');
} else {
    error_message.textContent = "Something went wrong! That's all we know...";
}

// Update the date
updateHeaderDate();