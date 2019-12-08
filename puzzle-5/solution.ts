import assert = require("assert");
import input = require("./input.json");
import _ from 'lodash';

interface IO {
    input?: number;
    output?: number;
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
    if (io.input === undefined) {
        throw new Error('Cannot saveInput - io.input is undefined')
    }

    const [saveAddr] = opArgs;
    state[saveAddr] = io.input;
}

function opOutput(state: number[], opArgs: number[], modes: ParamModes[], io: IO) {
    const [outAddr] = opArgs;
    io.output = getValFromMode(state, outAddr, modes[0]);
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

type OpExecution = (state: number[], opArgs: number[], modes: ParamModes[], io: IO) => number | void;

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

function runProgram(state: number[], io: IO, position = 0): number[] {
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
    const newPosition = op.execute(state, opArgs, modes, io);
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

const inputEqualsEight = "3,9,8,9,10,9,4,9,99,-1,8";
const isLessThanEight = "3,9,7,9,10,9,4,9,99,-1,8";
const isEqualToEight = "3,3,1108,-1,8,3,4,3,99";
const isLessThanEightImmediate = "3,3,1107,-1,8,3,4,3,99";

const mainProgram = parseProgram(input);
const testProg = parseProgram(isLessThanEightImmediate);

const io: IO = {input: 5};
runProgram(mainProgram, io);

console.log("IO: ", io);

// function getNewState(noun: number, verb: number) {
//     const copy = [...program];
//     copy[1] = noun;
//     copy[2] = verb;
//     return copy;
// }

// const desiredResult = 19690720;

// let noun: number;
// let verb: number;
// let finalResult;

// function nextGuess() {
//     if (noun === undefined || verb === undefined) {
//         noun = 0;
//         verb = 0;
//     } else if (noun === 99 && verb === 99) {
//         throw new Error("Maxed out noun and verb!");
//     }  else if (verb === 99) {
//         noun++
//         verb = 0;
//     } else {
//         verb++;
//     }
// }

// do {
//     nextGuess();
//     //console.log(`Guessing: ${[noun, verb]}`);
//     finalResult = runProgram(getNewState(noun, verb));    
// } while (finalResult[0] !== desiredResult);


// console.log('Searching...');
// console.log(`Found Input: ${[noun, verb]}`);
// console.log(`Answer: ${100 * noun + verb}`);