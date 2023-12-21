// declare module '@ma27inranma/esonparser'{
//     /**
//      * translate ESONtext to object
//      */
//     export function parse(esontext: string): object;
//     /**
//      * translate object to esontext
//      */
//     export function stringify(object: object): string;
//     /**
//      * convert string that contains only number to Number
//      */
//     export function strNumToNum(object: object): object;
// }

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
/**
 * Clone an object using ESON
 * @param object the object you want to clone
 * @returns a new cloned object
 * @thrwos when non-object value passed
 */
export function cloneObj(object: object): object;