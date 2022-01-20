import Result from "../src";

const safeDivide = (n: number, m: number): Result<number, Error> => 
    m === 0 ? 
        Result.err(new Error('Divide by zero')) :
        Result.ok(n / m);

describe('Basic Usage', () => {

    test('Creating literals', () => {
        expect(Result.ok(1).isOk()).toBeTruthy();
        expect(Result.err(new Error('Bad!')).isErr()).toBeTruthy();
    });

    test('isOk', () => {
        expect(safeDivide(10, 2).isOk()).toBeTruthy();
        expect(safeDivide(10, 2).isErr()).toBeFalsy();

    });

    test('isErr', () => {
        expect(safeDivide(1, 0).isErr()).toBeTruthy();
        expect(safeDivide(1, 0).isOk()).toBeFalsy();
    });

    test('unwrap', () => {
        expect(safeDivide(10, 2).unwrap()).toEqual(5);

        expect(() => {
            safeDivide(1, 0).unwrap()
        }).toThrowError('Divide by zero');
    });

    test('unwrapOr', () => {
        expect(safeDivide(10, 2).unwrapOr(0)).toEqual(5);
        
        expect(safeDivide(10, 0).unwrapOr(42)).toEqual(42);
    });

    test('unwrapErr', () => {
        expect(safeDivide(10, 0).unwrapErr().message).toEqual('Divide by zero');

        expect(() => {
            safeDivide(10, 2).unwrapErr()
        }).toThrowError('UnwrapErr on Ok');
    });
});

describe('Chaining', () => {
    class CustomMathError extends Error {
        constructor(msg: string) {
            super(msg);
        }
    }

    const sqrt = (n: number) => n > 0 ? 
        Result.ok(Math.sqrt(n)) :
        Result.err(new Error('No imaginary numbers allowed!'));


    test('map when Ok', () => {
        const result = safeDivide(10, 2).map(res => {
            expect(res).toEqual(5);
            return "5";
        });

        expect(result).toBeInstanceOf(Result);
        expect(result.isOk()).toBeTruthy();
        expect(result.unwrap()).toEqual("5");
    });

    test('map when Err', () => {
        const result = safeDivide(10, 0).map(res => {
            expect(res).toEqual(5);
            return "5";
        });

        expect(result).toBeInstanceOf(Result);
        expect(result.isErr()).toBeTruthy();
        expect(result.unwrapErr()).toBeInstanceOf(Error);
        expect(result.unwrapErr().message).toEqual('Divide by zero');
    });

    test('mapErr when Err', () => {
        const result = safeDivide(10, 0).mapErr(_e => {
            return new Error('Math has broken! Panic!');
        });

        expect(result).toBeInstanceOf(Result);
        expect(result.isErr()).toBeTruthy();
        expect(result.unwrapErr()).toBeInstanceOf(Error);
        expect(result.unwrapErr().message).toEqual('Math has broken! Panic!');
    });

    test('mapErr when Ok', () => {
        const result = safeDivide(10, 2).mapErr(_e => {
            return new Error('Math has broken! Panic!');
        });

        expect(result).toBeInstanceOf(Result);
        expect(result.isOk()).toBeTruthy();
        expect(result.unwrap()).toEqual(5);
    });

    test('map and mapErr on Ok', () => {
        const result = safeDivide(10, 2).map(res => {
            return res;
        }).mapErr(_e => {
            // Intended to demonstrate mapping between Error types
            return new CustomMathError('You divided by zero');
        });

        expect(result).toBeInstanceOf(Result);
        expect(result.isOk()).toBeTruthy();
        expect(result.unwrap()).toEqual(5);
    });

    test('map and mapErr on Err', () => {
        const errorResult = safeDivide(10, 0).map(res => {
            return res;
        }).mapErr(_e => {
            // Intended to demonstrate mapping between Error types
            return new CustomMathError('You divided by zero');
        });

        expect(errorResult).toBeInstanceOf(Result);
        expect(errorResult.isErr()).toBeTruthy();
        expect(errorResult.unwrapErr()).toBeInstanceOf(CustomMathError);
        expect(errorResult.unwrapErr().message).toEqual('You divided by zero');
    });

    test('Chaining multiple operations', () => {
        // Make sure the mock function is brand new each time.
        // There is probably a jest utility for doing this.
        const errorHandler = jest.fn()
            .mockImplementation((e: Error) => e);

        const success = safeDivide(10, 2).andThen(sqrt).mapErr(errorHandler);
        expect(errorHandler).not.toHaveBeenCalled();

        expect(success.isOk()).toBeTruthy();
        expect(success.unwrap()).toEqual(Math.sqrt(5));
    });

    test('Handling multiple possible error types', () => {
        const errorHandler = jest.fn()
            .mockImplementation((e: Error) => e);

        const badDivision = safeDivide(10, 0).andThen(sqrt).mapErr(errorHandler);
        expect(errorHandler).toHaveBeenCalledWith(new Error('Divide by zero'));

        expect(badDivision.isErr()).toBeTruthy();
        expect(badDivision.unwrapErr().message).toEqual('Divide by zero');

        const badRoot = safeDivide(10, -2).andThen(sqrt).mapErr(errorHandler);
        expect(errorHandler).toHaveBeenCalledWith(new Error('No imaginary numbers allowed!'));

        expect(badRoot.isErr()).toBeTruthy();
        expect(badRoot.unwrapErr().message).toEqual('No imaginary numbers allowed!');
    });
});
