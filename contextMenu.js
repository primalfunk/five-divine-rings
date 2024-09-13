import { Spy } from './spy.js';

export class ContextMenu {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.menuElement = this.createMenuElement();
        document.body.appendChild(this.menuElement);

        // Hide the menu when clicking elsewhere
        document.addEventListener('click', () => this.hideMenu());
    }

    createMenuElement() {
        const menu = document.createElement('div');
        menu.classList.add('context-menu');
        menu.style.position = 'absolute';
        menu.style.display = 'none';
        return menu;
    }

    showMenu(cell, event) {
        event.preventDefault();  // Prevent the default right-click menu
        const player = this.gameManager.currentPlayer;
    
        // Clear previous menu items
        this.menuElement.innerHTML = '';
    
        // Position the menu based on click
        this.menuElement.style.left = `${event.pageX}px`;
        this.menuElement.style.top = `${event.pageY}px`;
        this.menuElement.style.display = 'block';
    
        // **Check if the player has a spy in this cell by comparing IDs**
        const spy = player.spies.find(s => s.district.id === cell.id);
    
        // Case 1: Show the "Move Spy" option if a spy is present and the player has enough AP
        if (spy && player.hasAvailableAP(1)) {
            this.addOption('Move Spy (Cost: 1 AP)', () => {
                this.enterDistrictSelectionMode(spy, player);  // Enter district selection mode for valid neighbors
            });
        }
    
        // Case 2: Allow the player to create a new spy if resources and AP are available
        if (player.gold >= 20 && player.intel >= 5 && player.hasAvailableAP(1)) {
            this.addOption('Create Local Spy (Cost: 20 gold, 5 intel, 1 AP)', () => {
                this.createLocalSpy(cell, player);
            });
        } else {
            // Show a disabled "Create Spy" option if resources or AP are insufficient
            this.addOption('Create Local Spy (Insufficient Resources)', () => {}, true);  // Disabled option
        }
    
        // Add an option to close the menu
        this.addOption('Close Menu', () => this.hideMenu());
    }
    
    enterDistrictSelectionMode(spy, player) {
        console.log(`Entering district selection mode for spy in District ${spy.district.id}`);
    
        // Highlight valid neighboring districts for movement
        this.gameManager.map.highlightValidDistricts(spy, player);
    
        // Listen for clicks on valid neighboring districts
        d3.selectAll(".highlighted").on("click", (event, d) => {
            // Ensure the clicked district (d) is correctly detected
            console.log(`Clicked to move spy to District ${d.id}`);
            spy.district = d;  // Move spy to the selected district
            this.gameManager.spendAP(1);  // Deduct 1 AP
    
            // Log the movement action
            const moveLogMessage = `Moved spy from District ${spy.district.id} to District ${d.id}.`;
            this.gameManager.actionLogger.logAction(moveLogMessage);
            console.log(moveLogMessage);
    
            // Clear highlights after the move
            this.gameManager.map.clearHighlights();
            this.gameManager.uiManager.updateTurnInfo(player, this.gameManager.turnAP);
    
            // Remove click handler to avoid duplicate movements
            d3.selectAll(".highlighted").on("click", null);
        });
    
        // Handle clicking outside the highlighted area (cancel move)
        d3.select("body").on("click", (event) => {
            if (!d3.select(event.target).classed("highlighted")) {
                console.log("Spy movement canceled.");
                this.gameManager.map.clearHighlights();  // Clear highlights on cancel
                d3.select("body").on("click", null);  // Remove this event listener
            }
        });
    }

    addOption(text, action, disabled = false) {
        const option = document.createElement('div');
        option.textContent = text;
        option.classList.add('menu-option');
        
        if (!disabled) {
            option.addEventListener('click', action);
        } else {
            option.classList.add('disabled');  // Add disabled styling (to be defined in CSS)
        }

        this.menuElement.appendChild(option);
    }

    hideMenu() {
        this.menuElement.style.display = 'none';
    }

    createLocalSpy(cell, player) {
        if (player.gold >= 20 && player.intel >= 5) {
            // Deduct resources
            player.gold -= 20;
            player.intel -= 5;
    
            // Create the local spy
            const spy = new Spy('local', cell);
            player.assignSpy(spy);
    
            // Deduct 1 AP and update the game state
            this.gameManager.spendAP(1);  // Deduct turnAP and check for end of turn
    
            // **Manually update gold and intel in the UI without recalculating AP**
            document.getElementById('player-gold').textContent = player.gold;
            document.getElementById('player-intel').textContent = player.intel;
    
            // **Update only the AP display, not recalculating it**
            this.gameManager.uiManager.updateTurnAP(this.gameManager.turnAP);  // Update AP without affecting gold/intel
    
            // **Log the action in the action logger**
            const logMessage = `Created Local Spy in District ${cell.id}. Gold spent: 20, Intel spent: 5. Remaining Gold: ${player.gold}, Remaining Intel: ${player.intel}.`;
            this.gameManager.actionLogger.logAction(logMessage);
    
            console.log(logMessage);
    
            // Hide the menu after the action
            this.hideMenu();
        } else {
            console.error("Not enough resources to create a local spy.");
        }
    }

    moveSpy(spy, player) {
        // Highlight valid neighboring districts for movement
        this.gameManager.map.highlightValidDistricts(spy, player);
    
        // Listen for clicks on the map to either move the spy or cancel
        d3.selectAll(".highlighted").on("click", (event, targetDistrict) => {
            // Move the spy to the clicked district
            spy.district = targetDistrict;
            this.gameManager.spendAP(1);  // Deduct 1 AP
            player.spendAP(1);
    
            // Log the movement action
            const moveLogMessage = `Moved spy from District ${spy.district.id} to District ${targetDistrict.id}.`;
            this.gameManager.actionLogger.logAction(moveLogMessage);
            console.log(moveLogMessage);
    
            // Clear highlights and reset map
            this.gameManager.map.clearHighlights();
            this.gameManager.uiManager.updateTurnInfo(player, this.gameManager.turnAP);
    
            // Remove click handler to avoid duplicate movements
            d3.selectAll(".highlighted").on("click", null);
        });
    
        // Handle clicking outside the highlighted area (cancel move)
        d3.select("body").on("click", (event) => {
            if (!d3.select(event.target).classed("highlighted")) {
                console.log("Spy movement canceled.");
                this.gameManager.map.clearHighlights();
                d3.select("body").on("click", null);  // Remove this event listener
            }
        });
    }
}
