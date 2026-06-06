// Code to render and edit events. Used for the editing event page.
// ----------------------------------------------------------

import { sendRequest } from "../components/app.js";
import { createReloadDialog } from "../components/dialog.js";
import { createNewEditStep } from "../components/editStepCard.js";

async function renderSteps() {
    const response = await sendRequest("", `/get_instructions/${Number(getEventId())}`, "GET", () => {
        const error_dialog = createReloadDialog("An error occurred", "The server could not be contacted...Please reload the page.");
        error_dialog.showModal();
    });

    if (response && response.length !== 0) {
        console.log(response)
    } else {
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
    
    overview.innerHTML = `<h2>Overview</h2>`;

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

// Functions to save and retrieve temporary event id
export function saveEventId(id) {
    window.sessionStorage.setItem("event_id", id);
}

export function getEventId() {
    return window.sessionStorage.getItem("event_id");
}