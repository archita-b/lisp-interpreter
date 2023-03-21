const globalEnv = {
	'+': args => args.reduce((a, b) => Number(a) + Number(b), 0),
	'-': args => args.length === 1 ? -args[0] : args.reduce((a, b) => Number(a) - Number(b)),
	'*': args => args.reduce((a, b) => Number(a) * Number(b), 1),
	'/': args => args.length === 2 ? args[0] / args[1] : null,
	'>': args => args.length === 2 ? args[0] > args[1] : null,
	'<': args => args.length === 2 ? args[0] < args[1] : null,
	'>=': args => args.length === 2 ? args[0] >= args[1] : null,
	'<=': args => args.length === 2 ? args[0] <= args[1] : null,
	'=': args => args.length === 2 ? args[0] = args[1] : null,
	'sqrt': args => Math.sqrt(args[0])
}

const arithmatic = input => {
	// console.log(input);
	input = input.slice(1);
	let result, args;
	console.log(input[0]);
	while (input[0] !== '(') {
		let operator = opParser(input);
		// console.log(operator);
		input = input.slice(operator.length).trim();
		// console.log(input);
		if (input[0] !== '(') {
		// console.log(input[0]);
			args = argParser(input);
			if (Object.keys(globalEnv).includes(operator)) {
				result = globalEnv[operator](args);
			}
		} else {
			// input = input.slice(1);
			continue;
		}
		// console.log(input);
		
	}
	return result !== null ? result : `Expected 2 arguments, got ${args.length}`;
}

const opParser = input => {
	let op = '';
	while (input[0] !== ' ') {
		op += input[0];
		input = input.slice(1);
	}
	return op;
}

const argParser = input => {
	const args = [];
	while (input[0] !== ')') {
		args.push(input[0]);
		input = input.slice(1);
	}
	return args.filter(e => e !== ' ');
}

console.log(arithmatic("(/ (+ 4 2) 2)"));
