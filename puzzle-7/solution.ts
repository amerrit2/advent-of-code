import _ from 'lodash';
import { IntcodeComputer } from './intcode_computer';
import assert from 'assert';
import input from './input.json';

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


const testProgram = "3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0";

function runAmps(program: string, phases: number[]) {    
    let nextInput = 0;
    for (const phase of phases) {
        const comp = new IntcodeComputer(program);
        const output = comp.runProgram([phase, nextInput]);
        if (typeof output !== 'number') {
            throw new Error("Received invalid output :(")   
        }

        nextInput = output;
    }

    return nextInput;
}

console.log('Output: ', runAmps(testProgram, [4,3,2,1,0]));
console.log('Output: ', runAmps(
    "3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0", 
    [0,1,2,3,4]
));
console.log('Output: ', runAmps(
    "3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0",
    [1,0,4,3,2]
));

function findMaxSignal(possiblePhases: number[]) {
    const allPerms = getAllPermutations(possiblePhases);
    let maxOutput = 0;
    for (const perm of allPerms) {
        const output = runAmps(input, perm);
        if (output > maxOutput) {
            maxOutput = output;
        }
    }

    return maxOutput;
}

console.log("Max output: ", findMaxSignal([0, 1, 2, 3, 4]));
