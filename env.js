export const globalEnv = {
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
