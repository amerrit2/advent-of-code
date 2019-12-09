import assert = require("assert");
import _ from 'lodash';
import { getPackedSettings } from "http2";

interface IO {
    getInput: () => number;
    sendOutput: (out: number) => Promise<void>;
}

enum ParamModes {
    Position,
    Immediate,
}

function getValFromMode(state: number[], rawVal: number, mode: ParamModes = ParamModes.Position) {
    return mode === ParamModes.Position ? state[rawVal] : rawVal;
}

function opAdd(state: number[], opArgs: number[], modes: ParamModes[]) {    
    const [left, right, outAddr] = opArgs; 
    const leftVal = getValFromMode(state, left, modes[0]);
    const rightVal = getValFromMode(state, right, modes[1]);

    state[outAddr] = leftVal + rightVal;
}

function opMultiply(state: number[], opArgs: number[], modes: ParamModes[]) {
    const [left, right, outAddr] = opArgs;
    const leftVal = getValFromMode(state, left, modes[0]);
    const rightVal = getValFromMode(state, right, modes[1]);

    state[outAddr] = leftVal * rightVal;
}

function opSaveInput(state: number[], opArgs: number[], modes: ParamModes[], io: IO) {
    const [saveAddr] = opArgs;
    state[saveAddr] = io.getInput();
}

async function opOutput(state: number[], opArgs: number[], modes: ParamModes[], io: IO) {
    const [outAddr] = opArgs;
    await io.sendOutput(getValFromMode(state, outAddr, modes[0]));
}

function opJumpIfTrue(state: number[], opArgs: number[], modes: ParamModes[]) {
    const [test, dest] = opArgs;
    const testVal = getValFromMode(state, test, modes[0]);
    const destVal = getValFromMode(state, dest, modes[1]);

    return testVal === 0 ? undefined : destVal;
}

function opJumpIfFalse(state: number[], opArgs: number[], modes: ParamModes[]) {
    const [test, dest] = opArgs;
    const testVal = getValFromMode(state, test, modes[0]);
    const destVal = getValFromMode(state, dest, modes[1]);

    return testVal !== 0 ? undefined : destVal;
}

function opLessThan(state: number[], opArgs: number[], modes: ParamModes[]) {
    const [left, right, dest] = opArgs;
    const leftVal = getValFromMode(state, left, modes[0]);
    const rightVal = getValFromMode(state, right, modes[1]);
   
    if (leftVal < rightVal) {
        state[dest] = 1;
    } else {
        state[dest] = 0;
    }
}

function opEquals(state: number[], opArgs: number[], modes: ParamModes[]) {
    const [left, right, dest] = opArgs;
    const leftVal = getValFromMode(state, left, modes[0]);
    const rightVal = getValFromMode(state, right, modes[1]);
   
    if (leftVal === rightVal) {
        state[dest] = 1;
    } else {
        state[dest] = 0;
    }
}

type OpExecution = (state: number[], opArgs: number[], modes: ParamModes[], io: IO) => number | void | Promise<void>;

const ops: {[index: number]: {argCount: number; execute?: OpExecution}} = {
    1: {
        argCount: 3,
        execute: opAdd,
    },
    2: {
        argCount: 3,
        execute: opMultiply,
    },
    3: {
        argCount: 1,
        execute: opSaveInput,
    },
    4: {
        argCount: 1,
        execute: opOutput,
    },
    5: {
        argCount: 2,
        execute: opJumpIfTrue,
    },
    6: {
        argCount: 2,
        execute: opJumpIfFalse,
    },
    7: {
        argCount: 3,
        execute: opLessThan,
    },
    8: {
        argCount: 3,
        execute: opEquals,
    },
    99: {argCount: 0},
};

function parseOperation(operation: number) {
    const charArr: string[] = `${operation}`.split('');
    const opCode = parseInt(_.takeRight(charArr, 2).join(''));
    const modes = _.take(charArr, charArr.length - 2)
        .map(rawMode => parseInt(rawMode))
        .reverse();

    return {opCode, modes};
}

async function runProgram(state: number[], io: IO, position = 0): Promise<number[]> {
    const operation = state[position];
    const { opCode, modes } = parseOperation(operation);
    const op = ops[opCode]

    if (op === undefined) {
        throw new Error(`Unrecognized op ${opCode} at position ${position} of ${state}`);
    }

    if (!op.execute) {
        return state;
    }

    const opArgs = state.slice(position + 1, position + op.argCount + 1);
    const newPosition = await op.execute(state, opArgs, modes, io);
    if (newPosition) {
        return runProgram(state, io, newPosition);
    }

    return runProgram(state, io, position + op.argCount + 1);
}

function parseProgram(input: string){
    return input.split(",").map(val => {
        const out =  parseInt(val, 10);
        if (out === NaN) {
            throw new Error(`Failed to parse instruction: ${val}`);
        }
        return out;
    });    
}



export class IntcodeComputer {
    private _program: number[];
    constructor(programInput: string) {
        this._program = parseProgram(programInput);
    }

    public runProgram(io: IO) {
        return runProgram(this._program, io);
    }
}
