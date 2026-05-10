// Create a web component for a step card
class stepCard extends HTMLElement {
    // Run this code when the component is added to the page
    connectedCallback() {
        // Retrieve attributes from HTML page
        const step_title = this.getAttribute("step-title");
        const step_performer = this.getAttribute("step-performer");
        const step_number = this.getAttribute("step-number");
        const classes = this.getAttribute("classes");

        // Retrieve the step instructions from HTML page
        const template = this.querySelector("template");
        let parsed_instructions = [];

        if (template) {
            try {
                parsed_instructions = JSON.parse(template.innerHTML.trim()).instructions;
            } catch (e) {
                console.error("Invalid JSON in step-card <template>", e);
                parsed_instructions = null;
            }
        }

        // Create step card container and insert the step header
        let stepHTML = `
            <div class="step-card ${classes}">
                <div class="step-header flex-container">
                    <div class="step-details flex-container">
                        <span class="step-title figtree-semibold">${step_title}</span>

                        <span class="secondary-text-clr step-performer">
                            <i class="fa-regular fa-star"></i> On stage: ${step_performer}
                        </span>
                    </div>
                    <span class="step-number figtree-semibold">${step_number}</span>
                </div>
        `;

        // Insert an instruction for each one specified
        parsed_instructions.forEach(instruction => {
            stepHTML += `
                <div class="instruction flex-container">
                    <span class="figtree-bold">
                        <i class="fa-regular fa-user"></i> ${instruction.job}
                    </span>
                    <span>${instruction.command} ${instruction.detail}</span>
                </div>
            `;
        });

        // Close the step card container
        stepHTML += `</div>`;

        // Render the HTML
        this.innerHTML = stepHTML;
    }
}
customElements.define("step-card", stepCard);

