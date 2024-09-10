export class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager; // Reference to GameManager

        // Initialize event listener for 'Skip' button
        document.getElementById('skip-button').addEventListener('click', () => {
            this.gameManager.skipTurn(); // Skip turn when button is clicked
        });
    }

    // Method to update the UI when a new turn starts
    updateTurnInfo(player, turnAP) {
        // Update turn-specific information in the UI
        document.getElementById('turn-player').textContent = player.id;
        document.getElementById('turn-ap').textContent = turnAP;
        document.getElementById('player-gold').textContent = player.gold;
        document.getElementById('player-intel').textContent = player.intel;
        document.getElementById('player-districts').textContent = player.cells.length;
    }

    // Method to update the remaining Action Points during a player's turn
    updateTurnAP(turnAP) {
        document.getElementById('turn-ap').textContent = turnAP;
    }

    // Display district information when hovering over a district
    showDistrictInfo(id, owner, population) {
        document.getElementById("district-id").textContent = id;
        document.getElementById("district-owner").textContent = owner !== null ? owner : "Neutral";
        document.getElementById("district-population").textContent = population.toLocaleString();
    }

    // Clear district information when the mouse leaves the district
    hideDistrictInfo() {
        document.getElementById("district-id").textContent = "";
        document.getElementById("district-owner").textContent = "";
        document.getElementById("district-population").textContent = "";
    }
}
