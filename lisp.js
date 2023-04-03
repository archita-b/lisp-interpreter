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
	'sqrt': args => Math.sqrt(args[0]),	
	'pow' : args => args.length === 2 ? Math.pow(args[0], args[1]) : null,
	'pi' : Math.PI
	// '#t' : true
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
	const result = input.match(/^-?([1-9]\d*|0)(\.\d+)?([Ee][+-]?\d+)?/);
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

const symbolParser = input => {
	let symbol = '';
	
	while (!input[0].match(/\s/)) {
		// console.log('in =', input[0])
		symbol += input[0];
		input = input.slice(1);
		if (input[0] === ')') return [symbol, input];	
	}
	return [symbol, input.slice(1)];
}

const sExprParser = input => {
	input = input.trim();

	if (input.startsWith('(')) {
		let str = input.slice(1);
		let bracketCount = 1;
		while (bracketCount !== 0) {
			if (str[0] === '(') bracketCount++;
			if (str[0] === ')') bracketCount--;
			str = str.slice(1);
		}
		if (bracketCount === 0)
			return [input.slice(0, input.length - str.length), str];
		} else {
			return exprParser(input);
		}
	
}

const sExprEval = input => {

	input = input.trim().slice(1);
	const args = [];
	const parsedSymbol = symbolParser(input);
	if (parsedSymbol === null) return null;
	const symbol = parsedSymbol[0];
	input = parsedSymbol[1];
	let result;

	if (!splForms.includes(symbol)) {
		while (input[0] !== ')') {
			const parsed = exprParser(input);
			if (parsed === null) return null;
			args.push(parsed[0]);
			input = parsed[1];
		}
		const func = globalEnv[symbol];
		if (func === undefined) return null;
		result = func(args);
		return [result, input.slice(1)];

	} else {

		switch (symbol) {
			case 'if':
				result = ifParser(input);
				break;
			case 'define':
				result = defineParser(input);
				break;
			case 'begin':
				result = beginParser(input);
				break;
		}
		return result;
	}
}

const exprParser = input => {
	input = input.trim();
	return booleanParser(input) || numParser(input) || stringParser(input) 
		|| sExprEval(input);
}

const splForms = ['if', 'define', 'begin', 'quote', 'lambda'];

const ifParser = input => {
	
	const parsed = exprParser(input);
	if (parsed === null) return null;
	const condition = parsed[0];
	input = parsed[1].trim();
	let val;

	// if (condition === true) {
		if (condition !== false) {

		const trueParsed = exprParser(input);
		if (trueParsed === null) return null;
		val = trueParsed[0];
		input = trueParsed[1];
		input = sExprParser(input)[1];
	} else {
		input = sExprParser(input);
		const falseParsed = exprParser(input[1]);
		val = falseParsed[0];
		input = falseParsed[1];
	}

	if (input[0] !== ')') return null;
	return [val, input.slice(1)];

}

const defineParser = input => {

	const parsed = symbolParser(input);
	if (parsed === null) return null;
	const identifier = parsed[0];
	input = parsed[1];

	const parsedvalue = exprParser(input);
	if (parsedvalue === null) return null;
	const value = parsedvalue[0];
	input = parsedvalue[1];

	return [globalEnv[identifier] = value, input.slice(1)];

}

const beginParser = input => {
	input = input.trim();
	while (input[0] !== ')') {
		const parsed = exprParser(input);
		if (parsed === null) return null;
		const val = parsed[0];
		// console.log('val =', val);
		input = parsed[1];
		// console.log('input1 =', input);
	}
}

// const input = '(begin (define x 2) (+ x 3))';
// const input = 'pi'
// console.log('input =', input);
// console.log(exprParser(input));
// console.log('Math')
console.log(exprParser('-5 ') === -5)
// console.log(exprParser('pi') === 3.141592653589793)
console.log(exprParser('-5') === -5)
console.log(exprParser('(sqrt (/ 8 2))') === 2)
console.log(exprParser('(* (/ 1 2) 3)') === 1.5)
console.log(exprParser('(+ 1 (+ 2 3))') === 6)
console.log(exprParser('( + ( + ( + 9 (+ 2 2)) 2) ( + 3 4) )') === 22)
console.log(exprParser('(+ (+ 1 (- 1 1)) 1)') === 2)
// console.log(exprParser('(+ 1 1)'))
