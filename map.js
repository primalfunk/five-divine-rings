import { Cell } from './cell.js';
import { CellMerger } from './cellMerger.js';
import { ContextMenu } from './contextMenu.js';

export class Map {
    constructor(width, height, numCells, target) {
        this.hoverCallback = null;
        this.width = width;
        this.height = height;
        this.numCells = numCells;
        this.targetCells = target;
        this.cellsData = [];
        this.svg = d3.select("#voronoi-map").attr("width", this.width).attr("height", this.height);
        this.generateVoronoi();
        this.render();
        this.mergeUntilTarget();
        this.contextMenu = null; 
    }

    setGameManager(gameManager) {
        // Initialize the ContextMenu after gameManager is set
        this.contextMenu = new ContextMenu(gameManager);
    }

    assignPopulations() {
        this.cellsData.forEach(cell => {
            cell.population = Math.floor(Math.random() * (80000 - 5000 + 1)) + 5000; // Random population between 5000 and 80000
        });
    }

    onDistrictHover(callback) {
        this.hoverCallback = callback;
    }

    generateVoronoi() {
        const points = Array.from({ length: this.numCells }, () => [Math.random() * this.width, Math.random() * this.height]);
        const delaunay = d3.Delaunay.from(points);
        const voronoi = delaunay.voronoi([0, 0, this.width, this.height]);
    
        this.cellsData = [];
        for (let i = 0; i < this.numCells; i++) {
            const polygon = Array.from(voronoi.cellPolygon(i));
            const cell = new Cell(polygon, i);
            this.cellsData.push(cell);
        }
        this.findNeighbors();
        this.render();
    }

    render() {
        const svg = d3.select("#voronoi-map");
        svg.selectAll("*").remove(); // Clear previous elements
    
        svg.selectAll("path")
            .data(this.cellsData)
            .enter()
            .append("path")
            .attr("d", d => {
                const points = d.points.map(p => p.join(",")).join("L");
                return `M${points}Z`;
            })
            .attr("stroke", "black")
            .attr("fill", d => {
                if (d.owner === 1) return 'blue';
                if (d.owner === 2) return 'red';
                if (d.owner === 3) return 'green';
                return '#d3d3d3';  // Default color for unowned cells
            })
            .style("pointer-events", "all")  // Ensure hover is detected anywhere in the district
            .on("mouseover", (event, d) => {
                // Store the original fill color for reverting on mouseout
                d.originalFill = d3.select(event.target).attr("fill");
    
                // Lighten the color during hover
                d3.select(event.target)
                    .attr("fill", this.lightenColor(d.originalFill, 0.4))  // Lighten the original color
                    .attr("stroke", "yellow")
                    .attr("stroke-width", 3);
    
                // Ensure correct values are passed: id, owner, and population
                if (this.hoverCallback) {
                    this.hoverCallback({
                        id: d.id,                 // Pass district id
                        owner: d.owner,           // Pass district owner
                        population: d.population  // Pass district population
                    });
                }
            })
            .on("mouseout", (event, d) => {
                // Revert to the original fill color and stroke
                d3.select(event.target)
                    .attr("fill", d.originalFill)  // Revert to the original player color
                    .attr("stroke", "black")
                    .attr("stroke-width", 1);
    
                // Call the hover callback with null when mouse leaves the district
                if (this.hoverCallback) {
                    this.hoverCallback(null);
                }
            })            
            .style("pointer-events", "all")  // Ensure hover is detected anywhere in the district
            .on("contextmenu", (event, d) => {
                this.contextMenu.showMenu(d, event);  // Show context menu on right-click
            });
    }
    
    
    // Utility function to convert named colors to hex
    colorToHex(color) {
        const colors = {
            "black": "#000000",
            "blue": "#0000FF",
            "red": "#FF0000",
            "green": "#008000",
            "gray": "#808080",
            // Add other colors as needed
        };
        return colors[color.toLowerCase()] || color;  // Return hex if found, else return original
    }
    
    // Utility function to lighten a color
    lightenColor(color, percent) {
        const hexColor = this.colorToHex(color);  // Convert to hex if necessary
        const num = parseInt(hexColor.replace("#", ""), 16),
              amt = Math.round(2.55 * percent * 100),
              R = (num >> 16) + amt,
              G = (num >> 8 & 0x00FF) + amt,
              B = (num & 0x0000FF) + amt;
    
        return "#" + (
            0x1000000 + 
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
    
    
    
    
    mergeTwoCells(smallestCell) {
        if (smallestCell.neighbors.length === 0) return;
    
        const neighborCell = smallestCell.neighbors.find(n => !n.merged);
        if (!neighborCell) return;
    
        const cellMerger = new CellMerger(this.cellsData);
        const mergedCell = cellMerger.mergeCells(smallestCell.id, neighborCell.id);
    
        if (mergedCell) {
            smallestCell.merged = true;
            neighborCell.merged = true;
    
            this.cellsData = this.cellsData.filter(c => c.id !== smallestCell.id && c.id !== neighborCell.id);
            this.cellsData.push(mergedCell);
    
            this.findNeighbors();
            this.render();
        }
    }

    findNeighbors() {
        this.cellsData.forEach(cell => {
            if (cell.merged) return;
            cell.neighbors = [];
            this.cellsData.forEach(otherCell => {
                if (cell !== otherCell && !otherCell.merged && this.findSharedEdge(cell, otherCell)) {
                    cell.neighbors.push(otherCell);
                }
            });
        });
    }

    findSharedEdge(cell1, cell2) {
        const edges1 = this.getEdges(cell1.points);
        const edges2 = this.getEdges(cell2.points);
    
        for (let edge1 of edges1) {
            for (let edge2 of edges2) {
                if (this.areEdgesEqual(edge1, edge2)) {
                    return edge1;
                }
            }
        }
        return null;
    }

    areEdgesEqual(edge1, edge2) {
        return (
            (edge1[0][0] === edge2[0][0] && edge1[0][1] === edge2[0][1] &&
             edge1[1][0] === edge2[1][0] && edge1[1][1] === edge2[1][1]) ||
            (edge1[0][0] === edge2[1][0] && edge1[0][1] === edge2[1][1] &&
             edge1[1][0] === edge2[0][0] && edge1[1][1] === edge2[0][1])
        );
    }

    getEdges(points) {
        const edges = [];
        for (let i = 0; i < points.length - 1; i++) {
            edges.push([points[i], points[i + 1]]);
        }
        return edges;
    }

    mergeUntilTarget() {
        while (this.cellsData.length > this.targetCells) {
            this.cellsData.sort((a, b) => a.area - b.area);
    
            let smallestCell = null;
            for (let cell of this.cellsData) {
                if (!cell.merged && cell.neighbors.some(n => !n.merged)) {
                    smallestCell = cell;
                    break;
                }
            }
    
            if (!smallestCell) return;
    
            this.mergeTwoCells(smallestCell);
        }
        this.assignPopulations();
    }
}
