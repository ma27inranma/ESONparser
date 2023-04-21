declare module '@ma27inranma/esonparser'{
    /**
     * translate ESONtext to object
     */
    export function parse(esontext: string): object;
    /**
     * translate object to esontext
     */
    export function stringify(object: object): string;
    /**
     * convert string that contains only number to Number
     */
    export function strNumToNum(object: object): object;
}