export class Player {
    constructor(id, color, name) {
        this.id = id;
        this.color = color;
        this.name = name;
        this.gold = 50;
        this.intel = 20;
        this.cells = [];  // Player's districts
        this.spies = [];  // Player's spies
        this.actionPoints = 0;  // AP will be dynamically calculated
    }

    assignCell(cell) {
        cell.owner = this.id;
        this.cells.push(cell);
    }

    // Check if the player owns a specific district
    ownsDistrict(district) {
        return this.cells.includes(district);
    }

    // Spend AP, reduce by the specified amount
    spendAP(amount = 1) {
        this.actionPoints -= amount;
        return this.actionPoints;
    }

    // Check if the player has enough AP to perform an action
    hasAvailableAP(amount) {
        return this.actionPoints >= amount;
    }

    // Assign a spy to the player
    assignSpy(spy) {
        this.spies.push(spy);
        console.log(`Assigned spy to district ID ${spy.district.id}`);
    }

    // Get the player's current AP based on the number of cells and spies
    getActionPoints() {
        this.actionPoints = this.cells.length + this.spies.length;  // 1 AP per district and 1 AP per spy
        return this.actionPoints;
    }
}
