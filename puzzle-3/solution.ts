// import input from './input.json';
import input from './input.json';
import _ from "lodash";
import assert from 'assert';

interface Point {
    x: number;
    y: number;
}

/**
 * Guaranteed to be sorted by closest to origin
 */
type Segment = [Point, Point];

const opMap = {
    D: (point: Point, value: number) => ({x: point.x, y: point.y - value}),
    U: (point: Point, value: number) => ({x: point.x, y: point.y + value}),
    L: (point: Point, value: number) => ({x: point.x - value, y: point.y}),
    R: (point: Point, value: number) => ({x: point.x + value, y: point.y}),
}

/**
 * Each Segment is sorted so Segment = [CloserPoint, FurtherPoint]
 */
function getPaths(start: Point, path: string[]): Segment[] {
    const segments: Segment[] = [];
    let currPoint = start; 
    for (const move of path) {
        //console.log("Processing move: ", move[0]);
        const opCode = move.charAt(0) as keyof typeof opMap;
        const op = opMap[opCode];
        const value = parseInt(move.substring(1), 10);

        if (value === NaN || !op) {
            throw new Error(`Failed to parse move`);
        }

        const endPoint = op(currPoint, value);

        // Sort segment for use later
        const segment = _.sortBy([currPoint, endPoint], point => manhatDist(point)) as Segment;
        segments.push(segment);
        
        currPoint = endPoint;
    }

    return segments;
}

function isHorizontal(segment: Segment) {
    return segment[0].y === segment[1].y;
}

function inBetween(point: Point, segment: Segment, coord: keyof Point) {
    assert(coord === 'x' || coord == 'y', `received coord: ${coord}`);
    return point[coord] >= segment[0][coord] && point[coord] <= segment[1][coord] ||
        point[coord] >= segment[1][coord] && point[coord] <= segment[0][coord];
}

function sameSign(left: number, right: number) {
    return left >= 0 && right >= 0 ||
        left <= 0 && right <= 0;
}

function manhatDist(point: Point | null): number {    
    return point ? Math.abs(point.x) + Math.abs(point.y) : NaN;
}

function getClosestPoint(points: Array<Point | null>): Point | null {
    return _.sortBy(points, (point: Point | null) => manhatDist(point))[0]
}

/**
 * If true segments are both parallel and share the same value in coord
 */
function arePlanarInCoord(leftSeg: Segment, rightSeg: Segment, coord: keyof Point) {
    const planeValue = leftSeg[0][coord];
    return planeValue === leftSeg[1][coord] &&
        planeValue === rightSeg[0][coord] &&
        planeValue === rightSeg[1][coord];
}


function getClosestIntersectionForSegments(leftSeg: Segment, rightSeg: Segment): Point | null {
    const [closerSeg, furtherSeg] = _.sortBy([leftSeg, rightSeg], segment => manhatDist(segment[0])) as [Segment, Segment];

    if (isHorizontal(closerSeg)) {
        if (arePlanarInCoord(closerSeg, furtherSeg, 'y')) {
            if (closerSeg[1].x > furtherSeg[0].x) {
                return furtherSeg[0];
            }
        } else if (!isHorizontal(furtherSeg)) {
            // perpendicular segments
            const closerSegY = closerSeg[0].y;
            if (inBetween(furtherSeg[0], closerSeg, 'x')) {
                if (!sameSign(furtherSeg[0].y - closerSegY, furtherSeg[1].y - closerSegY)) {
                    // We have an intersection
                    return {x: furtherSeg[0].x, y: closerSegY};
                }
            }
            
        }

        return null;
    }

    if (arePlanarInCoord(closerSeg, furtherSeg, 'x')) {
        if (closerSeg[1].y > furtherSeg[0].y) {
            return furtherSeg[0];
        }
    } else if (isHorizontal(furtherSeg)) {
        // perpendicular segments
        const closerSegX = closerSeg[0].x;
        if (inBetween(furtherSeg[0], closerSeg, 'y')) {
            if (!sameSign(furtherSeg[0].x - closerSegX, furtherSeg[1].x - closerSegX)) {
                // We have an intersection
                return {x: closerSegX, y: furtherSeg[0].y};
            }
        }
    }

    return null;
}

function getClosestIntersectionForPaths(left: Segment[], right: Segment[]) {
    let closestIntersection: Point | null = null;
    for (const leftSeg of left.slice(1)) { // The first segments can't intersect
        for (const rightSeg of right.slice(1)) {
            const maybeClosest = getClosestIntersectionForSegments(leftSeg, rightSeg);
            closestIntersection = getClosestPoint([maybeClosest, closestIntersection]);
        }
    }

    return closestIntersection;
}

const movementsOne = input.movements[0].split(",");
const movementsTwo = input.movements[1].split(",");

const pathOne = getPaths({x: 0, y: 0}, movementsOne);
const pathTwo = getPaths({x: 0, y: 0}, movementsTwo);

console.log('Answer: ', manhatDist(getClosestIntersectionForPaths(pathOne, pathTwo)));
