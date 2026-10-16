;; mexpr.lisp — the M->S translator, below Lisp 1.5.
;; Only the elementary functions: eq car cdr cons cond null atom (+ print/eval to see it).
;; McCarthy wrote programs as M-expressions (f[x; y], and [p -> e; ...] for a branch)
;; and translated them DOWN to S-expressions (pure parens, the data the machine holds).
;; This is that translation, as a program in the thing it translates to.
;;   run:  sbcl --script src/mexpr.lisp
;;
;; The M-expression is given here in a readable surrogate (brackets/semicolons/arrows
;; are not S-expression-readable), with two markers that carry the only real structure
;; a translator must move:   =   a definition (label),   cnd   a conditional ([ -> ; ]).
;; Everything else -- application f[a;b] -> (f a b) -- is already the same shape.

;; ---- the six-primitive collation (what we are translating TO) ----------------
(defun before (x y seq)
  (cond ((null seq) nil)
        ((eq (car seq) x) t)
        ((eq (car seq) y) nil)
        (t (before x y (cdr seq)))))

(defun insert (x lst order)
  (cond ((null lst) (cons x nil))
        ((before x (car lst) order) (cons x lst))
        (t (cons (car lst) (insert x (cdr lst) order)))))

;; ---- the translator: M-expression (surrogate) -> S-expression ----------------
(defun m->s-list (xs)                       ; translate each item of an arg list (pure map)
  (cond ((null xs) nil)
        (t (cons (m->s (car xs)) (m->s-list (cdr xs))))))

(defun m->s-clauses (cs)                     ; translate cond clauses: (test expr) each
  (cond ((null cs) nil)
        (t (cons (cons (m->s (car (car cs)))                 ; the test
                       (cons (m->s (car (cdr (car cs)))) nil)) ; the expr
                 (m->s-clauses (cdr cs))))))

(defun m->s (m)
  (cond ((atom m) m)                         ; an atom is itself (a variable / constant)
        ((eq (car m) 'cnd)                   ; [p -> e; ...]  becomes  (cond (p e) ...)
         (cons 'cond (m->s-clauses (cdr m))))
        ((eq (car m) '=)                     ; name[args] = body  becomes  (defun name args body)
         (cons 'defun
               (cons (car (car (cdr m)))                 ; the name
                     (cons (cdr (car (cdr m)))           ; the arg list
                           (cons (m->s (car (cdr (cdr m)))) nil)))))
        (t (cons (car m) (m->s-list (cdr m)))))) ; application: head stays, recurse the args

;; ---- the M-expression of collate, in the surrogate --------------------------
(defparameter collate-M
  '(= (collate items order)
      (cnd ((null items) nil)
           (t (insert (car items) (collate (cdr items) order) order)))))

;; ---- run the whole loop: M -> S -> define -> use ----------------------------
(format t "~&M-expression (what you write):~%  ~s~%" collate-M)
(format t "~%translated to S-expression (what the machine holds):~%  ~s~%" (m->s collate-M))
(eval (m->s collate-M))                      ; the translated form defines collate for real
(defparameter order '(0 1 2 3 4 5 6 7 8 9 a b c d e f))
(format t "~%then it runs:  (collate '(c 9 a 0 f 3) order) => ~s~%"
        (collate '(c 9 a 0 f 3) order))      ; => (0 3 9 A C F)
