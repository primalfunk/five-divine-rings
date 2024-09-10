export class ActionLogger {
    constructor() {
        this.actions = [];
    }

    logAction(action) {
        console.log("Action logged:", action);  // Log every action added
        this.actions.push(action);
    }

    getTurnSummary() {
        console.log("Fetching Turn Summary:", this.actions);  // Verify the actions to be returned
        return this.actions;
    }

    clearLog() {
        console.log("Clearing log for new turn.");  // Ensure log is cleared
        this.actions = [];
    }
}