const fs = require('fs');

const input = require('./input.json');
console.log('input: ', input);

function calcFuel(mass) {    
    const fuel = Math.floor(mass / 3) - 2;
    console.log("next fuel: ", fuel);

    return fuel > 0 ? fuel + calcFuel(fuel) : 0;
}

const answer = input.reduce((totalFuel, moduleMass, idx) => {        
    const moduleFuel = calcFuel(moduleMass);
    console.log(`module [${idx}] - mass=[${moduleMass}] - totalFuel=${moduleFuel}`);
    
    totalFuel += moduleFuel;
    return totalFuel;
}, 0)

console.log("Answer: ", answer);