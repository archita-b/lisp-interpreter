import * as main from "./lisp.js";
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
// main("(define twice (lambda (x) (* 2 x)))");
// console.log(main("(twice 5)"));
// main("(define repeat (lambda (f) (lambda (x) (f (f x)))))");
// console.log(main("((repeat twice) 10)"));
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
