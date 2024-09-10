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

        // Add the "Create Local Spy" option if conditions are met
        if (player.ownsDistrict(cell)) {
            if (player.gold >= 20 && player.intel >= 5 && player.hasAvailableAP(1)) {
                this.addOption('Create Local Spy (Cost: 20 gold, 5 intel, 1 AP)', () => {
                    this.createLocalSpy(cell, player);
                });
            } else {
                this.addOption('Create Local Spy (Insufficient Resources)', () => {}, true);
            }
        }

        // Add an option to close the menu
        this.addOption('Close Menu', () => this.hideMenu());
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

    // Action: Create Local Spy
    createLocalSpy(cell, player) {
        if (player.gold >= 20 && player.intel >= 5) {
            // Deduct resources
            player.gold -= 20;
            player.intel -= 5;

            // Create the local spy
            const spy = new Spy('local', cell);
            player.assignSpy(spy);

            // Deduct 1 AP and update the game state
            player.spendAP(1);
            this.gameManager.spendAP(1);  // End the turn if all AP is spent

            // **Update the UI immediately** to reflect new values
            this.gameManager.uiManager.updateTurnInfo(player, player.getActionPoints());

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
}
