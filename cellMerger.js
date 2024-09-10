import { Cell } from './cell.js';

export class CellMerger {
    constructor(cellsData) {
        this.cellsData = cellsData;
    }

    mergeCells(cellId1, cellId2) {
        const cell1 = this.cellsData.find(cell => cell.id === cellId1);
        const cell2 = this.cellsData.find(cell => cell.id === cellId2);
    
        if (!cell1 || !cell2) return null;
    
        const sharedEdge = this.findSharedEdge(cell1, cell2);
        if (!sharedEdge || sharedEdge.length !== 2) return null;
    
        const combinedPoints = this.stitchPolygons(cell1.points, cell2.points, sharedEdge);
    
        if (combinedPoints.length < 4) return null;
    
        const mergedPolygon = turf.polygon([combinedPoints]);
    
        if (!turf.booleanValid(mergedPolygon)) return null;
    
        const mergedCell = new Cell(this.cleanPolygon(combinedPoints), cell1.id);
        mergedCell.neighbors = [...new Set([...cell1.neighbors, ...cell2.neighbors].filter(n => n.id !== cell1.id && n.id !== cell2.id))];
        mergedCell.merged = true;
    
        return mergedCell;
    }
    
    traversePoints(points, start, stop) {
        const startIndex = points.findIndex(p => this.arePointsEqual(p, start));
        const stopIndex = points.findIndex(p => this.arePointsEqual(p, stop));
    
        if (startIndex === -1 || stopIndex === -1) return [];
    
        if (startIndex < stopIndex) {
            return points.slice(startIndex, stopIndex + 1);
        }
        return [...points.slice(startIndex), ...points.slice(0, stopIndex + 1)];
    }

    stitchPolygons(points1, points2, sharedEdge) {
        const [startPoint, endPoint] = sharedEdge;
    
        const pointsFromCell1 = this.traversePoints(points1, endPoint, startPoint);
        const pointsFromCell2 = this.traversePoints(points2, startPoint, endPoint);
    
        const mergedPoints = [...pointsFromCell1, ...pointsFromCell2];
    
        return this.cleanPolygon(mergedPoints);
    }

    ensureClockwise(points) {
        const area = this.calculateSignedArea(points);
        return area > 0 ? points : points.reverse();
    }

    calculateSignedArea(points) {
        let area = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const [x1, y1] = points[i];
            const [x2, y2] = points[i + 1];
            area += (x2 - x1) * (y2 + y1);
        }
        return area;
    }

    findSharedEdge(cell1, cell2) {
        const edges1 = this.getEdges(cell1.points);
        const edges2 = this.getEdges(cell2.points);

        for (let edge1 of edges1) {
            for (let edge2 of edges2) {
                if (this.areEdgesEqual(edge1, edge2)) return edge1;
            }
        }
        return null;
    }

    getEdges(points) {
        const edges = [];
        for (let i = 0; i < points.length - 1; i++) {
            edges.push([points[i], points[i + 1]]);
        }
        return edges;
    }

    areEdgesEqual(edge1, edge2) {
        return (
            this.arePointsEqual(edge1[0], edge2[0]) &&
            this.arePointsEqual(edge1[1], edge2[1])
        ) || (
            this.arePointsEqual(edge1[0], edge2[1]) &&
            this.arePointsEqual(edge1[1], edge2[0])
        );
    }

    cleanPolygon(points) {
        const uniquePoints = [...new Set(points.map(JSON.stringify))].map(JSON.parse);

        if (uniquePoints.length < 3) return [];

        const firstPoint = uniquePoints[0];
        const lastPoint = uniquePoints[uniquePoints.length - 1];
        if (!this.arePointsEqual(firstPoint, lastPoint)) {
            uniquePoints.push(firstPoint);
        }

        return uniquePoints;
    }

    arePointsEqual(p1, p2) {
        const tolerance = 0.000001;
        return Math.abs(p1[0] - p2[0]) < tolerance && Math.abs(p1[1] - p2[1]) < tolerance;
    }
}
