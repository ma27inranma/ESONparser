const ESON = require("../ESON");

const string = "{item=minecraft:diamond_sword, name=Cool Sword, amount=3}";

const object = ESON.parse(string);

console.log(JSON.stringify(object));