// Create a web component for editing a step card
class editStepCard extends HTMLElement {
    // Run this code when the component is added to the page
    connectedCallback() {
        // Retrieve attributes from HTML page
        const step_title = this.getAttribute("step-title");
        const step_performer = this.getAttribute("step-performer");
        const step_number = this.getAttribute("step-number");
        const curtains = this.getAttribute("curtains");
        const video = this.getAttribute("video");
        const blackout = this.getAttribute("blackout");

        // Retrieve the step instructions from HTML page
        const template = this.querySelector("template");
        let parsed_instructions = [];

        if (template) {
            try {
                parsed_instructions = JSON.parse(template.innerHTML.trim()).instructions;
            } catch (e) {
                console.error("Invalid JSON in edit-step-card <template>", e);
                parsed_instructions = null;
            }
        }

        // Create step card container and insert the step header
        let stepHTML = `
        <div class="step-card edit">
            <div class="step-header flex-container">
                    <span class="step-number figtree-semibold">${step_number}</span>
                    <div class="step-details flex-container">
                        <input type="text" placeholder="Step title" value="${step_title}" name="edit-step-title">
                        
                        <div class="secondary-text-clr step-performer">
                            <label for="performer" class="flex-container">
                                <i class="fa-regular fa-star"></i>
                                On stage: 
                                <input type="text" name="edit-step-performer" placeholder="Performer" value="${step_performer}">
                            </label>
                        </div>
                    </div>
                
                <div class="rearrange-container flex-container">
                    <button type="button" class="rearrange-up">
                        <i class="fa-solid fa-angle-up"></i>
                    </button>
                    <button type="button" class="rearrange-down">
                        <i class="fa-solid fa-angle-down"></i>
                    </button>
                </div>
            </div>

            <div class="edit-pills flex-container">
                <button type="button" class="pill curtains ${curtains}">Curtains open?</button>
                <button type="button" class="pill video ${video}">Video</button>
                <button type="button" class="pill blackout ${blackout}">Blackout</button>
            </div>
        `;

        // Insert an instruction for each one specified
        parsed_instructions.forEach(instruction => {
            // Select the given job
            let job_stage_hands = ""
            let job_visuals = ""
            let job_sound = ""
            let job_camera = ""
            let job_lighting = ""

            switch (instruction.job) {
                case "stage_hands":
                    job_stage_hands = "selected";
                case "visuals":
                    job_visuals = "selected";
                case "sound":
                    job_sound = "selected";
                case "camera":
                    job_sound = "selected";
                case "lighting":
                    job_lighting = "selected";
            }

            // Select the given command
            let command_handoff = ""
            let command_place = ""
            let command_move = ""
            let command_remove = ""

            switch (instruction.command) {
                case "handoff":
                    command_handoff = "selected";
                case "place":
                    command_place = "selected";
                case "move":
                    command_move = "selected";
                case "remove":
                    command_remove = "selected";
            }

            // Display the instructions
            stepHTML += `
            <div class="instruction flex-container">
                <div style="white-space: nowrap;">
                    <i class="fa-regular fa-user"></i>
                    <select name="edit-step-instruction-job">
                        <option value="stage_hands" ${job_stage_hands}>Stage Hands</option>
                        <option value="visuals" ${job_visuals}>Visuals</option>
                        <option value="sound" ${job_sound}>Sound</option>
                        <option value="camera" ${job_camera}>Camera</option>
                        <option value="lighting" ${job_lighting}>Lighting</option>
                    </select>
                </div>

                <div class="flex-container instruction-detail">
                    <div>
                        <select name="edit-step-instruction-command">
                            <option value="handoff" ${command_handoff}>HANDOFF</option>
                            <option value="place" ${command_place}>PLACE</option>
                            <option value="remove" ${command_remove}>REMOVE</option>
                            <option value="move" ${command_move}>MOVE</option>
                        </select>
                    </div>
                    <div class="instruction-text-input flex-container">
                        <input type="text" name="edit-step-instruction-detail" placeholder="Instruction details" value="${instruction.detail}">
                    </div>
                </div>
            </div>
            `;
        });

        // Close the step card
        stepHTML += `
            <button type="button" class="new-instruction">
                <i class="fa-solid fa-plus"></i>
                New instruction
            </button>
        </div>
            <button type="button" class="new-step">
                <i class="fa-solid fa-layer-group"></i>
                New step
            </button>
        `;

        // Render the HTML
        this.innerHTML = stepHTML;

        // Add functionality to the rearrange button
        const rearrange_up_button = this.querySelector(".rearrange-up");
        const rearrange_down_button = this.querySelector(".rearrange-down");

        rearrange_up_button.addEventListener('click', () => {
            const previous_step = this.previousElementSibling;
            if (previous_step && previous_step.matches("edit-step-card")) {
                this.parentNode.insertBefore(this, previous_step);
            }
        });

        rearrange_down_button.addEventListener('click', () => {
            const next_step = this.nextElementSibling;
            if (next_step && next_step.matches("edit-step-card")) {
                this.parentNode.insertBefore(next_step, this);
            }
        });

        // Add functionality to the new step button
        const new_step_button = this.querySelector(".new-step");
        new_step_button.addEventListener('click', () => {
            console.log('Click: new_step_button');
            
            const new_step = createNewEditStep({
                "attributes": {
                    "step_title": "",
                    "step_performer": "",
                    "step_number": (parseInt(step_number) + 1).toString().padStart(2, '0'),
                    "curtains": "",
                    "video": "",
                    "blackout": "" },
                "instructions": [
                    {"job": "", "command": "", "detail": ""}
                ]}
            );

            this.after(new_step);
        });
        
        // Add functionality to the new instructino button
        const new_instruction_button = this.querySelector(".new-instruction");
        new_instruction_button.addEventListener('click', () => {
            // Add a new instruction
            const new_instruction_html = `
                <div class="instruction flex-container">
                    <div style="white-space: nowrap;">
                        <i class="fa-regular fa-user"></i>
                        <select name="edit-step-instruction-job">
                            <option value="stage_hands">Stage Hands</option>
                            <option value="visuals">Visuals</option>
                            <option value="sound">Sound</option>
                            <option value="camera">Camera</option>
                            <option value="lighting">Lighting</option>
                        </select>
                    </div>

                    <div class="flex-container instruction-detail">
                        <div>
                            <select name="edit-step-instruction-command">
                                <option value="handoff">HANDOFF</option>
                                <option value="place">PLACE</option>
                                <option value="remove">REMOVE</option>
                                <option value="move">MOVE</option>
                            </select>
                        </div>
                        <div class="instruction-text-input flex-container">
                            <input type="text" name="edit-step-instruction-detail" placeholder="Instruction details">
                        </div>
                    </div>
                </div>
            `;

            new_instruction_button.insertAdjacentHTML('beforebegin', new_instruction_html); 
        });

        // Attach events to toggle the state of each pill
        const pill_container = this.querySelector(".edit-pills");

        pill_container.addEventListener('click', (event) => {
            if (event.target.matches(".pill")) {
                event.target.classList.toggle("active");
            }
        });

    }

