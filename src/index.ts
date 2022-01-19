class Result<T, E extends Error> {
    /**
     * Constructs an instance of `Ok` from the provided value
     * @param v the value to make a result from
     * @returns an Ok instance where the inner value is `v`
     */
    static ok<T>(v: T): Ok<T, never> {
        return new Ok(v);
    }

    /**
     * Constructs an instance of `Err` from the provided value
     * @param e the value to make a result from
     * @returns an Err instance where the inner value is `e`
     */
    static err<E extends Error>(e: E): Err<never, E> {
        return new Err(e);
    }

    /**
     * @returns true if this result is Ok
     */
    isOk(): boolean {
        return this instanceof Ok;
    }

    /**
     * @returns true if this result is Err
     */
    isErr(): boolean {
        return this instanceof Err;
    }

    /**
     * Given a result `R`, returns the inner Ok value, or throws an exception. 
     * @returns The inner `Ok<T>`
     * @throws if R is `Err<E>`
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
     */
    unwrapOr(dfault: T): T {
        if (this instanceof Ok) {
            return this.ok;
        }

        return dfault;
    }

    /**
     * The dual of {@link Result.unwrap} returns the inner E value
     * instead of the inner Ok
     * @returns The inner `Err<E>`
     * @throws If R is `Ok<T>`
     */
    unwrapErr(): E {
        if (this instanceof Err) {
            return this.err;
        }

        throw new Error('UnwrapErr on Ok');
    }

    /**
     * Creates a new result by applying the provided function to the inner Ok value,
     * or returns the result as is if it's an Err
     * @param f A function for transforming the inner Ok value
     * @returns A new result where the inner value has been transformed and
     * packaged up in another result
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
     * The dual of {@link Result.map}.
     * @param f a function from transforming the inner Err value
     * @returns A new result where the inner error has been transformed and packaged
     * up in another result.
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
     * @param f a function for transforming an Ok<T> into another Result
     * @returns the transformed result
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
