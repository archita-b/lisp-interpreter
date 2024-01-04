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

  list: (args) => args,
  car: (args) => (args.length === 1 ? args[0][0] : null),
  cdr: (args) => (args.length === 1 ? args[0].slice(1) : null),
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
    // if (input[0].match(/[\u0000-\u001f]/i)) return null;
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

  const func = env[symbol];
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

const beginParser = (input, env = globalEnv) => {
  input = input.trim();

  let args = getArgs(input)[0];
  input = getArgs(input)[1];

  args = args.map((arg) => {
    return exprParser(arg) !== null ? exprParser(arg)[0] : null;
  });

  return [args[args.length - 1], input];
};

const quoteParser = (input, env = globalEnv) => {
  let datum = "";

  while (input[0] !== ")") {
    if (!input.startsWith("(")) {
      datum += input[0];
      input = input.slice(1).trim();
    } else {
      const result = sExprParser(input);
      if (result === null) return null;
      datum += result[0];
      input = result[1].trim();
    }
    if (!input) return null;
  }
  return [datum, input.slice(1)];
};

const setParser = (input, env = globalEnv) => {
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

const lambdaParser = (input, env = globalEnv) => {
  const argsArr = getArgs(input);
  const arguments = argsArr[0];
  input = argsArr[1];
  let argsInput = arguments[0].slice(1);

  const args = [];
  while (argsInput[0] !== ")") {
    const parsed = symbolParser(argsInput);
    if (parsed === null) return null;
    args.push(parsed[0]);
    argsInput = parsed[1];
  }
  const body = arguments[1];
  const localEnv = Object.create(env);

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

const sExprEval = (input, env = globalEnv) => {
  if (!input.startsWith("(")) return null;

  input = input.slice(1).trim();

  if (input[0] === ")") return ["()", input.slice(1)];

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

  if (!splForms.includes(symbol)) {
    const args = [];
    let result;
    while (input[0] !== ")") {
      const parsed = exprParser(input, env);
      if (parsed === null) return null;

      args.push(parsed[0]);
      input = parsed[1].trim();
    }

    if (typeof symbol === "function") {
      result = symbol(args);
      return [result, input.slice(1)];
    }

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
      return ifParser(input, env);
    case "define":
      return defineParser(input, env);
    case "begin":
      return beginParser(input, env);
    case "set!":
      return setParser(input, env);
    case "quote":
      return quoteParser(input, env);
    case "lambda":
      return lambdaParser(input, env);
  }

  return null;
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

// const input =
//   "(begin (define twice (lambda (x) (* 2 x))) (define repeat (lambda (f) (lambda (x) (f (f x))))) ((repeat (repeat twice)) 10))";
// console.log("input =", input);
// console.log(main(input));

const testCases = [
  // math test cases:
  {
    msg: "global expression has extra bracket at the begining",
    input: "((* 5 10)",
    expectedOutput: null,
  },
  {
    msg: "global expression has extra bracket at the end",
    input: "(/ 5 10))",
    expectedOutput: null,
  },
  {
    msg: "global expression has extra bracket nested global expression",
    input: "(- 5 (+ 3 4)) 6)",
    expectedOutput: null,
  },
  {
    msg: "should eval empty parentheses",
    input: "()",
    expectedOutput: "()",
  },
  {
    msg: "should eval global expression",
    input: "(+)",
    expectedOutput: 0,
  },
  {
    msg: "should evaluate global value",
    input: "pi",
    expectedOutput: Math.PI,
  },
  {
    msg: "should evaluate global expression",
    input: "(/ 1 0)",
    expectedOutput: Infinity,
  },
  {
    msg: "should evaluate nested global expression",
    input: "(sqrt (/ 8 2))",
    expectedOutput: 2,
  },
  {
    msg: "should evaluate global expression",
    input: "(+ (+ 1 (- 1 1)) 1)",
    expectedOutput: 2,
  },
  {
    msg: "should evaluate nested global expression",
    input: "(* (/ 1 2) 3)",
    expectedOutput: 1.5,
  },
  {
    msg: "should evaluate nested global expression with extra spaces in between",
    input: "( + 1 ( + 2 3 ) )",
    expectedOutput: 6,
  },
  {
    msg: "should evaluate nested global expression",
    input: "( + ( + ( + 9 ( + 2 2)) 2) ( - 3 4) )",
    expectedOutput: 14,
  },
  {
    msg: "should evaluate global expression 'list'",
    input: "(list 1 2 3)",
    expectedOutput: [1, 2, 3],
  },
  {
    msg: "should evaluate global expression 'car'",
    input: "(car (list 1 2 3))",
    expectedOutput: 1,
  },
  {
    msg: "should evaluate global expression 'cdr'",
    input: "(cdr (list 1 2 3))",
    expectedOutput: [2, 3],
  },
  {
    msg: "should evaluate global expression exponent",
    input: "(pow 5 3)",
    expectedOutput: 125,
  },
  // if test cases
  {
    msg: "'if' expression without <alternate> should be unspecified",
    input: "(if #f 1)",
    expectedOutput: null,
  },
  {
    msg: "'if' expression without <alternate> should evaluate",
    input: "(if #t 1)",
    expectedOutput: 1,
  },
  {
    msg: "'if' expression should evaluate",
    input: "(if #f 1 0)",
    expectedOutput: 0,
  },
  {
    msg: "nested 'if' expression should evaluate",
    input: "(if (= 12 12) (+ 78 2) 9)",
    expectedOutput: 80,
  },
  {
    msg: "nested 'if' expression should evaluate",
    input: "((if #t + *) 3 4)",
    expectedOutput: 7,
  },
  {
    msg: "nested 'if' expression should evaluate",
    input: "(if (> 30 45) (+ 1 1) (+ 2 2))",
    expectedOutput: 4,
  },
  {
    msg: "nested 'if' expression should evaluate",
    input: "(if (> 30 45) (+ 1 1) (if (> 12 12) (+ 78 2) 9))",
    expectedOutput: 9,
  },
  {
    msg: "nested 'if' expression should evaluate",
    input: "(if (define a 10) a 2)",
    expectedOutput: 10,
  },
  // define test cases
  {
    msg: "extra bracket within 'define' expression",
    input: "(define (x (+ 5 5))",
    expectedOutput: null,
  },
  {
    msg: "extra bracket at the end of 'define' expression",
    input: "(define x (+ 5 5)))",
    expectedOutput: null,
  },
  {
    msg: "should evaluate nested 'define' expression",
    input: "(define x (define y 10))",
    expectedOutput: 10,
  },
  {
    msg: "should evaluate nested 'define' expression",
    input: "(define x (+ 5 5))",
    expectedOutput: 10,
  },
  // lambda test cases
  {
    msg: "should evaluate 'lambda' expression",
    input: "(begin (define area (lambda (l b) (* l b))) (area 2 3))",
    expectedOutput: 6,
  },
  {
    msg: "should evaluate 'lambda' expression",
    input:
      "(begin (define circle-area (lambda (r) (* pi (* r r)))) (circle-area 10))",
    expectedOutput: 314.1592653589793,
  },
  {
    msg: "should evaluate 'lambda' expression",
    input:
      "(begin (define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1)))))) (fact 5))",
    expectedOutput: 120,
  },
  {
    msg: "should evaluate 'lambda' expression",
    input: `(begin (define twice (lambda (x) (* 2 x))) 
    (define repeat (lambda (f) (lambda (x) (f (f x))))) ((repeat twice) 10))`,
    expectedOutput: 40,
  },
  // quote test cases
  {
    msg: "'quote' expression has extra bracket at the end",
    input: "(quote (+ 1 1)))",
    expectedOutput: null,
  },
  {
    msg: "'quote' expression has extra bracket at the end",
    input: "(quote (+ 1 (+ 1 1)))",
    expectedOutput: "(+ 1 (+ 1 1))",
  },
  {
    msg: "should evaluate special form expression",
    input: "(quote a)",
    expectedOutput: "a",
  },
  {
    msg: "should evaluate special form expression",
    input: "(quote +)",
    expectedOutput: "+",
  },
  {
    msg: "should evaluate special form expression",
    input: "(quote #(a b c))",
    expectedOutput: "#(a b c)",
  },
  {
    msg: "should evaluate special form expression",
    input: "(quote (+ 1 1) )",
    expectedOutput: "(+ 1 1)",
  },
  //set test cases
  {
    msg: "should evaluate special form expression",
    input: "(begin (define r 1 ) (set! s 2))",
    expectedOutput: null,
  },
  {
    msg: "should evaluate special form expression",
    input: "(begin (define x 2 ) (+ x 1) (set! x 4) (+ x 1))",
    expectedOutput: 5,
  },
];

const results = testCases.map((test) => {
  const output = main(test.input);
  const passed = String(test.expectedOutput) === String(output);

  return { ...test, output, passed };
});

results
  .filter((result) => !result.passed)
  .forEach((result) => {
    console.log(result.msg);
    console.log("input:");
    console.log(result.input);
    console.log("output:");
    console.log(result.output);
    console.log("expected output:");
    console.log(result.expectedOutput);
    console.log(result.passed ? "PASSED" : "FAILED");
    console.log("\n====================\n");
  });
console.log("PASSED:", results.filter((result) => result.passed).length);
console.log("FAILED:", results.filter((result) => !result.passed).length);
