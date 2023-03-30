const ESON = require("../ESON");

const object = {
    "item": "minecraft:diamond_sword",
    "name": "Cool Sword",
    "amount": 3
}

const string = ESON.stringify(object);

console.log(string);