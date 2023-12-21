const ESON = require("./ESON");



class ESONdType{
    /**
     * @param {string} ESONValue
     */
    constructor(ESONValue){
        this.rawValue=ESONValue;
    }

    rawValue;


    isError(){
        return this instanceof ESONError;
    }
}

class ESONError extends ESONdType{
    /**
     * @param {string} ESONValue
     */
    constructor(ESONValue){
        super();

        this.rawValue=ESONValue;
        if(!ESONValue.startsWith('$E$')) throw new Error('This ESON value is not an error');

        const context=ESONValue.substring(3).split(/(?<!\\);/g);

        if(context.length==1){
            this.errorMessage=context[0];
        }else{
            this.errorType=context[0];
            this.errorMessage=context[1];

            if(context[2]!=null)
                this.errorStack=new ESONErrorStack(context[2]);
        }
    }

    errorType;
    errorMessage;
    errorStack;
}


class ESONErrorStack{
    /**
     * @param {string} ESONValue
     */
    constructor(ESONValue){
        this.rawValue=ESONValue;
        if(!ESONValue.startsWith('$S$')) throw new Error('This ESON value is not an error stack');

        this.stack=[];

        const context=ESONValue.substring(3).split(/(?<!\\),/g);
        if(context[0]=='n');
            this.stack.push('No trace');

        this.stack.push(...context);
    }

    rawValue;
    stack;
}


/**@param {string} ESONValue */
const eval=(ESONValue)=>{
    if(ESONValue[0]!='$') return ESONValue;

    if(ESONValue[1]=='E')
        return new ESONError(ESONValue);
    else if(ESONValue[1]=='S')
        return new ESONErrorStack(ESONValue);

    return ESONValue;
}


/**@param {Record<string,string|object|array>} obj */
const evalAll=(obj,allowOverwrite=false)=>{
    /**@type {Record<string,string>} actually not but to trick IntelliSense*/
    const pObj=allowOverwrite? obj:ESON.cloneObj(obj);

    for(objKey in pObj){
        if(pObj[objKey] instanceof Array || pObj[objKey] instanceof Object)
            evalAll(pObj[objKey],true); //overwrites so replacing pObj value is not required

        if(typeof pObj[objKey] !='string') continue;

        pObj[objKey]=eval(pObj[objKey]);
    }

    return pObj;
}



module.exports={
    evalAll,
    eval
}