// Code to render and edit events. Used for the editing event page.
// ----------------------------------------------------------

import { sendRequest } from "../components/app.js";
import { createDialog, createReloadDialog } from "../components/dialog.js";
import { createNewEditStep } from "../components/editStepCard.js";

async function renderSteps() {
    // Make a request to the server
    const response = await sendRequest("", `/get_edit_event_data/${Number(getEventId())}`, "GET", () => {
        const error_dialog = createReloadDialog("An error occurred", "The server could not be contacted...Please reload the page.");
        error_dialog.showModal();
    });

    // If a response is obtained, render each step
    if (response && response.length !== 0) {
        response.forEach((step_data) => {
            const step_container = document.querySelector("main");
            const step = createNewEditStep(step_data);

            step_container.appendChild(step);
        });
        renderOverview();
    } else {
        // Otherwise, render a placeholder
        const step_container = document.querySelector("main");
        const step = createNewEditStep({
            "attributes": {
                "step_title": "",
                "step_performer": "",
                "step_number": "01",
                "curtains": "",
                "video": "",
                "blackout": ""
            },
            "instructions": [
                {
                    "job": "",
                    "command": "",
                    "detail": ""
                }
            ]
        })

        step_container.appendChild(step);
    }
}

function renderOverview() {
    const step_cards = document.querySelectorAll("edit-step-card");
    const overview = document.querySelector("aside");
    
    overview.innerHTML = `
        <h2>Overview</h2>
    `;
    
    step_cards.forEach((card) => {
        const data = card.getFormInputs();
        let title = data.attributes.step_title;
        const num = data.attributes.step_number;
        
        if (title === "") {
            title = "Untitled"; 
        }
        
        const step = document.createElement("span");
        step.textContent = `${num} ${title}`;
        overview.appendChild(step);
    });
}

document.addEventListener('click', renderOverview);
document.addEventListener('change', renderOverview);
renderSteps();
renderOverview();

const pill = document.querySelector("#disable-reload")
pill.addEventListener('click', () => {
    pill.classList.toggle("active");
});

const back_btn = document.getElementById("exit-edit");
back_btn.addEventListener("click", async () => {
    // Save event data
    const step_elements = document.querySelectorAll("edit-step-card");
    let all_steps = []

    step_elements.forEach((element) => {
        all_steps.push(element.getFormInputs())
    })

    const response = await sendRequest(all_steps, `/save_edit_event_data/${Number(getEventId())}`, "PUT", () => {
        const error_dialog = createDialog("Error", "Event could not be saved. Please try again.");
        error_dialog.showModal();

    });

    // Clear session storage
    saveEventId("");

    // Redirect user
    window.location.href = `/homepage/homepage.html`;
});

// Functions to save and retrieve temporary event id
function saveEventId(id) {
    window.sessionStorage.setItem("event_id", id);
}

function getEventId() {
    return window.sessionStorage.getItem("event_id");
}