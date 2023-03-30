/**
 * An intrinsic object that provides functions to convert JavaScript values to and from the Easy JSON (ESON) format.
 */
var ESON = {
    /**
     * Converts a Easy JSON (ESON) string into an object.
     * @param {string} text A valid ESON string.
     * @returns {any} 
     */
    parse: (text) => parser.parse(text),
    /**
     * Converts a JavaScript value to a Easy JSON (ESON) string.
     * @param {any} value A JavaScript value, usually an object or array, to be converted.
     * @returns {string}
     */
    stringify: (value) => parser.stringify(value)
}


module.exports = ESON
// export default ESON


const parser = {
    getChildren: function(eson = '') {
        eson = eson.trimStart();
        let obj = {};
        while (true) {
            if (eson.startsWith('}') || eson.startsWith(']')) {
                eson = eson.substring(1).trimStart();
                if (eson.startsWith(',')) {
                    eson = eson.substring(1).trimStart();
                }
                return [obj, eson];
            }
            if (eson.startsWith('[')) {
                //array
                let array = [];
                eson = eson.substring(1);
                while (true) {
                    eson = eson.trimStart();
                    if (eson.startsWith(']')) {
                        //stop
                        return [array, eson];
                    }
                    const commaPos = eson.indexOf(',');
                    if (commaPos == -1 || commaPos > eson.indexOf(']')) {
                        const tempEson = eson.substring(0, eson.indexOf(']')) + ',';
                        eson = tempEson + eson.substring(eson.indexOf(']'));
                    }
                    if (eson.startsWith("'")) {
                        eson = eson.substring(1);
                        const value = eson.substring(0, eson.indexOf("'")).replace(/\^\^\^\^\^\[QUOTE\]\^\^\^\^\^/g, "'");
                        eson = eson.substring(eson.indexOf("'") + 1);
                        array.push(value);
                    } else if (eson.startsWith("{")) {
                        eson = eson.substring(1);
                        const tempEson = this.getChildren(eson);
                        eson = tempEson[1];
                        array.push(tempEson[0]);
                    } else if (eson.startsWith("[")) {
                        eson = eson.substring(1);
                        const tempEson = this.getChildren(eson);
                        eson = tempEson[1];
                        array.push(tempEson[0]);
                    } else {
                        const value = eson.substring(0, eson.indexOf(',')).trimEnd().replace(/\^\^\^\^\^\[QUOTE\]\^\^\^\^\^/g, "'");
                        eson = eson.substring(eson.indexOf(',') + 1);
                        array.push(value);
                    }
                }
            }
            if (!eson.includes('=')) {
                throw new Error('Invalid ESON format. Current progress: ' + eson);
            }
            const currentObjName = eson.substring(0, eson.indexOf('=')).trimEnd();
            eson = eson.substring(eson.indexOf('=') + 1).trimStart();
            const commaPos = eson.indexOf(',');
            if (commaPos == -1) {
                const tempEson = eson.substring(0, eson.indexOf('}')) + ',';
                eson = tempEson + eson.substring(eson.indexOf('}'));
            }
            if (eson.indexOf('}') < commaPos) {
                const tempEson = eson.substring(0, eson.indexOf('}')) + ',';
                eson = tempEson + eson.substring(eson.indexOf('}'));
            }
            if (eson.startsWith("'")) {
                eson = eson.substring(1);
                const value = eson.substring(0, eson.indexOf("'")).replace(/\^\^\^\^\^\[QUOTE\]\^\^\^\^\^/g, "'");
                eson = eson.substring(eson.indexOf("'") + 1).trimStart();
                if (eson.startsWith(',')) {
                    eson = eson.substring(1).trimStart();
                };
                Object.assign(obj, {
                    [currentObjName]: value
                });
            } else if (eson.startsWith("{")) {
                eson = eson.substring(1);
                const tempEson = this.getChildren(eson);
                eson = tempEson[1];
                Object.assign(obj, {
                    [currentObjName]: tempEson[0]
                });
            } else if (eson.startsWith("[")) {
                //array
                const tempEson = this.getChildren(eson);
                eson = tempEson[1];
                Object.assign(obj, {
                    [currentObjName]: tempEson[0]
                });
            } else {
                const value = eson.substring(0, eson.indexOf(',')).trimEnd().replace(/\^\^\^\^\^\[QUOTE\]\^\^\^\^\^/g, "'");
                eson = eson.substring(eson.indexOf(',') + 1).trimStart();
                Object.assign(obj, {
                    [currentObjName]: value
                });
            }
        }
    },
    parse: function(eson = '') {
        let obj = {};
        //anti '
        eson = eson.replace(/\\'/g, '^^^^^[QUOTE]^^^^^');
        while (true) {
            eson = eson.trimStart();
            if (eson.startsWith('}')) {
                eson = eson.substring(1).trimStart();
                if (eson.startsWith(',')) {
                    eson = eson.substring(1).trimStart();
                }
            }
            if (!eson.includes('=')) {
                break;
            }
            if (eson.startsWith('{')) {
                eson = eson.substring(1).trimStart();
                const getChild = this.getChildren(eson);
                Object.assign(obj, getChild[0]);
                eson = getChild[1];
            } else {
                const currentObjName = eson.substring(0, eson.indexOf('='));
                eson = eson.substring(eson.indexOf('=') + 1).trimStart();
                const commaPos = eson.indexOf(',');
                if (commaPos > eson.indexOf('}') || commaPos == -1) {
                    const tempEson = eson.substring(0, eson.indexOf('}')) + ',';
                    eson = tempEson + eson.substring(eson.indexOf('}')).trimStart();
                }
                if (eson.startsWith('{')) {
                    eson = eson.substring(1);
                    const tempEson = this.getChildren(eson);
                    eson = tempEson[1];
                    Object.assign(obj, {
                        [currentObjName]: tempEson[0]
                    });
                    continue;
                }
                const value = eson.substring(0, eson.indexOf(',')).trimEnd();
                eson = eson.substring(eson.indexOf(',') + 1).trimStart();
                Object.assign(obj, {
                    [currentObjName]: value
                });
            }
        };
        return obj;
    },
    strNumToNum: function(obj = {}) {
        Object.entries(obj).forEach(entry => {
            if (entry[1] instanceof Array) {
                obj[entry[0]] = this.strNumToNum(entry[1]);
            } else if (entry[1] instanceof Object) {
                obj[entry[0]] = this.strNumToNum(entry[1]);
            } else if (typeof entry[1] == 'string') {
                const numbered = Number(entry[1]);
                if (isNaN(numbered)) {
                    return;
                } else {
                    obj[entry[0]] = numbered;
                }
            } else {
                throw 'Invalid entry type. entry:' + typeof(entry[1]);
            }
        });
        return obj;
    },
    stringify: function(obj = {}) {
        let stringified = JSON.stringify(obj).replace(/'/g, '\\\'');
        let separated = stringified.split('"');
        let done = '';
        // return stringified.replace(/(\":)/g, '=').replace(/\"/g, '');
        let count = 0;
        while (true) {
            count++;
            if (separated.length < 2) {
                break;
            }
            let type = 0;
            const processing = separated.splice(0, 2);
            if (processing[1].includes(' ') || processing[1].includes(',')) {
                const colonChecker = stringified.substring(stringified.indexOf(processing[1]) + 2 + processing[1].length).substring(0, 5);
                if (colonChecker.startsWith(':')) {
                    //this is objectname
                    stringified = stringified.replace(`"${processing[1]}":`, `'${processing[1]}^^^^^'=`);
                } else {
                    stringified = stringified.replace(`"${processing[1]}"`, `'${processing[1]}^^^^^'`);
                }
                type = 1;
            } else {
                const colonChecker = stringified.substring(stringified.indexOf(`"${processing[1]}"`) + 2 + processing[1].length).substring(0, 5);
                if (colonChecker.startsWith(':')) {
                    //this is object name
                    stringified = stringified.replace(`"${processing[1]}":`, `${processing[1]}^^^^^=`);
                } else {
                    stringified = stringified.replace(`"${processing[1]}"`, processing[1] + '^^^^^');
                }
                type = 2;
            }
        };
        return stringified.replace(/\^\^\^\^\^/g, '');
    }
}