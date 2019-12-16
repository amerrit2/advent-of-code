import _ from 'lodash'
import gameProgram from './input';
import { IntcodeComputer } from '../intcode_computer';

type Point = [number, number]
enum TileId {
    empty = 0,
    wall = 1,
    block = 2,
    paddle = 3,
    ball = 4,
}

const PaintMap = {
    [TileId.empty]: " ",
    [TileId.wall]: "⬛",
    [TileId.block]: "8",
    [TileId.paddle]: "_",
    [TileId.ball]: "o",
};

interface PaintInstruction {
    point: Point;
    tileId: TileId;
}

const computer = new IntcodeComputer('Arcade Game', gameProgram);
const canvasState: PaintInstruction[] = []; 
do {
    const x = computer.runProgramToOutput([]);
    const y = computer.runProgramToOutput([]);
    const tileId = computer.runProgramToOutput([]);

    if (_.isNumber(x) && _.isNumber(y) && _.isNumber(tileId)) {
        const overwrite = canvasState.find(instr => _.isEqual(instr.point, [x, y]));
        if (overwrite) {
            overwrite.tileId = tileId;
        } else {
            canvasState.push({
                point: [x, y],
                tileId,
            });
        }

        // draw(canvasState);
    } else {
        break;
    }
} while (true)

console.log(canvasState.reduce((sum, paint) => {
    if (paint.tileId === TileId.block) {
        sum++;
    }
    return sum;
}, 0));

