import { logOut, sendRequest } from '../components/app.js';
import { createReloadDialog, closeAll } from "../components/dialog.js";
import { createNewStep } from "../components/stepCard.js";

let crew_role_value = "all";

async function initPage() {
    // Add functionality to the log out button
    const log_out_btn = document.getElementById("log-out");
    log_out_btn.addEventListener("click", () => {
        saveSteps("");
        logOut();
    });

    // Make a request to the server
    const response = await sendRequest("", `/start_crew`, "GET", () => {
        const error_dialog = createReloadDialog("An error occurred", "The server could not be contacted...Please reload the page.");
        error_dialog.showModal();
    });

    // If a response is obtained, save and render steps
    if (response && response.length !== 0) {
        saveSteps(JSON.stringify(response));
        renderSteps(0);

        const step_index_interval = setInterval(async () => {
            const response = await sendRequest("", "/get_step_index", "GET", undefined, true)
            
            if (response) {
                closeAll();
                renderSteps(response.message);
            } else {
                clearInterval(step_index_interval);
                clearRenderedSteps();
                saveSteps("");
            }
        }, 1000)   
    } else {
        // Display an empty screen if there are no steps
        clearRenderedSteps();
        saveSteps("");
    }

}

// Add functionality to the crew role select
const crew_role = document.getElementById("crew-role");
crew_role.addEventListener("change", () => {
    crew_role_value = crew_role.value;
})

// Function to clear all the steps on the page
function clearRenderedSteps() {
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

function renderSteps(index) {
    let steps = JSON.parse(getSteps());
    const current_section = document.querySelector("#current");
    const upcoming_section = document.querySelector("#upcoming");
    
    // Filter by the job based on what the user has selected
    if (crew_role_value !== "all") {
        const filtered_steps = []
        for (const step of steps) {
            let filtered_instructions = []
            for (const instruction of step.instructions) {
                if (instruction.job === crew_role_value) {
                    filtered_instructions.push(instruction)
                }
            }
            
            filtered_steps.push({
                "attributes": step.attributes,
                "instructions": filtered_instructions
            })
        }

        steps = filtered_steps;
    }

    // Split into two arrays
    const current = steps[index];
    const upcoming = steps.slice(index + 1);

    // Render the current step 
    current.attributes.classes = "current-step"
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

initPage();