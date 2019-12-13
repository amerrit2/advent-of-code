import assert = require("assert");
import _ from 'lodash';
// import input from './input';

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
}

interface PolarPoint {
    theta: number;
    r: number;
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

function makeRelativeCoords(coords: Point[], reference: Point) {
    const relCoords: Point[] = [];
    for (const point of coords) {
        if (point !== reference) {
            relCoords.push({
                x: point.x - reference.x,
                y: point.y - reference.y,
            });
        }
    }

    return relCoords;
}

function calcTheta(y: number, x: number) {
    return Math.floor(Math.atan2(y, x) * 10000);
}

const maxTheta = Math.floor((2 * Math.PI) * 10000)

function makePolarCoords(coords: Point[]) {
    const polarCoords: PolarPoint[] = [];
    for (const point of coords) {
        const r = Math.sqrt(Math.pow(point.x,2) + Math.pow(point.y, 2));

        polarCoords.push({
            theta: calcTheta(point.y, point.x),
            r,
        });

    }

    return polarCoords;
}

// const asteroidCoords = makeCoords(input);

// console.log(asteroidCoords);
// console.log(makeRelativeCoords(asteroidCoords, asteroidCoords[3]));
// console.log(calcThetas(asteroidCoords));

// let maxVisible = 0;
// let bestAsteroid: Point | null = null;;
// for (const asteroid of asteroidCoords) {
//     const relCoords = makeRelativeCoords(asteroidCoords, asteroid);
//     const polarCoords = makePolarCoords(relCoords);
//     const numVisible = _.uniq(_.map(polarCoords, point => point.theta)).length;
//     if (numVisible > maxVisible) {
//         bestAsteroid = asteroid;
//         maxVisible = numVisible;
//     }
// }

// console.log("Max visible: ", maxVisible);

// if (!bestAsteroid) {
//     throw new Error("Best Asteroid not found");
// }

// const polarCoordsFromLaser = makePolarCoords(makeRelativeCoords(asteroidCoords, bestAsteroid));

// console.log(polarCoordsFromLaser);






