const globalEnv = {
  "+": (args) => args.reduce((a, b) => Number(a) + Number(b), 0),

  "-": (args) => {
    if (args.length === 0) {
      console.log(`too few args`);
      return null;
    }
    if (args.length === 1) return -args[0];
    return args.reduce((a, b) => Number(a) - Number(b));
  },

  "*": (args) => args.reduce((a, b) => Number(a) * Number(b), 1),

  "/": (args) => {
    if (args.length === 2) return args[0] / args[1];
    console.log(`Expected 2 args, got ${args.length}`);
    return null;
  },

  ">": (args) => {
    if (args.length === 2) return args[0] > args[1];
    console.log(`Expected 2 args, got ${args.length}`);
    return null;
  },

  "<": (args) => {
    if (args.length === 2) return args[0] < args[1];
    console.log(`Expected 2 args, got ${args.length}`);
    return null;
  },

  ">=": (args) => {
    if (args.length === 2) return args[0] >= args[1];
    console.log(`Expected 2 args, got ${args.length}`);
    return null;
  },

  "<=": (args) => {
    if (args.length === 2) return args[0] <= args[1];
    console.log(`Expected 2 args, got ${args.length}`);
    return null;
  },

  "=": (args) => {
    if (args.length === 2) return args[0] === args[1];
    console.log(`Expected 2 args, got ${args.length}`);
    return null;
  },

  sqrt: (args) => Math.sqrt(args[0]),
  pow: (args) => (args.length === 2 ? Math.pow(args[0], args[1]) : null),
  pi: Math.PI,
  "#t": true,
  "#f": false,
};

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

const symbolEval = (input, env = globalEnv) => {
  const parsed = symbolParser(input);
  if (parsed === null) return null;

  const symbol = parsed[0];
  input = parsed[1];

  const func = globalEnv[symbol];
  if (func === undefined) return null;

  return [func, input];
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

const sExprEval = (input, env = globalEnv) => {
  // console.log("env", env);
  if (!input.startsWith("(")) return null;

  input = input.slice(1).trim();

  if (input[0] === ")") return null;

  const parsedSymbol = symbolParser(input) || sExprParser(input);
  if (parsedSymbol === null) return null;

  let symbol;

  if (parsedSymbol[0].startsWith("(")) {
    const parsedSym = exprParser(parsedSymbol[0]);
    if (parsedSym === null) return null;
    symbol = parsedSym[0];
  } else {
    symbol = parsedSymbol[0];
  }
  input = parsedSymbol[1];
  // console.log(",,,,,,,,,", symbol, input);

  if (!splForms.includes(symbol)) {
    const args = [];
    let result;
    while (input[0] !== ")") {
      console.log("in0 =", input);
      const parsed = exprParser(input, env);
      console.log("par =", parsed);
      if (parsed === null) return null;

      args.push(parsed[0]);
      input = parsed[1].trim();
    }

    // console.log(" args =", args);

    if (typeof symbol === "function") {
      // console.log("arg =", symbol(args));
      result = symbol(args);
      return [result, input.slice(1)];
    }
    // if (symbol === localEnv[symbol])

    const func = env[symbol];
    if (func === undefined) return null;
    if (typeof func !== "function") {
      symbol = func;
      return [symbol, input.slice(1)];
    }

    result = func(args);

    return [result, input.slice(1)];
  }

  switch (symbol) {
    case "if":
      return ifParser(input);
    case "define":
      return defineParser(input);
    case "begin":
      return beginParser(input);
    case "set!":
      return setParser(input);
    case "quote":
      return quoteParser(input);
    case "lambda":
      return lambdaParser(input);
  }

  return null;
};

const splForms = ["if", "define", "begin", "quote", "set!", "lambda"];

const ifParser = (input) => {
  const parsed = exprParser(input);
  if (parsed === null) return null;

  const condition = parsed[0];
  input = parsed[1].trim();
  let val, parsedvalue;

  if (condition !== false) {
    parsedvalue = exprParser(input);
    if (parsedvalue === null) return null;

    val = parsedvalue[0];
    input = parsedvalue[1];

    if (input[0] === ")") return [val, input.slice(1)];

    input = sExprParser(input)[1].trim();
  } else {
    input = sExprParser(input)[1];

    parsedvalue = exprParser(input);
    if (parsedvalue === null) return null;

    val = parsedvalue[0];
    input = parsedvalue[1];
  }

  if (input[0] !== ")") return null;
  return [val, input.slice(1)];
};

const defineParser = (input) => {
  const parsed = symbolParser(input);
  if (parsed === null) return null;

  const identifier = parsed[0];
  input = parsed[1];

  const parsedvalue = exprParser(input);
  if (parsedvalue === null) return null;

  const value = parsedvalue[0];
  input = parsedvalue[1].trim();

  if (input[0] !== ")") return null;
  globalEnv[identifier] = value;

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
    // console.log("in lambda", args, params);
    params.forEach((param, i) => {
      localEnv[args[i]] = param;
      // console.log("locEnv", args[i], param);
    });
    // console.log("eval:", body, localEnv);

    return sExprEval(body, localEnv);
  }
  return [lambdaFunc, ""];
};

