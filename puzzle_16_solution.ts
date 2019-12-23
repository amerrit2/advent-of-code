
const testInput = "80871224585914546619083218645595";

function calcFreq(signalLength: number, freq: number, getValue: (i: number) => number): string {
    let out = 0;
    for (let i = freq; i < signalLength; ++i) {
        if (i % (4 * (freq + 1)) === (freq + 1)) {
            for (let j = 0; j < freq + 1 && j < signalLength; ++j) {
                out += getValue(i +j);              
            }

            i += freq;
        } else if (i % (4 * (freq + 1)) === ((freq + 1) * 3)) {
            for (let j = 0; j < freq + 1 && j < signalLength; ++j) {
                out -= getValue(i + j);            
            }

            i += freq;
        }
    }

    return `${Math.abs(out) % 10}`;
}

function makeGetValue(signal: string, repeats: number) {
    return (i: number) => {
        if (i > signal.length * repeats) {
            throw new Error('Getting value out of bounds');
        }

        return parseInt(signal[i % (signal.length + 1)]);
    }
}

function fft(signal: string, repeats: number): string {
    const signalLength = signal.length * repeats;

    let out: string[] = [];    
    for (let freq = 0; freq < signalLength; ++freq) {
        out.push(calcFreq(signalLength, freq, makeGetValue(signal, repeats)));
    }

    return out.join('');
}

function processSignal(signal: string, repeats: number, phases: number) {
    let output = signal;
    for (let i = 0; i < phases; ++i) {
        output = fft(signal, repeats);
    }

    return output;
}

console.log('Here goes nothing: ', processSignal(testInput, 1, 100));
