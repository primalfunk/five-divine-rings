import { Map } from './map.js';
import { UIManager } from './uiManager.js';
import { Player } from './player.js';
import { GameManager } from './gameManager.js';

const numCells = 60;
const targetCells = 35;

// Create players
const players = [
    new Player(1, 'blue', 'Jared'),
    new Player(2, 'red', 'Erin'),
    new Player(3, 'green', 'Sage')
];

// Instantiate the map
const map = new Map(800, 800, numCells, targetCells);

// Instantiate the UIManager (gameManager reference is passed later)
const uiManager = new UIManager();

// Instantiate the game manager and assign cells to players
const gameManager = new GameManager(map, players, uiManager);

// Now that gameManager is created, set it in uiManager
uiManager.gameManager = gameManager;

// Assign cells to players
gameManager.assignCellsToPlayers();
map.render(); // Render the map after player cells are assigned

// Start the game
gameManager.startGame();

// Connect the map's hover events to the UIManager
map.onDistrictHover((district) => {
    if (district) {
        uiManager.showDistrictInfo(district.id, district.owner, district.population);  // Pass owner and population
    } else {
        uiManager.hideDistrictInfo();
    }
});
