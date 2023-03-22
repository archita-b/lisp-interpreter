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

const numberEval = input => {
	if (isNaN(Number(input))) return null;
	return Number(input);
}

const strEval = input => {
	const match = input.match(/".*"/);
	if (match) return input;
	return null;
}

const symbolEval = (input, env) => {
	if (env[input] !== null) return env[input];
	return null;
}
// console.log(expParser((+ 1)));

const atomEval = (input) => {
	return numParser(input) || stringParser(input); 
}

const expEval = input => {
	input = input.slice(1).trim();
	let exp;
	while (input[0] !== ')') {
	  exp += input[0];
	  input = input.slice(1);
	}
	return input.slice(exp.length);
  }