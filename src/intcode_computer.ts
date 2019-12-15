import _ from 'lodash'; 

enum ParamModes {
    Position,
    Immediate,
    Relative,
}

enum ExecutionResultType {
    Output,
    MovePosition,
    MoveRelativeBase,
}

type ExecutionResult = {
    type: ExecutionResultType;
    payload: number;
}

function makeResult(type: ExecutionResultType, payload: number): ExecutionResult {
    return { type, payload };
};


function getValFromMode(state: number[], rawVal: number, mode: ParamModes = ParamModes.Position, relativeBase: number) {
    switch(mode) {
        case ParamModes.Position:
            return state[rawVal];
        case ParamModes.Immediate:
            return rawVal;
        case ParamModes.Relative:
            return state[relativeBase + rawVal];
        default:
            throw new Error(`Unrecognized mode: ${mode}`);
    }
}

function getAddrFromMode(rawAddr: number, mode: ParamModes = ParamModes.Position, relativeBase: number) {
    switch(mode) {
        case ParamModes.Position:
            return rawAddr;
        case ParamModes.Immediate:
            throw new Error('Cannot use Addr parameter in immediate mode');
        case ParamModes.Relative:
            return relativeBase + rawAddr;
        default:
            throw new Error(`Unrecognized mode: ${mode}`);
    }
}

type OpExecution = (
    state: number[], 
    opArgs: number[], 
    modes: ParamModes[], 
    input: number[], 
    relativeBase: number) => ExecutionResult | void;

function opAdd(state: number[], opArgs: number[], modes: ParamModes[], __: any, relativeBase: number) {    
    const [left, right, out] = opArgs; 
    const leftVal = getValFromMode(state, left, modes[0], relativeBase);
    const rightVal = getValFromMode(state, right, modes[1], relativeBase);
    const outAddr = getAddrFromMode(out, modes[2], relativeBase);

    state[outAddr] = leftVal + rightVal;    
}

function opMultiply(state: number[], opArgs: number[], modes: ParamModes[], __: any, relativeBase: number) {
    const [left, right, out] = opArgs;
    const leftVal = getValFromMode(state, left, modes[0], relativeBase);
    const rightVal = getValFromMode(state, right, modes[1], relativeBase);
    const outAddr = getAddrFromMode(out, modes[2], relativeBase);

    state[outAddr] = leftVal * rightVal;
}

function opSaveInput(state: number[], opArgs: number[], modes: ParamModes[], input: number[], relativeBase: number) {
    const nextValue = input.shift();
    if (typeof nextValue !== 'number') {
        throw new Error("Failed to get next input");
    }

    const [saveAddr] = opArgs;
    state[getAddrFromMode(saveAddr, modes[0], relativeBase)] =  nextValue;
}

function opOutput(state: number[], opArgs: number[], modes: ParamModes[], ___: any, relativeBase: number) {
    const [outAddr] = opArgs;
    const outVal = getValFromMode(state, outAddr, modes[0], relativeBase);
    return makeResult(ExecutionResultType.Output,  outVal);
}

function opJumpIfTrue(state: number[], opArgs: number[], modes: ParamModes[], __: any, relativeBase: number) {
    const [test, out] = opArgs;
    const testVal = getValFromMode(state, test, modes[0], relativeBase);
    const outVal = getValFromMode(state, out, modes[1], relativeBase);

    return testVal === 0 ? undefined : makeResult(ExecutionResultType.MovePosition, outVal);
}

function opJumpIfFalse(state: number[], opArgs: number[], modes: ParamModes[], __: any, relativeBase: number) {
    const [test, out] = opArgs;
    const testVal = getValFromMode(state, test, modes[0], relativeBase);
    const outVal = getValFromMode(state, out, modes[1], relativeBase);

    return testVal !== 0 ? undefined : makeResult(ExecutionResultType.MovePosition, outVal);
}

function opLessThan(state: number[], opArgs: number[], modes: ParamModes[], __: any, relativeBase: number) {
    const [left, right, dest] = opArgs;
    const leftVal = getValFromMode(state, left, modes[0], relativeBase);
    const rightVal = getValFromMode(state, right, modes[1], relativeBase);
    const destAddr = getAddrFromMode(dest, modes[2], relativeBase);
   
    if (leftVal < rightVal) {
        state[destAddr] = 1;
    } else {
        state[destAddr] = 0;
    }
}

function opEquals(state: number[], opArgs: number[], modes: ParamModes[], __: any, relativeBase: number) {
    const [left, right, dest] = opArgs;
    const leftVal = getValFromMode(state, left, modes[0], relativeBase);
    const rightVal = getValFromMode(state, right, modes[1], relativeBase);
    const destAddr = getAddrFromMode(dest, modes[2], relativeBase);
   
    if (leftVal === rightVal) {
        state[destAddr] = 1;
    } else {
        state[destAddr] = 0;
    }
}

function opMoveRelativeBase(state: number[], opArgs: number[], modes: ParamModes[], __: any, relativeBase: number) {
    const [baseAdjustment] = opArgs;
    const adjustmentValue = getValFromMode(state, baseAdjustment,  modes[0], relativeBase);
    return makeResult(ExecutionResultType.MoveRelativeBase, adjustmentValue + relativeBase);
}

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
    9: {
        argCount: 1,
        execute: opMoveRelativeBase,
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

function parseProgram(input: string){
    return input.split(",").map(val => {
        const out =  parseInt(val, 10);
        if (out === NaN) {
            throw new Error(`Failed to parse instruction: ${val}`);
        }
        return out;
    });    
}

function makeMemoryAccessor(state: number[]) {
    return new Proxy(state, {
        get(target: number[], key: number) {
            if (typeof key === 'number' && key < 0) {
                throw new Error(`Attempting to read negative addr=${key}`);
            }

            if (target[key] === undefined) {
                target[key] = 0;
            }

            return target[key];
        },
        set(target: number[], key: number, value: number) {
            if (key < 0) {
                throw new Error(`Attempting to write negative addr=${key}`);
            }

            target[key] = value;
            return true;
        }
    })
}

export class IntcodeComputer {
    private _memory: number[];
    private _position = 0;
    private _relativeBase = 0;

    constructor(public name: string, programInput: string) {
        // console.log(`Initializing memory: ${programInput}`);
        this._memory = makeMemoryAccessor(parseProgram(programInput));
    }

    public runProgramToOutput(input: number[]): number | null {
        let output = null;
        do {
            const operation = this._memory[this._position];
            const { opCode, modes } = parseOperation(operation);
            const op = ops[opCode]
            
            if (op === undefined) {
                throw new Error(`Unrecognized op ${opCode} at position ${this._position} - operation= ${operation}`);
            }
            
            if (!op.execute) {
                return null;
            }
            
            const opArgs = this._memory.slice(this._position + 1, this._position + op.argCount + 1);        
            
            // console.log(' Running operation: ', {name: op.execute.name, opArgs, relativeBase: this._relativeBase});
            const result = op.execute(this._memory, opArgs, modes, input, this._relativeBase);
            
            this._position = this._position + op.argCount + 1; 
            if (result && result.type === ExecutionResultType.Output) {           
                output = result.payload;
            } else if (result && result.type === ExecutionResultType.MovePosition) {
                this._position = result.payload;
            } else if (result && result.type === ExecutionResultType.MoveRelativeBase) {
                this._relativeBase = result.payload;
            } else if (result) {
                throw new Error('Unrecognized Execution result');
            }            
        } while (output === null)

        return output;
    }
}
