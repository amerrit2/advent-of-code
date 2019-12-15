import { IntcodeComputer } from "../intcode_computer";
import gameProgram from './input';
import _ from 'lodash';

enum TileId {
    empty = 0,
    wall = 1,
    block = 2,
    paddle = 3,
    ball = 4,
}

const SPRITE_SIZE = 10;
function drawWall(canvas: CanvasRenderingContext2D, x: number, y: number) {
    canvas.fillRect(x * SPRITE_SIZE, y * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE);
}

function drawEmpty(canvas: CanvasRenderingContext2D, x: number, y: number) {
    canvas.clearRect(x * SPRITE_SIZE, y * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE);
}

function drawBlock(canvas: CanvasRenderingContext2D, x: number, y: number) {
    canvas.fillRect(x * SPRITE_SIZE, y * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE);
}

function drawPaddle(canvas: CanvasRenderingContext2D, x: number, y: number) {
    canvas.fillRect(x * SPRITE_SIZE, y * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE / 4);
}

function drawBall(canvas: CanvasRenderingContext2D, x: number, y: number) {
    const r = SPRITE_SIZE / 2;
    canvas.beginPath();
    canvas.arc( x * SPRITE_SIZE + r, y * SPRITE_SIZE + r, r*0.8, 0, Math.PI * 2);
    canvas.stroke();
}

const drawMap = {
    [TileId.empty]: drawEmpty,
    [TileId.wall]: drawWall,
    [TileId.block]: drawBlock,
    [TileId.paddle]: drawPaddle,
    [TileId.ball]: drawBall,
}

// Part Two
function draw(canvas: CanvasRenderingContext2D, x: number, y: number, tileId: TileId) {
    drawMap[tileId](canvas, x, y);
}

enum Joystick {
    neutral = 0,
    left = -1,
    right = 1,
}

function runComputer(canvas: CanvasRenderingContext2D, computer: IntcodeComputer, joystick: Joystick) {
    const x = computer.runProgramToOutput([joystick]);
    const y = computer.runProgramToOutput([joystick]);
    const tileId = computer.runProgramToOutput([joystick]);
    
    if (_.isNumber(x) && _.isNumber(y) && _.isNumber(tileId)) {
        if (x === -1 && y === 0) {
            return {score: tileId}
        }

        draw(canvas, x, y, tileId);
        return {
            tileId,
            x,
            y,
        };
    } else {
        console.log("Exiting");
        return;
    }    
}

function setTimeoutP(ms: number) {
    return new Promise(a => setTimeout(a, ms));
}

const htmlCanvas = document.getElementById('canvas') as HTMLCanvasElement;
const canvas = htmlCanvas.getContext('2d');

async function main() {
    if (!canvas) { throw new Error('No canvas!');}

    let computer = new IntcodeComputer('Playable Game', gameProgram);
    let timeout: number | null;
    let score = 0;
    let ballX = 0;
    let paddleX = 0;

    const run = async () => {
        const input = ballX < paddleX ? Joystick.left : ballX > paddleX ? Joystick.right : Joystick.neutral;
        const result = runComputer(canvas, computer, input);
        if (!result) {
            return 'exit';
        } else if (_.isNumber(result.score)) {
            timeout = 1; 
            score = result.score;
        } else if (result.tileId === TileId.ball) {
            ballX = result.x;
        } else if (result.tileId === TileId.paddle) {
            paddleX = result.x;
        }

        if (timeout) {
            await setTimeoutP(timeout);
        }
    }

    while (true) {
        const result = await run();
        if (result === 'exit') {
            canvas.measureText('30px');
            canvas.fillText(`${score}`, 20, 20);
            break;
        }
    }
}
main();
