export class Player {
    constructor(id, color, name) {
        this.id = id;
        this.color = color;
        this.name = name;
        this.gold = 50;
        this.intel = 20;
        this.cells = [];  // Player's districts
        this.spies = [];  // Player's spies
        this.actionPoints = 0;  // AP will be dynamically calculated at the start of each turn
    }

    assignCell(cell) {
        cell.owner = this.id;
        this.cells.push(cell);
    }

    ownsDistrict(district) {
        return this.cells.includes(district);
    }

    // Calculate AP based on owned districts and spies, only at the start of a turn
    getActionPoints() {
        this.actionPoints = this.cells.length + this.spies.length;
        return this.actionPoints;
    }

    // Spy assignment should not affect AP mid-turn
    assignSpy(spy) {
        this.spies.push(spy);
        console.log(`Assigned spy to district ID ${spy.district.id}`);
        // Do not recalculate AP mid-turn, as it's already set for this turn
    }

    // Check if the player has enough AP to perform an action
    hasAvailableAP(amount) {
        return this.actionPoints >= amount;
    }
}
