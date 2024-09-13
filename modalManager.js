export class ModalManager {
    constructor() {
        this.modal = document.createElement("div");
        this.modal.className = "modal";
        document.body.appendChild(this.modal);
    }

    showTurnAnnouncement(player, callback) {
        console.log(`Showing turn announcement for Player ${player.id}`);
        this.modal.innerHTML = `
            <div class="modal-content">
                <h2>Player ${player.id}'s Turn</h2>
                <p>${player.name}, prepare your strategy.</p>
                <button id="start-turn-btn">Start Turn</button>
            </div>
        `;
        this.modal.style.display = "block";
    
        document.getElementById("start-turn-btn").addEventListener("click", () => {
            console.log(`Turn start confirmed for Player ${player.id}`);
            this.hideModal();
            callback();  // Proceed with the turn
        });
    }

    showTurnSummary(player, actions, callback) {
        // Step 1: Log the actions passed into the function
        console.log("Actions passed to showTurnSummary:", actions);
        console.log("Type of actions:", Array.isArray(actions) ? "Array" : typeof actions);
        console.log("Length of actions:", actions ? actions.length : "null or undefined");
        
        // Step 2: Log the contents of the actions array for further inspection
        if (actions && actions.length > 0) {
            actions.forEach((action, index) => {
                console.log(`Action ${index + 1}:`, action);
            });
        } else {
            console.log("No actions present or actions array is empty.");
        }
    
        // Case where no actions were logged
        if (!actions || actions.length === 0) {
            console.log("No actions to display in the summary.");
            this.modal.innerHTML = `
                <div class="modal-content">
                    <h2>Turn Summary for Player ${player.id}</h2>
                    <p>No actions were taken during this turn.</p>
                    <p>Remaining AP: 0</p>
                    <button id="end-turn-btn">End Turn</button>
                </div>
            `;
        } else {
            // Step 3: Filter out any falsy or empty actions (if necessary)
            let validActions = actions.filter(action => action);
            console.log("Filtered valid actions:", validActions);
    
            // Step 4: Generate HTML list of valid actions
            let actionSummary = validActions.map((action, index) => `<li>Action ${index + 1}: ${action}</li>`).join("");
            console.log("Generated Action Summary HTML:", actionSummary);
    
            // Step 5: Create the modal content with the actions listed
            this.modal.innerHTML = `
                <div class="modal-content">
                    <h2>Turn Summary for Player ${player.id}</h2>
                    <ul>${actionSummary}</ul>
                    <p>Remaining AP: 0</p>  <!-- Display 0 AP at the end of the turn -->
                    <button id="end-turn-btn">End Turn</button>
                </div>
            `;
        }
    
        // Step 6: Display the modal
        console.log("Displaying the turn summary modal.");
        this.modal.style.display = "block";
    
        // Step 7: Ensure the 'End Turn' button works correctly
        const endTurnBtn = document.getElementById("end-turn-btn");
        if (endTurnBtn) {
            console.log("Attaching event listener to the 'End Turn' button.");
            endTurnBtn.removeEventListener("click", this.endTurnHandler);  // Clear previous listeners if any
            this.endTurnHandler = () => {
                console.log(`Turn end confirmed for Player ${player.id}`);
                this.hideModal();
                callback();  // Proceed to the next turn
            };
            endTurnBtn.addEventListener("click", this.endTurnHandler);
        } else {
            console.error("End Turn button not found in the DOM.");
        }
    }
    
    
    

    hideModal() {
        this.modal.style.display = "none";  // Hide the modal
    }
}
