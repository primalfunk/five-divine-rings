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

        // Attach event listener to the button
        document.getElementById("start-turn-btn").addEventListener("click", () => {
            this.hideModal();
            callback();  // Continue the game after turn announcement
        });
    }

    // Display the turn summary modal
    showTurnSummary(player, actions, callback) {
        let actionSummary = actions.map(action => `<li>${action}</li>`).join("");
        this.modal.innerHTML = `
            <div class="modal-content">
                <h2>Turn Summary for Player ${player.id}</h2>
                <ul>${actionSummary}</ul>
                <button id="end-turn-btn">End Turn</button>
            </div>
        `;
        this.modal.style.display = "block";

        // Attach event listener to the button
        document.getElementById("end-turn-btn").addEventListener("click", () => {
            this.hideModal();
            callback();  // Proceed to the next player's turn
        });
    }

    hideModal() {
        this.modal.style.display = "none";
    }
}
