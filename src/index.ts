class Result<T, E extends Error> {
    /**
     * Constructs an instance of `Ok` from the provided value
     * @param v the value to make a result from
     * @returns an Ok instance where the inner value is `v`
     * @example
     * ```ts
     * const anOkLiteral: Result<number, never> = Result.ok(5);
     * ```
     */
    static ok<T>(v: T): Ok<T, never> {
        return new Ok(v);
    }

    /**
     * Constructs an instance of `Err` from the provided value
     * @param e the value to make a result from
     * @returns an Err instance where the inner value is `e`
     * @example
     * ```ts
     * const anErrLiteral: Result<never, Error> = new Error('Some Error');
     * ```
     */
    static err<E extends Error>(e: E): Err<never, E> {
        return new Err(e);
    }

    /**
     * @returns true if this result is Ok
     * @example
     * ```ts
     * const anOk: Result<number, never> = Result.ok(5);
     * anOk.isOk() // true
     * ```
     */
    isOk(): boolean {
        return this instanceof Ok;
    }

    /**
     * @returns true if this result is Err
     * @example
     * ```ts
     * const anErr: Result<never, Error> = new Error('Some Error');
     * anErr.isErr() // true
     * ```
     */
    isErr(): boolean {
        return this instanceof Err;
    }

    /**
     * If `this` is `Ok`, returns the inner `T` value. If `this` is `Err`,
     * `unwrap` throws the inner exception.
     * 
     * @returns The inner `T` value
     * @throws if `this` is `Err<E>`
     * @example
     * ```ts
     * // Division by 0 returns an Err
     * type SafeDivideFunc = (n: number, m: number) => Result<number, Error>;
     * const safeDivide: SafeDivideFunc = (n, m) => {
     *  // ...
     * };
     * 
     * safeDivide(10, 2).unwrap() // 5
     * safeDivide(10, 0).unwrap() // throws an exception
     * ```
     */
    unwrap(): T {
        if (this instanceof Ok) {
            return this.ok;
        } else if (this instanceof Err) {
            throw this.err;
        } else {
            throw new Error('Unexpected state!');
        }
    }

    /**
     * Unwraps the result `R` or returns the provided default if `R` is `Err<E>`
     * @param dfault the value to return if R is Err<E>
     * @returns The inner `Ok<T>` or the provided default
     * @example
     * ```ts
     * // Division by 0 returns an Err
     * type SafeDivideFunc = (n: number, m: number) => Result<number, Error>;
     * const safeDivide: SafeDivideFunc = (n, m) => {
     *  // ...
     * };
     * 
     * safeDivide(10, 2).unwrapOr("failed at division") // 5
     * safeDivide(10, 0).unwrapOr("failed at division") // "failed at division" 
     * ```
     */
    unwrapOr(dfault: T): T {
        if (this instanceof Ok) {
            return this.ok;
        }

        return dfault;
    }

    /**
     * The dual of {@link unwrap}.
     * 
     * If `this` is `Err`, returns the inner `E` value. If `this` is `Ok`,
     * `unwrapErr` throws an exception.
     * 
     * @returns The inner `E` value
     * @throws If `this` is `Ok<T>`
     * @example
     * ```ts
     * // Division by 0 returns an Err
     * type SafeDivideFunc = (n: number, m: number) => Result<number, Error>;
     * const safeDivide: SafeDivideFunc = (n, m) => {
     *  // ...
     * };
     * 
     * safeDivide(10, 0).unwrapErr() // returns the Error object
     * safeDivide(10, 2).unwrapErr() // throws an exception
     * ```
     */
    unwrapErr(): E {
        if (this instanceof Err) {
            return this.err;
        }

        throw new Error('UnwrapErr on Ok');
    }

    /**
     * Creates a new result by applying the provided function to the inner `T` value,
     * if the result is `Ok`. Otherwise, if the result is `Err` it is returned as-is.
     * 
     * This function is distinct from {@link andThen} because the callback `f`
     * maps *values* to *values*. While the callback in {@link andThen} maps
     * *values* to *Results*. Use this function in conjunction with {@link mapErr}
     * to conditionally operate on inner values depending on if the `Result` is `Ok`
     * or `Err`.
     * 
     * @param f A function for transforming the inner Ok value
     * @returns A new result where the inner value has been transformed and
     * packaged up in another result
     * @example
     * ```ts
     * // Division by 0 returns an Err
     * type SafeDivideFunc = (n: number, m: number) => Result<number, Error>;
     * const safeDivide: SafeDivideFunc = (n, m) => {
     *  // ...
     * };
     * 
     * let divideThenSquare: Result<number, Error>;
     * divideThenSquare = safeDivide(10, 2).map(ans => ans*ans);
     * 
     * divideThenSquare.isOk() // true
     * divideThenSquare.unwrap() // 25
     * ```
     */
    map<U>(f: (a: T) => U): Result<U, E> {
        if (this instanceof Ok) {
            const u = f(this.ok);
            return Result.ok(u);
        }

        /*
        We can't return `this` because `U` and `T` have no overlap. But this is safe
        because if the value *isn't* mapped to a concrete instance of `U`, then `this`
        had to have been an `Err` when `map` was called. So the cast is logically
        correct because the new Result is either `U` or `E`. The if handles `U`
        and this return handles `E`.
        */
        return this as unknown as Result<U, E>;
    }

    /**
     * The dual of {@link Result.map}
     * 
     * Creates a new result by applying the provided function to the inner `E` value,
     * if the result is `Err`. Otherwise, if the result is `Ok` it is returned as-is.
     *
     * 
     * @param f a function for transforming the inner Err value
     * @returns A new result where the inner error has been transformed and packaged
     * up in another result.
     * @example
     * ```ts
     * // Division by 0 returns an Err
     * type SafeDivideFunc = (n: number, m: number) => Result<number, Error>;
     * const safeDivide: SafeDivideFunc = (n, m) => {
     *  // ...
     * };
     * 
     * let divideThenSquare: Result<number, Error>;
     * divideThenSquare = safeDivide(10, 0).mapError(e => new Error('Totally different Error'));
     * 
     * divideThenSquare.isErr() // true
     * divideThenSquare.unwrapErr().message // "Totally different Error" 
     * ```
     */
    mapErr<X extends Error>(f: (e: E) => X): Result<T, X> {
        if (this instanceof Err) {
            const x = f(this.err);
            return Result.err(x);
        }

        return this as unknown as Result<T, X>;
    }

    /**
     * Allows for chaining of Result-producing frunctions.
     * 
     * If `this` is an Err, the Result is returned as is. 
     * 
     * This is distinct from {@link map} because `map` takes a function
     * that maps *values* to *values*. `andThen` expects a function
     * that maps *values* into other `Results`.
     * 
     * @param f a function for transforming an Ok<T> into another Result
     * @returns the transformed result
     * @example
     * ```ts
     * // Division by 0 returns an Err
     * type SafeDivideFunc = (n: number, m: number) => Result<number, Error>;
     * const safeDivide: SafeDivideFunc = (n, m) => {
     *  // ...
     * };
     * 
     * // Sqrt of a negative is not allowed (we're not very mathematically mature)
     * const SqrtFunc = (n: number) => Result<number, Error>;
     * const sqrt: SqrtFunction = (n) => {
     *  // ...
     * };
     * 
     * safeDivide(10, 2).andThen(sqrt).map(finalRes => {
     *  // process the result
     * }).mapErr(e => {
     *  // any Err values will fall through to here for processing!
     * });
     * ```
     */
    andThen<U, X extends Error>(f: (a: T) => Result<U, X>): Result<U, E | X> {
        if (this instanceof Ok) {
            return f(this.ok);
        }

        return this as unknown as Result<U, E>;
    }
}

class Ok<T, E extends Error> extends Result<T, E> {
    ok;

    constructor(a: T) {
        super();
        this.ok = a;
    }
}

class Err<T, E extends Error> extends Result<T, E> {
    err;

    constructor(e: E) {
        super();
        this.err = e;
    }
}

export default Result;
