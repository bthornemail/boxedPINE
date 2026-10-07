function* fibonacciGenerator(startingPosition = 1) {
    const f0 = 0;
    if (startingPosition === 1) {
        yield f0;
    }
    const f1 = 1;
    if (startingPosition <= 2) {
        yield f1;
    }
    let previousValue = f0, currentValue = f1, nextValue;
    let currentPosition = 3;
    while (true) {
        nextValue = previousValue + currentValue;
        previousValue = currentValue;
        currentValue = nextValue;
        if (currentPosition >= startingPosition) {
            yield nextValue;
        } else {
            currentPosition += 1;
        }
    }
}

const it = fibonacciGenerator();
console.log(it.next().value); // 0
console.log(it.next().value); // 1
console.log(it.next().value); // 1
console.log(it.next().value); // 2
console.log(it.next().value); // 3

console.log();

const it2 = fibonacciGenerator(4);
console.log(it2.next().value); // 2
console.log(it2.next().value); // 3
console.log(it2.next().value); // 5
console.log(it2.next().value); // 8
console.log(it2.next().value); // 13

function* accumulator(startingValue = 0): Generator<number, any, number> {
    let value = startingValue;
    while (true) {
        const input = yield value;
        value += input;
    }
}

const is = accumulator();
is.next();
console.log(is.next(3).value); // 3
console.log(is.next(10).value); // 13
console.log(is.next(-3).value); // 10

function* fooGen() {
    try {
        throw "Hi";
    } catch (err) {
        console.log("Err caught in fooGen:", err);
    }
    return "End of execution";
}

const was = fooGen();
was.next();
console.log(was.next());

// Err caught in fooGen: Hi
// { value: "End of execution", done: true }
// { value: undefined, done: true }

(async () => {
    function* fibonacciGenerator() {
        const f0 = 0;
        yield f0;
        const f1 = 1;
        yield f1;
        let previousValue = f0, currentValue = f1, nextValue;
        try {
            while (true) {
                nextValue = previousValue + currentValue;
                previousValue = currentValue;
                currentValue = nextValue;
                yield nextValue;
            }
        } catch (err) {
            return;
        }
    }
    let flag = true;
    let value: number | void;
    const it = fibonacciGenerator();
    while (flag) {
        value = it.next().value;
        if (value === Number.MAX_SAFE_INTEGER || !Number.isFinite(value)) {
            it.throw("overflow");
            console.log("overflow detected");
            console.log(it.next());
            flag = false;
        } else {
            console.log(value);
        }
    }
    function* g1() {
        yield 2;
        yield 3;
        yield 4;
    }

    function* g2() {
        yield 1;
        yield* g1();
        yield 5;
    }

    const iterator = g2();

    const rot7 = (x, n) => (x << n) | (x >>> (7 - n));
    const rot15 = (x, n) => (x << n) | (x >>> (15 - n));
    const rot60 = (x, n) => (x << n) | (x >>> (60 - n));
    const rot240 = (x, n) => (x << n) | (x >>> (240 - n));
    const rot360 = (x, n) => (x << n) | (x >>> (360 - n));

    console.log(iterator.next()); // {value: 1, done: false}
    console.log(iterator.next()); // {value: 2, done: false}
    console.log(iterator.next()); // {value: 3, done: false}
    console.log(iterator.next()); // {value: 4, done: false}
    console.log(iterator.next()); // {value: 5, done: false}
    console.log(iterator.next()); // {value: undefined, done: true}           
})();