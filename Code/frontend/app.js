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
        let template_data = null; // Save the template data to restore later

        if (template) {
            try {
                template_data = template.innerHTML.trim();
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
                        <input type="text" placeholder="Step title" value="${step_title}" name="edit-step-title" autocomplete="off">
                        
                        <div class="secondary-text-clr step-performer">
                            <label for="performer" class="flex-container">
                                <i class="fa-regular fa-star"></i>
                                On stage: 
                                <input type="text" name="edit-step-performer" placeholder="Performer" value="${step_performer}" autocomplete="off">
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
            // Display the instructions
            stepHTML += `
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
                        <input type="text" name="edit-step-instruction-detail" placeholder="Instruction details" value="${instruction.detail}" autocomplete="off">
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

        // Select the job and command values of each instruction
        const job_elements = this.querySelectorAll("select[name='edit-step-instruction-job']");
        const command_elements = this.querySelectorAll("select[name='edit-step-instruction-command']");
        parsed_instructions.forEach((instruction, index) => {
            job_elements[index].value = "stage_hands";
            command_elements[index].value = "handoff";

            if (instruction.job) {
                job_elements[index].value = instruction.job;
            }
            if (instruction.command) {
                command_elements[index].value = instruction.command.toLowerCase();
            }
        });

        // Recreate the template so they are saved
        if (template_data) {
            const new_template = document.createElement("template");
            new_template.innerHTML = template_data;
            this.appendChild(new_template);
        }

        // Add functionality to the rearrange button
        const rearrange_up_button = this.querySelector(".rearrange-up");
        const rearrange_down_button = this.querySelector(".rearrange-down");

        rearrange_up_button.addEventListener('click', () => {
            const previous_step = this.previousElementSibling;
            if (previous_step && previous_step.matches('edit-step-card')) {
                // Save current state before rearranging
                this.updateStepCard();
                previous_step.updateStepCard();
                
                const current_step_number = this.getAttribute('step-number');
                const previous_step_number = previous_step.getAttribute('step-number');

                // Swap the step numbers
                previous_step.setAttribute('step-number', current_step_number);
                this.setAttribute('step-number', previous_step_number);

                // Update the step number UI
                previous_step.querySelector('.step-number').textContent = current_step_number;
                this.querySelector('.step-number').textContent = previous_step_number;

                this.parentNode.insertBefore(this, previous_step);
            }
        });

        rearrange_down_button.addEventListener('click', () => {
            const next_step = this.nextElementSibling;
            if (next_step && next_step.matches('edit-step-card')) {
                // Save current state before rearranging
                this.updateStepCard();
                next_step.updateStepCard();
                
                const current_step_number = this.getAttribute('step-number');
                const next_step_number = next_step.getAttribute('step-number');
                
                // Swap the step numbers
                next_step.setAttribute('step-number', current_step_number);
                this.setAttribute('step-number', next_step_number);
                
                // Update the step number UI
                next_step.querySelector('.step-number').textContent = current_step_number;
                this.querySelector('.step-number').textContent = next_step_number;
                
                this.parentNode.insertBefore(next_step, this)
            }
        });


        // Add functionality to the new step button
        const new_step_button = this.querySelector(".new-step");
        new_step_button.addEventListener('click', () => {
            // Get the current step number from the attribute
            const current_step_number = this.getAttribute('step-number');
            const new_step_number = formatStepNumber(parseInt(current_step_number) + 1);
            
            // Create a new empty step
            const new_step = createNewEditStep({
                "attributes": {
                    "step_title": "",
                    "step_performer": "",
                    "step_number": new_step_number,
                    "curtains": "",
                    "video": "",
                    "blackout": "" },
                "instructions": [
                    {"job": "", "command": "", "detail": ""}
                ]}
            );

            this.after(new_step);
            
            // Increment the step numbers of all subsequent steps
            let next_card = new_step.nextElementSibling;
            let num_to_increment = parseInt(new_step_number);
            
            while (next_card && (next_card.matches('edit-step-card'))) {
                num_to_increment += 1;

                // Set the new step number attribute
                const new_num = formatStepNumber(num_to_increment);
                next_card.setAttribute('step-number', new_num);
            
                // Update the step number UI
                const step_num_element = next_card.querySelector('.step-number');
                step_num_element.textContent = new_num;
                
                // Go to the next card
                next_card = next_card.nextElementSibling;
            }
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
            this.updateStepCard();
        });

        // Attach events to toggle the state of each pill
        const pill_container = this.querySelector(".edit-pills");

        pill_container.addEventListener('click', (event) => {
            if (event.target.matches(".pill")) {
                event.target.classList.toggle("active");
                this.updateStepCard();
            }
        });

        // When the step is edited, update the step card
        const step_card_container = this.querySelector(".step-card.edit");
        step_card_container.addEventListener('input', () => {
            this.updateStepCard();
        });

        step_card_container.addEventListener('change', () => {
            this.updateStepCard();
            console.log("CHANGED SELECTION");
        });


        // Function to turn an integer into a padded string
        function formatStepNumber(num) {
            return num.toString().padStart(2, '0');
        }
    }

    getFormInputs() {
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

    // Whenever form inputs are changed, call this function to update the changes in the HTML
    updateStepCard() {
        // Get the current step data from the form
        const step_data = this.getFormInputs();
        const step_instructions = step_data.instructions;

        // Save form inputs to attributes
        this.setAttribute('step-title', step_data.attributes.step_title);
        this.setAttribute('step-performer', step_data.attributes.step_performer);
        this.setAttribute('step-number', step_data.attributes.step_number);
        this.setAttribute('curtains', step_data.attributes.curtains);
        this.setAttribute('video', step_data.attributes.video);
        this.setAttribute('blackout', step_data.attributes.blackout);

        // Find and remove the old template
        const oldTemplate = this.querySelector("template");
        if (oldTemplate) {
            oldTemplate.remove();
        }
        
        // Create a new template with the updated instructions
        const newTemplate = document.createElement("template");
        newTemplate.innerHTML = JSON.stringify({ "instructions": step_instructions });
        this.appendChild(newTemplate);
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

// Function to create a new edit step
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

// Function to create a new step
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

// Functino to create a new event card
function createNewEvent(eventjson) {
    // Use given event data to create a new event card
    const new_event = document.createElement("event-card");
    new_event.setAttribute("event-name", eventjson.name);
    new_event.setAttribute("event-date", eventjson.date);
    new_event.setAttribute("event-location", eventjson.location);
    new_event.setAttribute("past", eventjson.past);
    return new_event;
}

const temp_button = document.getElementById("create-account")
temp_button.addEventListener('click', () => {
    // Get step data of all steps and log it in the console

    const all_steps = document.querySelectorAll("edit-step-card");
    all_steps.forEach(step => {
        console.log(step.getFormInputs());
    });
});

function updateHeaderDate() {
    const date_element = document.querySelector("header span");
    const current_date = new Date();
    date_element.textContent = current_date.toLocaleDateString('en-GB', { dateStyle: 'full' })
}

updateHeaderDate();