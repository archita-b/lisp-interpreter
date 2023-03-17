const arithmatic = input => {
    input = input.slice(1);
    const operator = opParser(input);
    input = input.slice(operator.length);
    const args = argParser(input);
    let result;
    switch (operator) {
        case '+':
            result = args.reduce((a,b) => Number(a) + Number(b), 0);
            break;
        case '-':
            result = args.reduce((a,b) => {
                // console.log(args.length)          
                if (args.length === 1) return -args[0];
                return Number(a) - Number(b)});
            break;
        case '*':
            result = args.reduce((a,b) => Number(a) * Number(b), 1);
            break;
        case '/':
            if (args.length === 2) return args[0] / args[1];
            return `Expected 2 arguments, got ${args.length}`;
            break;
        case '>':
            if (args.length === 2) return args[0] > args[1];
            return `Expected 2 arguments, got ${args.length}`;
            break;
        case '<':
            if (args.length === 2) return args[0] < args[1];
            return `Expected 2 arguments, got ${args.length}`;
            break;
        case '>=':
            if (args.length === 2) return args[0] >= args[1];
            return `Expected 2 arguments, got ${args.length}`;
            break;
        case '<=':
            if (args.length === 2) return args[0] <= args[1];
            return `Expected 2 arguments, got ${args.length}`;
            break;
        case '=':
            if (args.length === 2) return args[0] === args[1];
            return `Expected 2 arguments, got ${args.length}`;
            break;
    }
    return result;
}

const opParser = input => {
    let op = '';
    while (input[0] !== ' ') {
        op += input[0];
        input = input.slice(1);
    }
    return op;
}
// console.log(opParser(">= "));

const argParser = input => {
    const args = [];
    while (input[0] !== ')') {
        // console.log(input[0])
        args.push(input[0]);
        input = input.slice(1);
    }
    return args.filter(e => e !== ' ');
}
// console.log(argParser("1 2 3 4)"));

console.log(arithmatic("(- 5)"));