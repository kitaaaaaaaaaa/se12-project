import {updateHeaderDate} from "./components/app.js";

const back_button = document.getElementById("back-button");

// When the back button is clicked, go back to the previous page
back_button.addEventListener("click", () => {
    window.history.back();
});

// Update the date
updateHeaderDate();