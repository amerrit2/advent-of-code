// import input from './input';
import _ from 'lodash';
const input = `10 ORE => 10 A
1 ORE => 1 B
7 A, 1 B => 1 C
7 A, 1 C => 1 D
7 A, 1 D => 1 E
7 A, 1 E => 1 FUEL`

interface Chemical {
    name: string;
    amount: number;
    producer?: Reaction;
}

interface Reaction {
    inputs: Chemical[];
    output: Chemical;
}

function processTokens(tokenIt: IterableIterator<string>, reactions: Reaction[], mode: 'inputs' | 'output', reaction?: Reaction): Reaction[] {
    const next = tokenIt.next();
    if (next.done) {
        return reactions;
    }

    const value = next.value;

    if (value === '=>') {
        return processTokens(tokenIt, reactions, 'output', reaction);
    } else if (mode === 'inputs') {
        const chem: Chemical = {amount: parseInt(value), name: tokenIt.next().value};
        let thisReaction: Reaction | undefined = reaction;
        if (!thisReaction) {
            thisReaction = {inputs: []} as unknown as Reaction;
            reactions.push(thisReaction)
        }

        thisReaction.inputs.push(chem);
        return processTokens(tokenIt, reactions, mode, thisReaction);
    } else {
        const chem: Chemical = {amount: parseInt(value), name: tokenIt.next().value};
        (reaction as Reaction).output = chem;
        return processTokens(tokenIt, reactions, 'inputs');
    }
}

const TokenMatcher = /([^\s,]*)/mig;
function parseInput(input: string) {
    const tokens = input.match(TokenMatcher)?.filter(val => val !== '');
    if (!tokens) { throw new Error('No tokens')}
    const it = tokens[Symbol.iterator]();

    console.log(tokens);

    return processTokens(it, [], 'inputs');
}

// console.log(JSON.stringify(parseInput(input), null, 2));

const reactions = parseInput(input);

const fuelReaction = _.find(reactions, {output: {name: 'FUEL'}});
if (!fuelReaction) {throw new Error('Fuel reaction not found!');}

function processReaction(reaction: Reaction) {
    for (const input of reaction.inputs) {
        if (!input.producer) {
            input.producer === _.find(reactions, {output: {name: input.name}});
            if (!input.producer) { throw new Error(`Could not find reaction for ${input.name}`)}
        }
        
        processReaction(input.producer);
    }
}

processReaction(fuelReaction);

console.log(fuelReaction);
