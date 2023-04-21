declare module '@ma27inranma/esonparser'{
    const ESON:{
        /**
         * translate ESONtext to object
         */
        parse(esontext: string): object
        /**
         * translate object to esontext
         */
        stringify(object: object):string
        /**
         * convert string that contains only number to Number
         */
        strNumToNum(object: object):object
    }
}