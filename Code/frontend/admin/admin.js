import { sendRequest } from "../components/app.js";
import { createReloadDialog } from "../components/dialog.js";
import { createNewStep } from "../components/stepCard.js";

async function initPage() {
    // Make a request to the server
    const response = await sendRequest("", `/start_live_event/${Number(getEventId())}`, "GET", () => {
        const error_dialog = createReloadDialog("An error occurred", "The server could not be contacted...Please reload the page.");
        error_dialog.showModal();
    });
    
    // If a response is obtained, save and render steps
    if (response && response.length !== 0) {
        saveSteps(JSON.stringify(response));
        renderSteps(0);
    } else {
        // Display an empty screen if there are no steps
        const current = document.querySelector("#current");
        current.innerHTML = `
        <section class="empty-screen">
            <span class="figtree-semibold">(っ °Д °)っ</span>
            <p>Looks like there aren't any steps in this event...</p>
        </section>
        `;

        const upcoming = document.querySelector("#upcoming");
        upcoming.innerHTML = ``;
    }

    const stopwatch = { elapsedTime: 0 }
    stopwatch.startTime = Date.now();

    stopwatch.intervalId = setInterval(() => {
        // Calculate elapsed time
        const elapsedTime = Date.now() - stopwatch.startTime + stopwatch.elapsedTime
        
        // Calculate different time measurements based on elapsed time
        const seconds = parseInt((elapsedTime/1000)%60)
        const minutes = parseInt((elapsedTime/(1000*60))%60)
        const hour = parseInt((elapsedTime/(1000*60*60))%24);
        
        // Display time
        displayTime(hour, minutes, seconds)
    }, 100);
}

function displayTime(hour, minutes, seconds) {
    const leadZeroTime = [hour, minutes, seconds].map(time => time < 10 ? `0${time}` : time)
    const stopwatch_element = document.getElementById("stopwatch")
    stopwatch_element.innerHTML = leadZeroTime.join(':')
}

// Function to render all steps past a certain index
function renderSteps(index) {
    const steps = JSON.parse(getSteps());
    const current_section = document.querySelector("#current");
    const upcoming_section = document.querySelector("#upcoming");

    // Split into two arrays
    const current = steps[index];
    const upcoming = steps.slice(index + 1);

    // Render the current step 
    current.attributes.classes = "admin current-step"
    const current_step = createNewStep(current);
    current_section.innerHTML = ``;
    current_section.appendChild(current_step)

    // Render all the upcoming steps
    upcoming_section.innerHTML = ``;
    upcoming.forEach((step) => {
        const step_element = createNewStep(step);
        upcoming_section.appendChild(step_element);
    });
}

// Functions to save and retrieve step data from session storage
function saveSteps(data) {
    window.sessionStorage.setItem("event_steps", data);
}

function getSteps() {
    return window.sessionStorage.getItem("event_steps");
}

// Functions to save and retrieve temporary event id
function saveEventId(id) {
    window.sessionStorage.setItem("event_id", id);
}

function getEventId() {
    return window.sessionStorage.getItem("event_id");
}

const next_step_button = document.getElementById("next-step");
next_step_button.addEventListener("click", async () => {
    const response = await sendRequest("", "/next_step", "GET", undefined, true)

    if (response) {
        renderSteps(response.message)
    }
});

const prev_step_button = document.getElementById("prev-step");
prev_step_button.addEventListener("click", async () => {
    const response = await sendRequest("", "/prev_step", "GET", undefined, true)

    if (response) {
        renderSteps(response.message)
    }
});

const end_event_button = document.getElementById("end-event");
end_event_button.addEventListener("click", async () => {
    // Request to end the live event
    const response = await sendRequest("", "/end_live_event", "PUT")
    
    if (response) {
        // Clear session storage
        saveSteps("");
        saveEventId("");

        // Clear stopwatch data
        stopwatch.elapsedTime = 0
        stopwatch.startTime = Date.now()
        
        // Redirect user to home page
        window.location.href = `/homepage/homepage.html`;
    }

});

initPage();