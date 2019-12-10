import _ from 'lodash';
import { IntcodeComputer } from './intcode_computer';
import input from './input.json';
import { assertThat } from '../util';

function getAllPermutations(parentArr: number[]): number[][] {
    const result: number[][] = [];
  
    const permute = (arr: number[], m: number[] = []) => {
      if (arr.length === 0) {
        result.push(m)
      } else {
        for (let i = 0; i < arr.length; i++) {
          const copy = arr.slice();
          const next = copy.splice(i, 1);
          permute(copy.slice(), m.concat(next))
       }
     }
   }
  
   permute(parentArr);
   return result;
}

function isNumber(val: number | null | undefined): val is number {return typeof val === 'number'}

const AmpNames = ['A', 'B', 'C', 'D', 'E'];

function runAmplifierChain(program: string, phases: number[]) {
    const computers: IntcodeComputer[] = [];
    for (const ampName of AmpNames) {
        computers.push(new IntcodeComputer(ampName, program));
    }

    const finalAmp = _.last(computers);
    let finalAmpLastOutput: number | null = null;
    let lastOutput: number | null = 0;
    let idx = 0;

    while (true) {
        const computer = computers[idx % computers.length];
        const input = [phases.shift(), lastOutput].filter(isNumber);
        console.log(`Running computer ${computer.name} w/ input ${input}`);

        lastOutput = computer.runProgramToOutput(input);

        console.log(`${computer.name} -> ${lastOutput}`);

        if (!isNumber(lastOutput) && computer === finalAmp) {
            break;
        } else if (isNumber(lastOutput) && computer === finalAmp) {
            finalAmpLastOutput = lastOutput;
        }

        idx++;
    }

    return finalAmpLastOutput;
}

console.log('Output: ', runAmplifierChain("3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0", [4,3,2,1,0]));

console.log('Output: ', runAmplifierChain(
    "3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0", 
    [0,1,2,3,4]
));

console.log('Output: ', runAmplifierChain(
    "3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0",
    [1,0,4,3,2]
));

console.log(" --> ", runAmplifierChain(
    "3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5",
    [9,8,7,6,5],
));

function findMaxSignal(possiblePhases: number[]) {
    const allPerms = getAllPermutations(possiblePhases);
    let maxOutput = 0;
    for (const perm of allPerms) {
        const output = runAmplifierChain(input, perm);
        if (typeof output === 'number' && output > maxOutput) {
            maxOutput = output;
        }
    }

    return maxOutput;
}

console.log("Max output: ", findMaxSignal([5, 6, 7, 8, 9]));
