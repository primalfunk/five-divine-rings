export class ModalManager {
    constructor() {
        this.modal = document.createElement("div");
        this.modal.className = "modal";
        document.body.appendChild(this.modal);
    }

    // Display the turn announcement modal
    showTurnAnnouncement(player, callback) {
        this.modal.innerHTML = `
            <div class="modal-content">
                <h2>Player ${player.id}'s Turn</h2>
                <p>${player.name}, prepare your strategy.</p>
                <button id="start-turn-btn">Start Turn</button>
            </div>
        `;
        this.modal.style.display = "block";

        document.getElementById("start-turn-btn").addEventListener("click", () => {
            this.hideModal();
            callback();  // Proceed with the turn
        });
    }

    showTurnSummary(player, actions, callback) {
        console.log("Actions passed to showTurnSummary:", actions);
        console.log("Type of actions:", Array.isArray(actions) ? "Array" : typeof actions);
        console.log("Length of actions:", actions ? actions.length : "null or undefined");
    
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
            // Create the list of actions in HTML format
            let actionSummary = actions.map(action => `<li>${action}</li>`).join("");
            console.log("Action Summary HTML:", actionSummary);  // Log the HTML content
    
            this.modal.innerHTML = `
                <div class="modal-content">
                    <h2>Turn Summary for Player ${player.id}</h2>
                    <ul>${actionSummary}</ul>
                    <p>Remaining AP: 0</p>  <!-- Display 0 AP at the end of the turn -->
                    <button id="end-turn-btn">End Turn</button>
                </div>
            `;
        }
    
        // Display the modal
        this.modal.style.display = "block";
    
        // Ensure only one event listener is attached to the end turn button
        const endTurnBtn = document.getElementById("end-turn-btn");
        if (endTurnBtn) {
            endTurnBtn.removeEventListener("click", this.endTurnHandler);  // Clear previous listeners if any
            this.endTurnHandler = () => {
                this.hideModal();
                callback();  // Proceed to the next turn
            };
            endTurnBtn.addEventListener("click", this.endTurnHandler);
        }
    }
    

    hideModal() {
        this.modal.style.display = "none";  // Hide the modal
    }
}
