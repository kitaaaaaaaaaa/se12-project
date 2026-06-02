// This file contains all the code for the step card web component
// which displays a step in an event and its instructions for crew members.
// It includes any functions related to it.
// ---------------------------------------------------------------------------

// Create a web component for a step card
export class stepCard extends HTMLElement {
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

if (typeof customElements !== 'undefined') {
    customElements.define("step-card", stepCard);
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