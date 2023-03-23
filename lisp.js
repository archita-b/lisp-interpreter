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
	'pi' : Math.PI
}

const exprParser = input => {
	let result, str = '';
	if (!input.startsWith('(')) {
		result = booleanParser(input) || numParser(input) || stringParser(input);
	} else {
		str = input.slice(1);
		let paren = 1;
		let sCount = 0;
		while (paren !== 0) {
			sCount++;
		if (str[0] === '(') {
			paren++;
			str = str.slice(1);
			// result = sExprParser(input);
		} else if (str[0] === ')') {
			paren--;
			str = str.slice(1);
		} else {
			str = str.slice(1);
		}
	}
	while (input[0] !== ')') {
		result = sExprParser(input);
	}
	}
	if (result === null) return null;
	return [result, input.slice(input.length - str.length).trim()];
	// return result;
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

const fnParser = input => {
	let fn = '';
	while (input[0] !== ' ') {
		fn += input[0];
		input = input.slice(1);
	}
	return fn;
}

const argsParser = input => {
	const args = [];
	while (input[0] !== ')') {
		args.push(input[0]);
		input= input.slice(1).trim();
	}
	return args;
}

const sExprParser = input => {
	let result;
	if (input.startsWith('(')) {
		input = input.slice(1);
		const fn = fnParser(input);
		input = input.slice(fn.length).trim();
		const args = argsParser(input);
		if (Object.keys(globalEnv).includes(fn)) {
			result = globalEnv[fn](args);
		}
	}
	return result;
}
console.log(exprParser('(+ (+ 4 5) 2)'));



