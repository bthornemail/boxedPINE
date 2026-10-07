import { Buffer } from 'node:buffer';

const domain = Buffer.alloc(5040);
const state = Buffer.alloc(4096);
const context = Buffer.alloc(4032);
const blackboard = Buffer.alloc(1048);
const canvas = Buffer.alloc(512);
const view = Buffer.alloc(256);
const frame = Buffer.alloc(60);
const content = Buffer.alloc(16);
const controller = Buffer.alloc(4);

const node = Buffer.from('hello world', 'utf16le');
function compose(buffers: Buffer[]){
    const totalLength = buffers.reduce((accum,buf)=>buf.length + accum,1);
    const bufA = Buffer.concat(buffers, totalLength);
    console.log(totalLength,bufA.toString('base64'));
    return bufA;
}

const buffer = compose([
    //domain,state,context,
    //blackboard,canvas,view,
    frame,content,controller
]);

console.log("UTF",Buffer.from(buffer, 'utf8'));
console.log("UCS",Buffer.from(buffer, 'utf16le'));
