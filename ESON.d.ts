declare module '@ma27inranma/esonparser'{
    const ESON:{
        parse(esontext: string): object
        stringify(object: object):string
        strNumToNum(object: object):object
    }
}