const exprParser = (input, env = globalEnv) => {
  input = input.trim();
  return (
    booleanParser(input) ||
    numParser(input) ||
    stringParser(input) ||
    sExprEval(input, env) ||
    symbolEval(input, env)
  );
};

const main = (input) => {
  const result = exprParser(input);
  if (result === null || result[1].length > 0) return null;
  return result[0];
};

// const input = '(begin (define x 1) (+ x 1))';
// const input = "( begin ( define r 10) ( * pi ( * r r )))";
// const input = '(define x ( if (< 1 2) 5 6 ))'
// let input = "(define circle-area (lambda (r) (* pi (* r r)))";
// console.log("input =", input);
// console.log(main(input));
// input = "(circle-area (+ 5 5))";
// console.log(main(input));
// input = "(set! x (+ 1 1))";
// console.log(main(input));
// input = "(* pi (* r r))";
// console.log(main(input));
// input = '(+ x 1)'
// console.log(main(input));
// console.log(main("(define a 10"));

// console.log("Math");
// console.log(main("pi"));
// console.log(main("(/ 1 0)"));
// console.log(main("(sqrt (/ 8 2))") === 2);
// console.log(main("(* (/ 1 2) 3)") === 1.5);
// console.log(main("(+ 1 (+ 2 3))") === 6);
// console.log(main("( + ( + ( + 9 ( + 2 2)) 2) ( + 3 4) )") === 22);
// console.log(main("(+ (+ 1 (- 1 1)) 1)") === 2);
// console.log(main("(- 5 2)"));
// console.log(main("(* 5 10)") === 50);

// console.log('If')
// console.log(main('(if (> 30 45) (+ 1 1) "failedOutput")') === "failedOutput");
// console.log(main("(if (> 30 45) (+ 1 1) (if (> 12 12) (+ 78 2) 9))"));
// console.log(main("(if (define a 10) a 2)"));
// console.log(main("(if (= 12 12) (+ 78 2) 9)") === 80);
// console.log(main("(if #f 1 0)") === 0);
// console.log(main("(if #t 1)"));
// main("(define a true)");
// console.log(main("(if a (define a 10) 2)"));
// console.log(main("((if #t + *) 3 4)"));

// console.log("Define");
// console.log(main("(define x (define y 10))"));
// console.log(main("x"));
// console.log(main("y"));
// console.log(main("(define x (+ 5 5))"));
console.log(main("((lambda (l b) (* l b)) 2 3)"));
// console.log(main("((lambda (r) (* pi (* r r))) 10)"));
// console.log(main('(circle-area 3)') === 28.274333882308138)
// console.log(main('(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))'))
// console.log(main('(fact 4)') === 24)
// console.log(main('(fact 10)') === 3628800)

// console.log("Quote");
// console.log(main("(quote #(a b c))"));
// console.log(main("(quote (+ 1 1))"));
// console.log(main("(quote +)"));

// console.log("Set!");
// console.log(main("(define r 1 )"));
// console.log(main("(set! r 10)"));
// console.log(main("(+ r r )"));