    getStepData() {
        // Define an arrow function to read the values of every input
        // and format them into a JSON object
        const edit_step_title_value = this.querySelector("input[name='edit-step-title']").value;
        const edit_step_performer_value = this.querySelector("input[name='edit-step-performer']").value;
        const edit_step_number = this.querySelector(".step-number").textContent;

        // Get state of each pill as "active" or "" and save it to edit_attributes
        const curtain_pill = this.querySelector(".pill.curtains");
        const video_pill = this.querySelector(".pill.video");
        const blackout_pill = this.querySelector(".pill.blackout");

        let edit_curtains = "";
        let edit_video = "";
        let edit_blackout = "";

        if (curtain_pill.classList.contains("active")) {
            edit_curtains = "active";
        }
        if (video_pill.classList.contains("active")) {
            edit_video = "active";
        }
        if (blackout_pill.classList.contains("active")) {
            edit_blackout = "active";
        }

        // Create an object for the step attributes
        let edit_attributes = {
            "step_title": edit_step_title_value,
            "step_performer": edit_step_performer_value,
            "step_number": edit_step_number,
            "curtains": edit_curtains,
            "video": edit_video,
            "blackout": edit_blackout
        };

        // Create an array of objects to store the step instructions
        let edit_instructions = [];
        const step_job_elements = this.querySelectorAll("select[name='edit-step-instruction-job']");
        const step_command_elements = this.querySelectorAll("select[name='edit-step-instruction-command']");
        const step_detail_elements = this.querySelectorAll("input[name='edit-step-instruction-detail']");

        // For each instruction that exists, save it as an object and add it to the array
        for (let i = 0; i < step_job_elements.length; i++) {
            edit_instructions.push({
                "job": step_job_elements[i].value,
                "command": step_command_elements[i].value.toUpperCase(),
                "detail": step_detail_elements[i].value
            });
        }

        // Format step into JSON object
        let step = {
            "attributes": edit_attributes,
            "instructions": edit_instructions
        };
        return step;
    }
}
customElements.define("edit-step-card", editStepCard);

// Create a web component for an event card
class eventCard extends HTMLElement {
    // Run this code when the component is added to the page
    connectedCallback() {
        const event_name = this.getAttribute("event-name");
        const event_date = this.getAttribute("event-date");
        const event_location = this.getAttribute("event-location");
        const past = this.getAttribute("past");

        this.innerHTML = `
            <div class="event-card">
                <div class="event-information grid-container">
                    <div class="event-details flex-container">
                        <h2 class="figtree-medium">${event_name}</h2>
                        <span class="secondary-text-clr">
                            <i class="fa-regular fa-calendar"></i> ${event_date}
                        </span>
                        <span class="secondary-text-clr">
                            <i class="fa-solid fa-location-dot"></i> ${event_location}
                        </span>
                    </div>
                    <div class="event-actions">
                        <button type="button" class="play-button">
                            <i class="fa-solid fa-play" style="color: #d4f6a8;"></i>
                        </button>

                        <button type="button" class="edit-button">
                            <i class="fa-solid fa-pencil"></i>
                        </button>

                        <button type="button" class="del-button">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </div>
                <div class="event-indicator ${past}"></div>
            </div>
        `
        const play_button = this.querySelector(".play-button");
        const edit_button = this.querySelector(".edit-button");
        const del_button = this.querySelector(".del-button");
    }

    getEventData() {
        const event_name = this.getAttribute("event-name");
        const event_date = this.getAttribute("event-date");
        const event_location = this.getAttribute("event-location");
        const past = this.getAttribute("past");
        return {
            "event_name": event_name,
            "event_date": event_date,
            "event_location": event_location,
            "past": past
        };
    }
}
customElements.define("event-card", eventCard)

// Function to show a loading screen
function showLoading() {
    const screen = document.createElement('div')
    screen.id = "loading-screen"
    screen.classList.add("loading")

    const anim = document.createElement('div')
    anim.classList.add("loading-anim")
    screen.appendChild(anim)
    document.body.appendChild(screen)
}

// Function to hide a loading screen
function hideLoading() {
    document.getElementById("loading-screen").remove();
}

function createNewEditStep(stepjson) {
    // Use given step data that is split into attributes and instructions to create a new step
    const new_step = document.createElement("edit-step-card");
    new_step.setAttribute("step-title", stepjson.attributes["step_title"]);
    new_step.setAttribute("step-performer", stepjson.attributes["step_performer"]);
    new_step.setAttribute("step-number", stepjson.attributes["step_number"]);
    new_step.setAttribute("curtains", stepjson.attributes["curtains"]);
    new_step.setAttribute("video", stepjson.attributes["video"]);
    new_step.setAttribute("blackout", stepjson.attributes["blackout"]);

    const template = document.createElement("template");
    template.innerHTML = JSON.stringify({ instructions: stepjson.instructions });
    new_step.appendChild(template);
    return new_step;
}

function createNewStep(stepjson) {
    // Use given step data that is split into attributes and instructions to create a new step
    const new_step = document.createElement("step-card");
    new_step.setAttribute("step-title", stepjson.attributes["step_title"]);
    new_step.setAttribute("step-performer", stepjson.attributes["step_performer"]);
    new_step.setAttribute("step-number", stepjson.attributes["step_number"]);

    const template = document.createElement("template");
    template.innerHTML = JSON.stringify({ instructions: stepjson.instructions });
    new_step.appendChild(template);
    return new_step;
}

function createNewEvent(eventjson) {
    // Use given event data to create a new event card
    const new_event = document.createElement("event-card");
    new_event.setAttribute("event-name", eventjson.name);
    new_event.setAttribute("event-date", eventjson.date);
    new_event.setAttribute("event-location", eventjson.location);
    new_event.setAttribute("past", eventjson.past);
    return new_event;
}