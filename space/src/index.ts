/*
### 1. Closures in TypeScript

A **closure** is simply a function that remembers the variables from the scope in which it was created, even after that outer function has finished executing.

In TypeScript, writing a closure mostly involves ensuring that the arguments and return types of both the outer and inner functions are properly typed.

**Example: A State-Keeping Counter**
This function creates a private `count` variable. The inner function forms a closure around `count`, allowing it to modify and return it safely.

```typescript
*/
// The outer function takes a number and returns a function that returns a number
function createCounter(initialValue: number): () => number {
    // 'count' is enclosed by the returned inner function
    let count: number = initialValue; 

    return function increment(): number {
        count += 1;
        return count;
    };
}

const myCounter = createCounter(10);

console.log(myCounter()); // Output: 11
console.log(myCounter()); // Output: 12

/*
```

**Key Takeaway for Closures:** You are usually encapsulating state. Type the inputs, type the local variables, and explicitly type the function signature being returned so TypeScript knows exactly what to expect.

### 2. Combinators in TypeScript

A **combinator** is a concept from lambda calculus and functional programming. Strictly speaking, it is a higher-order function that has no free variables—meaning it doesn't rely on any external state or variables outside of its own arguments. It only uses its arguments and other combinators to produce a result.

In modern functional TypeScript, "combinator" usually refers to utility functions that take functions as arguments and combine them to return a new function (like `compose` or `pipe`).

Because combinators pass different types of data from one function to the next, **Generics** are absolutely essential here.

**Example 1: The Identity Combinator (I-Combinator)**
The simplest combinator. It takes an argument and returns it unchanged. Generics (`<T>`) ensure that whatever type goes in is the exact type that comes out.

```typescript
*/
const identity = <T>(value: T): T => value;

const a = identity(5);       // 'a' is inferred as number
const b = identity("hello"); // 'b' is inferred as string

/*
```

**Example 2: The Compose Combinator (B-Combinator)**
The `compose` combinator takes two functions and combines them. It reads right-to-left: the output of the second function (`g`) becomes the input of the first function (`f`).

```typescript
*/

// <A, B, C> represent the flow of types through the functions.
const compose = <A, B, C>(
    f: (val: B) => C, 
    g: (val: A) => B
) => (x: A): C => f(g(x));

// Let's create two simple functions
const multiplyByTwo = (n: number): number => n * 2;
const numberToString = (n: number): string => `The result is ${n}`;

// Combine them: number goes in, string comes out
const doubleThenStringify = compose(numberToString, multiplyByTwo);

console.log(doubleThenStringify(10)); 
// Output: "The result is 20"


/*
```

**Example 3: A Branching Combinator (Alt / Or)**
Sometimes you want a combinator that tries one function, and if it yields a "falsy" value (or null/undefined), it falls back to another.

```typescript
*/
const alt = <T, R>(
    f1: (val: T) => R | null, 
    f2: (val: T) => R
) => (x: T): R => {
    const result = f1(x);
    return result !== null ? result : f2(x);
};

const getDisplayName = (name: string | null): string | null => name;
const getDefaultName = (): string => "Anonymous";

const ensureName = alt(getDisplayName, getDefaultName);

console.log(ensureName("Alice")); // Output: "Alice"
console.log(ensureName(null));    // Output: "Anonymous"
/*
```

**Key Takeaway for Combinators:** They are pure functions that glue other functions together. Rely heavily on TypeScript **Generics** (`<T, U, V>`) when writing them. Without generics, you will be forced to use `any` or `unknown`, which defeats the purpose of combining functions securely in TypeScript.
*/