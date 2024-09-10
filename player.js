export class Player {
    constructor(id, color, name) {
        this.id = id;
        this.color = color;
        this.cells = [];
        this.gold = 50;    // Starting gold
        this.intel = 20;   // Starting intel
        this.ap = 1;      // Action points (calculated each turn)
        this.name = name;
    }

    assignCell(cell) {
        cell.owner = this.id;
        this.cells.push(cell);
    }

    getActionPoints() {
        // For now, AP equals the number of districts owned (since no spies yet)
        return this.cells.length;
    }
}