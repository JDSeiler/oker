import Result from "../src";

describe('Basic Usage', () => {
    const safeDivide = (n: number, m: number): Result<number, Error> => 
        m === 0 ? 
            Result.err(new Error('Divide by zero')) :
            Result.ok(n / m);

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

});