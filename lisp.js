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

const booleanParser = input => {
	if (input.startsWith('true')) {
		return [true, input.slice(4)];
	}
	if (input.startsWith('false')) {
		return [false, input.slice(5)];
	}
	return null;
}

const numParser = input => {
	console.log('num ip', input)
	const result = input.match(/^-?([1-9]\d*|0)(\.\d+)?([Ee][+-]?\d+)?/);
	console.log('result', result)
	if (result) {
		return [Number(result[0]), input.slice(result[0].length)];
	}
	return null;
}



const stringParser = input => {
	if (!input.startsWith('"')) return null;
	input = input.slice(1);
	let result = '';
	while (input[0] !== '"') {
		if (input[0].match(/[\u0000-\u001f]/i)) return null;
		if (input[0] === "\\") {
			let sChar = specialCharParser(input);
			if (sChar !== null) {
				result += sChar[0];
				input = sChar[1];
			} else return null;
		} else {
			result += input[0];
			input = input.slice(1);
		}
	}
	return [result, input.slice(1)];
}



const specialCharParser = input => {
	let escChar = input[1];
	let sChar = '';
	switch (escChar) {
		case "\\":
			sChar = '\\';
			break;
		case "/":
			sChar = '/';
			break;
		case "b":
			sChar = '\b';
			break;
		case "f":
			sChar = '\f';
			break;
		case "n":
			sChar = '\n';
			break;
		case "t":
			sChar = '\t';
			break;
		case "r":
			sChar = '\r';
			break;
		case '"':
			sChar = '"';
			break;
		case "u":
			let hex = input.slice(2, 6);
			if (!hex.match(/[0-9A-Fa-f]{4}/)) {
				break;
			}
			if (parseInt(hex, 16) >= 0 && parseInt(hex, 16) <= 31) {
				break;
			}
			sChar = String.fromCharCode(parseInt(hex, 16));
			break;
	}
	if (sChar.length === 0) return null;
	if (escChar === "u") {
		return [sChar, input.slice(6)];
	} else {
		return [sChar, input.slice(2)];
	}
}

const sExprParser = input => {
	input = input.trim();
	let str = input.slice(1);
	let bracketCount = 1;
	while (bracketCount !== 0) {
		if (str[0] === '(') bracketCount++;
		if (str[0] === ')') bracketCount--;
		str = str.slice(1);
	}
	if (bracketCount === 0)
		return [input.slice(0, input.length - str.length), str];
}
// console.log(sExprParser('(+ 1 (/ 4 2) 3)'));

const fnParser = input => {
	let fn = '';
	while (!input[0].match(/\s/)) {
		fn += input[0];
		input = input.slice(1);
	}
	return [fn, input.slice(1)];
}

const exprParser = input => {
	input = input.trim();
	let result = booleanParser(input) || numParser(input) || stringParser(input)
		|| sExprParser(input);
	if (result === null) return null;

	return result;
}

const argsParser = input => {
	const args = [];
	input = input.trim();
	while (input[0] !== ')') {
		const parsedValue = exprParser(input);
		console.log('parsedValue',parsedValue);
		if (parsedValue === null) return null;
		args.push(parsedValue[0]);
		input = parsedValue[1];
	}
	if (input[0] === ')') return args;
	// input = input.slice(1);
}
// console.log(argsParser('1 2 3)'))

const exprEval = input => {
	input = input.slice(1);
	const fn = fnParser(input)[0];
	input = fnParser(input)[1];
	const args = argsParser(input);

	console.log(args)
}

const input = '(+ 1 (+ (/ 4 2) 5) 3)';
console.log('input =', input);
console.log(exprEval(input));



