export class ActionLogger {
    constructor() {
        this.actions = [];
    }

    logAction(action) {
        this.actions.push(action);
    }

    getTurnSummary() {
        return this.actions;
    }

    clearLog() {
        this.actions = [];
    }
}