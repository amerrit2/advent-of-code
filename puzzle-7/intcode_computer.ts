import _ from 'lodash'; 

enum ParamModes {
    Position,
    Immediate,
}

enum ExecutionResultType {
    Output,
    MovePosition,
}

type ExecutionResult = {
    type: ExecutionResultType;
    payload: number;
}

function makeResult(type: ExecutionResultType, payload: number): ExecutionResult {
    return { type, payload };
};


function getValFromMode(state: number[], rawVal: number, mode: ParamModes = ParamModes.Position) {
    return mode === ParamModes.Position ? state[rawVal] : rawVal;
}

type OpExecution = (state: number[], opArgs: number[], modes: ParamModes[], input: number[]) => ExecutionResult | void;

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

function opSaveInput(state: number[], opArgs: number[], modes: ParamModes[], input: number[]) {
    const nextValue = input.shift();
    if (typeof nextValue !== 'number') {
        throw new Error("Failed to get next input");
    }

    const [saveAddr] = opArgs;
    state[saveAddr] = nextValue;
}

function opOutput(state: number[], opArgs: number[]) {
    const [outAddr] = opArgs;
    return makeResult(ExecutionResultType.Output, state[outAddr]);
}

function opJumpIfTrue(state: number[], opArgs: number[], modes: ParamModes[]) {
    const [test, dest] = opArgs;
    const testVal = getValFromMode(state, test, modes[0]);
    const destVal = getValFromMode(state, dest, modes[1]);

    return testVal === 0 ? undefined : makeResult(ExecutionResultType.MovePosition, destVal);
}

function opJumpIfFalse(state: number[], opArgs: number[], modes: ParamModes[]) {
    const [test, dest] = opArgs;
    const testVal = getValFromMode(state, test, modes[0]);
    const destVal = getValFromMode(state, dest, modes[1]);

    return testVal !== 0 ? undefined : makeResult(ExecutionResultType.MovePosition, destVal);
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
    private _position = 0;

    constructor(public name: string, programInput: string) {
        this._program = parseProgram(programInput);
    }

    public runProgramToOutput(input: number[]): number | null {
        const operation = this._program[this._position];
        const { opCode, modes } = parseOperation(operation);
        const op = ops[opCode]
        
        if (op === undefined) {
            throw new Error(`Unrecognized op ${opCode} at position ${this._position} of ${this._program}`);
        }
        
        if (!op.execute) {
            return null;
        }
        
        const opArgs = this._program.slice(this._position + 1, this._position + op.argCount + 1);        
        
        // console.log('   Running operation: ', op.execute.name, ' with input: ', input);
        const result = op.execute(this._program, opArgs, modes, input);
        
        this._position = this._position + op.argCount + 1; 
        if (result && result.type === ExecutionResultType.Output) {           
            return result.payload;
        } else if (result && result.type === ExecutionResultType.MovePosition) {
            this._position = result.payload;
        } else if (result) {
            throw new Error('Unrecognized Execution result');
        }
        
        // Normal continuation
        return this.runProgramToOutput(input);
    }
}
