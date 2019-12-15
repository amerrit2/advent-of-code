

function isSixDigit(input: number) {
    return input >= 100000 && input <= 999999;
} 

function getGroupLength(s: string) {
    const matchChar = s[0];
    for (let i = 0; i < s.length; ++i) {
        if (s[i + 1] !== matchChar) {
            return i + 1;
        }
    }

    throw new Error(`Failed as s=${s}`);
}

function containsSetOfTwoRepeated(input: number) {
    const asString = `${input}`;
    const groupLengths = [];
    let i = 0;
    while (i < asString.length - 1) {
        const groupLength = getGroupLength(asString.substring(i));
        // console.log(`Length of ${asString.substring(i)} = ${groupLength}`);

        groupLengths.push(groupLength);
        i += groupLength;
    }

    return groupLengths.includes(2);
}

function digitsAlwaysEqualOrIncrease(input: number) {
    const asString = `${input}`;
    for(let i = 0; i < asString.length - 1; ++i) {
        if (parseInt(asString[i], 10) > parseInt(asString[i+1], 10)) {
            return false;
        }
    }
    return true;
}

function isValidPassword(input: number) {
    return isSixDigit(input) && containsSetOfTwoRepeated(input) && digitsAlwaysEqualOrIncrease(input);
}



const validPasswords = [];
for (let i = 382345; i < 843167; ++i) {
    if (isValidPassword(i)) {
        validPasswords.push(i);
    }
}

console.log(`Valid passwords: ${validPasswords.length}`);