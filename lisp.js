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
  car: (args) => args[0][0],
  cdr: (args) => args[0].slice(1),
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

// console.log("Math");
// console.log(main("()"));
// console.log("input =", "pi, ", main("pi"));
// console.log("input =", "(/ 1 0),", main("(/ 1 0)"));
// console.log("input =", "(sqrt (/ 8 2)),", main("(sqrt (/ 8 2))"));
// console.log("input =", "(* (/ 1 2) 3),", main("(* (/ 1 2) 3)"));
// console.log("input =", "(+ 1 (+ 2 3)),", main("(+ 1 (+ 2 3))"));
// console.log(
//   "input =",
//   "( + ( + ( + 9 ( + 2 2)) 2) ( - 3 4) ),",
//   main("( + ( + ( + 9 ( + 2 2)) 2) ( - 3 4) )")
// );
// console.log(main("(list 1 2 3)"));
// console.log(main("(car (list 1 2 3))"));
// console.log(main("(cdr (list 1 2 3))"));
// console.log("input =", "(+ (+ 1 (- 1 1)) 1),", main("(+ (+ 1 (- 1 1)) 1)"));
// console.log("input =", "(pow 5 3),", main("(pow 5 3)"));
// console.log("input =", "((* 5 10),", main("((* 5 10)"));
// console.log("input =", "(/ 5 10)),", main("(* 5 10))"));
// console.log("input =", "(- 5 (+ 3 4)) 6),", main("(- 5 (+ 3 4)) 6)"));

// console.log("If");
// console.log(
//   "input =",
//   '(if (> 30 45) (+ 1 1) "failedOutput"), ',
//   main('(if (> 30 45) (+ 1 1) "failedOutput")')
// );
// console.log(
//   "input =",
//   "(if (> 30 45) (+ 1 1) (if (> 12 12) (+ 78 2) 9)),",
//   main("(if (> 30 45) (+ 1 1) (if (> 12 12) (+ 78 2) 9))")
// );
// console.log(
//   "input =",
//   "(if (define a 10) a 2),",
//   main("(if (define a 10) a 2)")
// );
// console.log(
//   "input =",
//   "(if (= 12 12) (+ 78 2) 9), ",
//   main("(if (= 12 12) (+ 78 2) 9)")
// );
// console.log("input =", "(if #f 1 0),", main("(if #f 1 0)"));
// console.log("input =", "(if #t 1), ", main("(if #t 1)"));
// console.log("input =", "(if #f 1), ", main("(if #f 1)"));
// console.log("input =", "(define a true), ", main("(define a true)"));
// console.log(
//   "input =",
//   "(if a (define a 10) 2), ",
//   main("(if a (define a 10) 2)")
// );
// console.log("input =", "((if #t + *) 3 4),", main("((if #t + *) 3 4)"));

// console.log("Define");
// console.log(
//   "input =",
//   "(define x (define y 10)),",
//   main("(define x (define y 10))")
// );
// console.log("input =", "(define x (+ 5 5)),", main("(define x (+ 5 5))"));
// console.log("input =", "(define (x (+ 5 5)),", main("(define (x (+ 5 5))"));
// console.log("input =", "(define x (+ 5 5))),", main("(define x (+ 5 5)))"));
// console.log("input =", "(define area (lambda (l b) (* l b))),");
// main("(define area (lambda (l b) (* l b)))");
// console.log("input =", "(area 2 3),", main("(area 2 3)"));
// console.log("input =", "(define circle-area (lambda (r) (* pi (* r r))))");
// main("(define circle-area (lambda (r) (* pi (* r r))))");
// console.log("input =", "(circle-area 10),", main("(circle-area 10)"));
// console.log(
//   "input =",
//   "(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))"
// );
// main("(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))");
// console.log("input =", "(fact 5),", main("(fact 5)"));

// console.log("Quote");
// console.log(main("(quote a)"));
// console.log(main("(quote +)"));
// console.log(main("(quote #(a b c))"));
// console.log(main("(quote (+ 1 1))"));
// console.log(main("(quote (+ 1 1)))"));

// console.log("Set!");
// console.log(main("(define r 1 )"));
// console.log(main("(set! r 10)"));
// console.log(main("(+ r r )"));

// import main from "./lisp.js";

// main("()");
// console.log(main("(+ 1 1)"));
// // console.log(main("(dw 3 3 )"));
// console.log(main("(define circle-area (lambda (r) (* pi (* r r))))"));
// console.log(main("(circle-area 3)"));
// console.log(
//   main("(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))")
// );
// console.log(main("(fact 10)"));
// console.log(main("(fact 100)"));
// console.log(main("(circle-area (fact 10))"));
// // console.log(main("(define first car)"));
// // console.log(main("(define rest cdr)"));
// console.log(
//   main(
//     "(define count (lambda (item L) (if L (+ (equal? item (first L)) (count item (rest L))) 0)))"
//   )
// );
// console.log(main("(count 0 (list 0 1 2 3 0 0))"));
// console.log(
//   main(
//     "(count (quote the) (quote (the more the merrier the bigger the better)))"
//   )
// );
main("(define twice (lambda (x) (* 2 x)))");
console.log(main("(twice 5)"));
main("(define repeat (lambda (f) (lambda (x) (f (f x)))))");
console.log(main("((repeat twice) 10)"));
// console.log(main("((repeat (repeat twice)) 10)"));
// console.log(main("((repeat (repeat (repeat twice))) 10)"));
// console.log(main("((repeat (repeat (repeat (repeat twice)))) 10)"));
// // console.log(main("(pow 2 16)"));
// console.log(
//   main(
//     "(define fib (lambda (n) (if (< n 2) 1 (+ (fib (- n 1)) (fib (- n 2))))))"
//   )
// );
// console.log(
//   main(
//     "(define range (lambda (a b) (if (= a b) (quote ()) (cons a (range (+ a 1) b)))))"
//   )
// );

// console.log(main("(range 0 10)"));
// console.log(main("(map fib (range 0 10))"));
// console.log(main("(map fib (range 0 20))"));
