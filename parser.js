const booleanParser = (input) => {
  if (input.startsWith("true")) {
    return [true, input.slice(4)];
  }
  if (input.startsWith("false")) {
    return [false, input.slice(5)];
  }
  return null;
};

const numParser = (input) => {
  const result = input.match(/^-?([1-9]\d*|0)(\.\d+)?([Ee][+-]?\d+)?/);
  if (result) {
    return [Number(result[0]), input.slice(result[0].length)];
  }
  return null;
};

const stringParser = (input) => {
  if (!input.startsWith('"')) return null;
  input = input.slice(1);
  let result = "";
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
};

const specialCharParser = (input) => {
  let escChar = input[1];
  let sChar = "";
  switch (escChar) {
    case "\\":
      sChar = "\\";
      break;
    case "/":
      sChar = "/";
      break;
    case "b":
      sChar = "\b";
      break;
    case "f":
      sChar = "\f";
      break;
    case "n":
      sChar = "\n";
      break;
    case "t":
      sChar = "\t";
      break;
    case "r":
      sChar = "\r";
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
};

const symbolParser = (input) => {
  if (input.startsWith("(")) return null;

  const match = input.match(/(\s|\)|$)/);

  if (match === null) return null;
  const matchIndex = match.index;

  const symbol = input.slice(0, matchIndex);
  input = input.slice(matchIndex);

  return [symbol, input.trim()];
};

const getArgs = (input) => {
  const args = [];
  while (input[0] !== ")") {
    const parsed =
      booleanParser(input) ||
      numParser(input) ||
      stringParser(input) ||
      sExprParser(input);
    args.push(parsed[0]);
    input = parsed[1].trim();
  }
  return [args, input.slice(1)];
};

const sExprParser = (input) => {
  input = input.trim();

  if (input.startsWith("(")) {
    let str = input.slice(1);
    let bracketCount = 1;
    while (bracketCount !== 0) {
      if (str[0] === "(") bracketCount++;
      if (str[0] === ")") bracketCount--;
      str = str.slice(1);
    }
    if (bracketCount === 0)
      return [input.slice(0, input.length - str.length), str];
  } else {
    return exprParser(input);
  }
};

const splForms = ["if", "define", "begin", "quote", "set!", "lambda"];

const ifParser = (input, env = globalEnv) => {
  const parsed = exprParser(input, env);
  if (parsed === null) return null;

  const condition = parsed[0];
  input = parsed[1].trim();
  let val, parsedvalue;

  if (condition !== false) {
    parsedvalue = exprParser(input, env);
    if (parsedvalue === null) return null;

    val = parsedvalue[0];
    input = parsedvalue[1];

    if (input[0] === ")") return [val, input.slice(1)];

    input = sExprParser(input)[1].trim();
  } else {
    input = sExprParser(input)[1];

    parsedvalue = exprParser(input, env);
    if (parsedvalue === null) return null;

    val = parsedvalue[0];
    input = parsedvalue[1];
  }

  if (input[0] !== ")") return null;
  return [val, input.slice(1)];
};

const defineParser = (input, env = globalEnv) => {
  const parsed = symbolParser(input);
  if (parsed === null) return null;

  const identifier = parsed[0];
  input = parsed[1];

  const parsedvalue = exprParser(input, env);
  if (parsedvalue === null) return null;
  const value = parsedvalue[0];
  input = parsedvalue[1].trim();

  if (input[0] !== ")") return null;
  env[identifier] = value;

  return [value, input.slice(1)];
};

const beginParser = (input) => {
  input = input.trim();

  let args = getArgs(input)[0];
  input = getArgs(input)[1];

  args = args.map((arg) => exprParser(arg)[0]);

  return [args[args.length - 1], input];
};

const quoteParser = (input) => {
  let datum = "";
  while (input && input[0] !== ")") {
    datum += input[0];
    input = input.slice(1);

    if (input[0] === ")") {
      datum += input[0];
      input = input.slice(1);
    }
  }
  if (!input[0]) return [datum.slice(0, datum.length - 1), input];
  return [datum, input.slice(1)];
};

const setParser = (input) => {
  const parsed = symbolParser(input);
  if (parsed === null) return null;

  const identifier = parsed[0];
  input = parsed[1].trim();

  if (globalEnv[identifier] === undefined) return null;

  const value = exprParser(input);
  if (value === null) return null;
  globalEnv[identifier] = value[0];

  return [value[0], input.slice(1)];
};

const lambdaParser = (input) => {
  const arguments = getArgs(input)[0];
  input = getArgs(input)[1];
  let argsInput = arguments[0].slice(1);

  const args = [];
  while (argsInput[0] !== ")") {
    const parsed = symbolParser(argsInput);
    if (parsed === null) return null;
    args.push(parsed[0]);
    argsInput = parsed[1];
  }
  const body = arguments[1];
  const localEnv = Object.create(globalEnv);

  function lambdaFunc(params) {
    params.forEach((param, i) => {
      localEnv[args[i]] = param;
    });
    const result = sExprEval(body, localEnv);
    if (result === null) return null;
    return result[0];
  }
  return [lambdaFunc, input];
};
