/**
 * eval the whole object recursively
 * @param obj an object you want to eval
 */
export function evalAll(obj:object): object
/**
 * eval the whole object recursively
 * @param obj an object you want to eval
 */
export function eval(ESONValue:string): string


export class ESONdType{
    private constructor()

    /**
     * check if this data is an error
     */
    isError(): boolean
}

export class ESONError{
    private constructor()

    errorMessage:string
    errorStack:string|undefined
    errorType:string
}
export class ESONErrorStack{
    private constructor();

    stack:Array<string>
}