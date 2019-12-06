const initialState = require('./input.json');

function opAdd(state, inputAddrs) {    
    const [leftAddr, rightAddr, outAddr] = inputAddrs;
    state[outAddr] = state[leftAddr] + state[rightAddr];
}

function opMultiply(state, inputAddrs) {
    const [leftAddr, rightAddr, outAddr] = inputAddrs;
    state[outAddr] = state[leftAddr] * state[rightAddr];
}

const END = 'END';
const ops = {
    1: {
        argCount: 3,
        execute: opAdd,
    },
    2: {
        argCount: 3,
        execute: opMultiply,
    },
    99: END,
};

function runProgram(state, position = 0) {
    const opCode = state[position];
    const op = ops[opCode];

    if (op === undefined) {
        throw new Error(`Unrecognized op ${opCode} at position ${position} of ${state}`);
    }

    if (op === END) {
        return state;
    }

    const opArgs = state.slice(position + 1, position + op.argCount + 1);

//    console.log(`Calling op ${opCode} with args: ${opArgs}`);

    op.execute(state, opArgs);
    return runProgram(state, position + op.argCount + 1);
}

function getNewState(noun, verb) {
    const copy = [...initialState];
    copy[1] = noun;
    copy[2] = verb;
    return copy;
}

const desiredResult = 19690720;

let noun;
let verb;
let finalResult;

function nextGuess() {
    if (noun === undefined || verb === undefined) {
        noun = 0;
        verb = 0;
    } else if (noun === 99 && verb === 99) {
        throw new Error("Maxed out noun and verb!");
    }  else if (verb === 99) {
        noun++
        verb = 0;
    } else {
        verb++;
    }
}

do {
    nextGuess();
    //console.log(`Guessing: ${[noun, verb]}`);
    finalResult = runProgram(getNewState(noun, verb));    
} while (finalResult[0] !== desiredResult);


console.log('Searching...');
console.log(`Found Input: ${[noun, verb]}`);
console.log(`Answer: ${100 * noun + verb}`);