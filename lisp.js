const arithmatic = (input) => {
    input = input.slice(1).trim();
    const operator = input[0];
    input = input.slice(1).trim();
    const num1 = input[0];
    input = input.slice(1).trim();
    const num2 = input[0];
    if (operator === '+') {
        return Number(num1) + Number(num2);
    }
    if (operator === '-') {
        return Number(num1) - Number(num2);
    }
    if (operator === '*') {
        return Number(num1) * Number(num2);
    }
    if (operator === '/') {
        return Number(num1) / Number(num2);
    }
}
console.log(arithmatic("(/ 1 2)"));