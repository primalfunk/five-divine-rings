export class Cell {
    constructor(points, id) {
        this.points = this.ensureClosedPolygon(points);
        this.id = id;
        this.area = this.calculateArea();
        this.merged = false;
        this.neighbors = [];
        this.population;
        this.owner = null; 
    }

    // Ensure the polygon is closed (first and last points must be the same)
    ensureClosedPolygon(points) {
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];

        // Round points to avoid floating-point precision issues
        const roundPoint = (point) => point.map(coord => parseFloat(coord.toFixed(6)));

        if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
            points.push(roundPoint(firstPoint));  // Close the polygon by adding the first point at the end
        }

        return points.map(roundPoint); // Round all points for consistency
    }

    // Snap points to a grid to avoid floating-point precision issues
    snapToGrid(points, gridSize = 1e-6) {
        return points.map(point => [
            Math.round(point[0] / gridSize) * gridSize,
            Math.round(point[1] / gridSize) * gridSize
        ]);
    }

    createTurfPolygon() {
        // Snap points to a grid before creating the polygon
        const snappedPoints = this.snapToGrid(this.ensureClosedPolygon(this.points));
        return turf.polygon([snappedPoints]);
    }

    // Calculate the area of the polygon using Turf.js
    calculateArea() {
        const turfPolygon = this.createTurfPolygon();
        return Math.abs(turf.area(turfPolygon));
    }

    roundPoint(point, precision = 6) {
        return point.map(coord => parseFloat(coord.toFixed(precision)));
    }
}
