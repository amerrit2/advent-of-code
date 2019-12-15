import assert = require("assert");
import _ from 'lodash';
import input from './input';
import { assertThat } from "../util";

// const input = `.#..#
// .....
// #####
// ....#
// ...##`

const testInput = `.#..##.###...#######
##.############..##.
.#.######.########.#
.###.#######.####.#.
#####.##.#.##.###.##
..#####..#.#########
####################
#.####....###.#.#.##
##.#################
#####.##.###..####..
..######..##.#######
####.##.####...##..#
.#####..#.######.###
##...#.##########...
#.##########.#######
.####.#.###.###.#.##
....##.##.###..#####
.#.#.###########.###
#.#.#.#####.####.###
###.##.####.##.#..##` // Max visible = 210

interface Point {
    x: number;
    y: number;
    theta?: number;
    r?: number;
}

function makeCoords(image: string) {
    let x = 0;
    let y = 0;
    const coords: Point[] = [];
    for (const char of image) {
        if (char === "\n") {
            x = -1;
            y++;
        } else if (char === '#') {
            coords.push({x, y});
        }

        x++;
    }

    return coords;
}

// function calculateRelative(coords: Point[], reference: Point) {
//     for (const point of coords) {
//         point.relX = point.x - reference.x;
//         point.relY = point.y - reference.y;
//     }
// }

function round(num: number, sigDigits: number) {
    return Math.floor(num * Math.pow(10, sigDigits)) / Math.pow(10, sigDigits);
}


function calcTheta(y: number, x: number) { 
    let raw = Math.atan2(y, x);
    if (raw < 0) {
        raw += Math.PI * 2;
    }
    return round(raw, 5);
}


function calculateRelativePolar(coords: Point[], reference: Point) {
    for (const point of coords) {
        const relX = point.x - reference.x;
        const relY = point.y - reference.y;
        point.r = Math.sqrt(Math.pow(relX,2) + Math.pow(relY, 2));
        point.theta = calcTheta(relY, relX);
    }
}

const asteroidCoords = makeCoords(input);

// console.log(asteroidCoords);
// console.log(makeRelativeCoords(asteroidCoords, asteroidCoords[3]));
// console.log(calcThetas(asteroidCoords));

let maxVisible = 0;
let bestAsteroid: Point | null = null;;
for (const asteroid of asteroidCoords) {
    calculateRelativePolar(asteroidCoords, asteroid);
    const numVisible = _.uniq(_.map(asteroidCoords, point => point.theta)).length;
    if (numVisible > maxVisible) {
        bestAsteroid = asteroid;
        maxVisible = numVisible;
    }
}

console.log("Max visible: ", maxVisible);

if (!bestAsteroid) {
    throw new Error("Best Asteroid not found");
}


calculateRelativePolar(asteroidCoords, bestAsteroid);

function clockwiseDistance(angle: number, point: Point) {
    if (point.theta === undefined) { throw new Error('theta not defined for point'); }
    const raw = angle - point.theta;
    return round(raw < 0 ? raw + (2*Math.PI) : raw, 5);
}

const startingLaserTheta = round(Math.PI / 2, 5);
const sortedUniqueThetas = _.uniq(_.sortBy(asteroidCoords, (point) => clockwiseDistance(startingLaserTheta, point))
    .map(ast => ast.theta)) as number[];

console.log(sortedUniqueThetas);

const destructionOrder = [];
while (asteroidCoords.length > 0) {
    for (const uniqueTheta of sortedUniqueThetas) {
        const asteroidsInRay = _.filter(asteroidCoords, {theta: uniqueTheta});
        if (asteroidsInRay.length > 0) {
            const smallestR = _.min(asteroidsInRay.map(ast => ast.r));
            const closestAst = _.find(asteroidsInRay, {r: smallestR});
            if (!closestAst) {
                throw new Error('Failed to find closes ast');
            }

            destructionOrder.push(..._.remove(asteroidCoords, closestAst));
        }
    }
} 

console.log("dest order: ", destructionOrder.length);
console.log("Answer: ", destructionOrder[199].x * 100 + destructionOrder[199].y);
// const groupedAsteroids = _.groupBy(subGroup, 'theta');

// console.log(groupedAsteroids);


// function getSmallestR(asts: PolarPoint[]) {
//     const smallestR = _.min(asts.map(ast => ast.r)) as number;
//     const removed = _.remove(asts, {r: smallestR});
//     assertThat(removed[0] !== undefined, 'Asteroid not removed!');
//     return removed[0];
// }


// // console.log(getSmallestR(subGroup))
// // console.log(subGroup);

// console.log('sortedThetas = ', sortedUniqueThetas)

// const orderedByDestruction: PolarPoint[] = [];

// while (_.keys(groupedAsteroids).length > 0) {
//     for (const thetaVal of sortedUniqueThetas) {
//         const group = groupedAsteroids[thetaVal];
        
//         if (group) {
//             orderedByDestruction.push(getSmallestR(group));

//             if (group.length === 0) {
//                 delete groupedAsteroids[thetaVal];
//             }
//         }

//     }
// }


// // console.log(' ----> ', orderedByDestruction);
// const twoHundreth = orderedByDestruction[200];
// console.log('Asnwer: ', (twoHundreth.origX + bestAsteroid.x) * 100 + (twoHundreth.origY + bestAsteroid.y));



 

