import { ModalManager } from "./modalManager.js";
import { ActionLogger } from "./actionLogger.js"; 

export class GameManager {
    constructor(map, players, uiManager) {
        this.map = map;
        this.players = players;
        this.uiManager = uiManager;
        this.currentPlayerIndex = 0;
        this.currentPlayer = this.players[this.currentPlayerIndex];
        this.turnAP = this.currentPlayer.getActionPoints();
        this.modalManager = new ModalManager();  // Manage turn start/end modals
        this.actionLogger = new ActionLogger(); 
        this.startGame();
    }

    startGame() {
        // Make sure we assign cells before starting turns
        this.startTurn();
    }

    startTurn() {
        this.currentPlayer = this.players[this.currentPlayerIndex];
        
        // Calculate AP for the new turn
        this.turnAP = this.currentPlayer.getActionPoints();
        console.log(`START TURN: Player ${this.currentPlayer.id} - AP: ${this.turnAP}`);
        
        // **Deduct spy upkeep and log it if greater than zero**
        const totalUpkeepCost = this.currentPlayer.spies.length * 3;  // 3 gold per spy
        if (totalUpkeepCost > 0) {
            if (this.currentPlayer.gold >= totalUpkeepCost) {
                this.currentPlayer.gold -= totalUpkeepCost;
                console.log(`Spy upkeep deducted: ${totalUpkeepCost} gold. Remaining gold: ${this.currentPlayer.gold}`);
                
                // **Log the total upkeep action** as one item
                const upkeepLogMessage = `Paid ${totalUpkeepCost} gold for the upkeep of ${this.currentPlayer.spies.length} spies.`;
                this.actionLogger.logAction(upkeepLogMessage);
            } else {
                console.log(`Player ${this.currentPlayer.id} does not have enough gold for spy upkeep!`);
                const insufficientLogMessage = `Could not pay spy upkeep! Insufficient gold (${this.currentPlayer.gold}).`;
                this.actionLogger.logAction(insufficientLogMessage);
            }
        }
    
        // Update the UI to reflect the new gold and AP
        this.uiManager.updateTurnInfo(this.currentPlayer, this.turnAP);
    
        this.modalManager.showTurnAnnouncement(this.currentPlayer, () => {
            console.log(`Player ${this.currentPlayer.id}'s turn is underway.`);
            this.uiManager.updateTurnInfo(this.currentPlayer, this.turnAP);
            console.log("UI updated with new AP.");
        });
    }
    
    endTurn() {
        console.log(`END TURN: Player ${this.currentPlayer.id} - AP: ${this.turnAP}`);
        setTimeout(() => {
            const actions = [...this.actionLogger.getTurnSummary()];
            
            console.log("Turn summary actions:", actions);  // Log to verify actions at this point
        
            // Move to the next player
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            console.log(`Switching to Player ${this.currentPlayerIndex + 1}`);
    
            // Show turn summary and log actions in the modal
            this.modalManager.showTurnSummary(this.currentPlayer, actions, () => {
                console.log(`Player ${this.currentPlayer.id}'s turn ended.`);
                this.actionLogger.clearLog();
                this.startTurn();  // Start the next player's turn after the summary
            });
        }, 100);  // Small delay to ensure actions are logged
    }
    
    spendAP(amount = 1) {
        this.turnAP -= amount;  // Decrease the current turn's AP for actions
        console.log(`AP SPENT: ${amount} - Remaining AP: ${this.turnAP}`);
        this.uiManager.updateTurnAP(this.turnAP);  // Reflect updated AP in the UI
    
        if (this.turnAP <= 0) {
            console.log(`AP DEPLETED: Ending turn for Player ${this.currentPlayer.id}`);
            this.endTurn();  // End turn if no AP remains
        }
    }
    
    skipTurn() {
        this.endTurn();
    }

    // Function to calculate the Euclidean distance between two points
    calculateDistance(centroid1, centroid2) {
        if (!centroid1 || !centroid2) {
            console.error("Missing centroid during distance calculation:", centroid1, centroid2);
            return Infinity;  // Return a large value to avoid choosing this cell
        }
        const dx = centroid1[0] - centroid2[0];
        const dy = centroid1[1] - centroid2[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Ensure all cells have their centroid calculated
    assignCentroidsToCells() {
        this.map.cellsData.forEach(cell => {
            if (!cell.centroid) {
                try {
                    cell.centroid = turf.centroid(cell.createTurfPolygon()).geometry.coordinates;
                    console.log(`Assigned centroid to cell ID ${cell.id}:`, cell.centroid);
                } catch (error) {
                    console.error(`Error calculating centroid for cell ID ${cell.id}:`, error);
                }
            }
        });
    }

    // Assign cells to players based on distance
    assignCellsToPlayers() {
        this.assignCentroidsToCells(); // Ensure all cells have centroids
        const unassignedCells = this.map.cellsData.slice();  // Copy the cells data

        if (unassignedCells.length < this.players.length) {
            console.error("Not enough cells to assign to players.");
            return;
        }

        // Assign the first player's cell randomly
        const player1Cell = unassignedCells.splice(Math.floor(Math.random() * unassignedCells.length), 1)[0];
        console.log(`Assigned cell ID ${player1Cell.id} to Player 1`);
        this.players[0].assignCell(player1Cell);

        // Assign the second player's cell based on maximum distance from player 1's cell
        const player2Cell = this.getFarthestCell(unassignedCells, this.players[0].cells[0].centroid);
        if (!player2Cell) {
            console.error("Could not find a valid cell for Player 2.");
            return;
        }
        console.log(`Assigned cell ID ${player2Cell.id} to Player 2`);
        this.players[1].assignCell(player2Cell);
        unassignedCells.splice(unassignedCells.findIndex(c => c === player2Cell), 1);

        // Assign the third player's cell based on maximum distance from both player 1 and player 2
        const player3Cell = this.getFarthestCell(unassignedCells, this.players[0].cells[0].centroid, this.players[1].cells[0].centroid);
        if (!player3Cell) {
            console.error("Could not find a valid cell for Player 3.");
            return;
        }
        console.log(`Assigned cell ID ${player3Cell.id} to Player 3`);
        this.players[2].assignCell(player3Cell);
    }

    // Helper function to get the farthest cell from one or two centroids
    getFarthestCell(cells, centroid1, centroid2 = null) {
        return cells.reduce((farthestCell, cell) => {
            const distFromCentroid1 = this.calculateDistance(centroid1, cell.centroid);
            const totalDistance = centroid2
                ? distFromCentroid1 + this.calculateDistance(centroid2, cell.centroid)
                : distFromCentroid1;
            
            return !farthestCell || totalDistance > this.calculateDistance(centroid1, farthestCell.centroid)
                + (centroid2 ? this.calculateDistance(centroid2, farthestCell.centroid) : 0)
                ? cell
                : farthestCell;
        }, null);
    }
}
