// This file contains all the code for creating a dialog box.
// ---------------------------------------------------------------------------

// Creates a normal dialog box that alerts the user
export function createDialog(title, description) {
    const dialog_element = document.createElement('dialog');
    
    dialog_element.innerHTML = `
        <h2>${title}</h2>
        <p>${description}</p>

        <div class="dialog-buttons">
            <button type="button" class="dialog-close">
                <i class="fa-solid fa-angle-left"></i>
                Back
            </button>
        </div>
    `;
    document.body.appendChild(dialog_element);

    // When the close button is pressed, hide and delete the dialog box
    const close_button = dialog_element.querySelector('.dialog-close');
    close_button.addEventListener('click', () => {
        dialog_element.close();
        dialog_element.remove();
    });
    
    // When the dialog is closed by other means, delete the dialog box
    dialog_element.addEventListener('close', () => {
        dialog_element.remove();
    });

    return dialog_element;
}

// Creates a dialog box that forces the user to reload the page
export function createReloadDialog(title, description) {
    const dialog_element = document.createElement('dialog');
    
    dialog_element.innerHTML = `
        <h2>${title}</h2>
        <p>${description}</p>

        <div class="dialog-buttons">
            <button type="button" class="dialog-close">
                <i class="fa-solid fa-arrow-rotate-right"></i>
                Reload
            </button>
        </div>
    `;
    document.body.appendChild(dialog_element);

    // When the button is pressed, reload the page
    const close_button = dialog_element.querySelector('.dialog-close');
    close_button.addEventListener('click', () => {
        dialog_element.close();
        dialog_element.remove();
        window.location.reload();
    });
    
    // When the dialog is closed by other means, remove the dialog box
    dialog_element.addEventListener('close', () => {
        dialog_element.remove();
    });

    return dialog_element;
}