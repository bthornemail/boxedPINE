import RFC from "./rfc";

export type XX = string;
export type OO = number;

export type NULL = [OO, OO];
export type DELTA = [XX, OO]
export type METER = [OO, XX];
export type XOR = [OO, OO];

export type OX = [NULL, METER, DELTA, XOR];
export type XO = [NULL, DELTA, METER, XOR];

export type NOMOGRAM = [SVGElement, SVGElement];
export type NOMOGRAPH = [SVGElement, SVGElement, SVGElement, SVGElement];

export type OMINO = [CanvasRenderingContext2D, CanvasRenderingContext2D];
export type OMICRON = [CanvasRenderingContext2D, CanvasRenderingContext2D];
export type OMNICRON = [CanvasRenderingContext2D, CanvasRenderingContext2D, CanvasRenderingContext2D, CanvasRenderingContext2D];

export type OMI = [HTMLTableElement, HTMLTableElement, HTMLTableElement, HTMLTableElement];
export type IMO = [HTMLTableCellElement, HTMLTableCellElement, HTMLTableCellElement, HTMLTableCellElement];

export type OXO = HTMLInputElement;
export type XOX = HTMLElement;
export type XXX = HTMLButtonElement;

interface TRACE {
    type: 'BIND' | 'MOVE' | 'DIGEST' | 'VIEW';
    delta: OXO | XOX | [OXO, XOX] | [XOX, OXO];
}


// 2. Extend the global window interface
declare global {
    interface WindowEventMap {
	"app:op": CustomEvent<TRACE>;
    }
}

export default class OMIII {
    graph: Map<[OO, XX, OO, XX], [XX, OO, XX, OO]> = new Map();
    nomograph: NOMOGRAPH;
    omnicron: OMNICRON;
    xox: XOX;
    oxo: OXO;
    rfc: RFC;
    xxx: XXX;
    draw() {

    }
    constructor() {
	this.rfc = new RFC("0x78", 0o0);
	this.oxo = document.createElement('input');
	this.xox = document.createElement('div');
	this.xxx = document.createElement('button');

	this.oxo.addEventListener('click', () => this.rfc.print())
	// this.gram = new Array(omnicron.length).fill(null).map(() => new Array(omnicron.length).fill(null));
	this.graph = new Map();
	this.graph.set([0x00, "NULL", 0x00, "NULL"], ["NULL", 0x00, "NULL", 0x00]);
	this.graph.set([0x00, "NULL", 0x00, "NULL"], ["NULL", 0x00, "NULL", 0x00]);
	this.graph.set([0x00, "NULL", 0x00, "NULL"], ["NULL", 0x00, "NULL", 0x00]);
	this.graph.set([0x00, "NULL", 0x00, "NULL"], ["NULL", 0x00, "NULL", 0x00]);
	this.graph.set([0x00, "NULL", 0x00, "NULL"], ["NULL", 0x00, "NULL", 0x00]);

    }

}
const net = require('node:net');
export default class OMIIIAPP {
    init(
	const client = net.createConnection({ port: 8124 }, () => {
	    onread: {
		// Reuses a 4KiB Buffer for every read from the socket.
		buffer: Buffer.alloc(4 * 1024),
		callback: function(nread, buf) {
		    // Received data is available in `buf` from 0 to `nread`.
		    console.log(buf.toString('utf8', 0, nread));
		},
	    }  // 'connect' listener.
	    console.log('connected to server!');
	    client.write('world!\r\n');
	});

	client.on('data', (data) => {
	    console.log(data.toString());
	    //  client.end();
	});
	client.on('end', () => {
	    console.log('disconnected from server');
	});
    }
    


export const getUsers = asyncAlt(function* () {
  const response = yield fetch('https://jsonplaceholder.typicode.com/users')
  const json = yield response.json()

  return json
});

// Define a function named asyncAlt that takes a generator function as an argument
function asyncAlt(generatorFunction) {
  // Return a function
  return function () {
    // Create and assign the generator object
    const generator = generatorFunction()

    // Define a function that accepts the next iteration of the generator
    function resolve(next) {
      // If the generator is closed and there are no more values to yield,
      // resolve the last value
      if (next.done) {
        return Promise.resolve(next.value)
      }

      // If there are still values to yield, they are promises and
      // must be resolved.
      return Promise.resolve(next.value).then((response) => {
        return resolve(generator.next(response))
      })
    }

    // Begin resolving promises
    return resolve(generator.next())
  }
}

// Invoking the function
getUsers().then((response) => console.log(response))

export function* call(port,prefix,suffix){
    let prev = 0
    let next = 1

    yield prev
    yield next

    // Add previous and next values and yield them forever
    while (true) {
	const newVal = next + prev

	yield newVal

	prev = next
	next = newVal
    }
}
export function* record(port,prefix,suffix){
const net = require('node:net');
const client = net.createConnection({ port: 8124 }, () => {
  onread: {
    // Reuses a 4KiB Buffer for every read from the socket.
    buffer: Buffer.alloc(4 * 1024),
    callback: function(nread, buf) {
      // Received data is available in `buf` from 0 to `nread`.
      console.log(buf.toString('utf8', 0, nread));
    },
  }  // 'connect' listener.
  console.log('connected to server!');
  client.write('world!\r\n');
});

client.on('data', (data) => {
  console.log(data.toString());
//  client.end();
});
client.on('end', () => {
  console.log('disconnected from server');
});
}

  let i = 0

  while (true) {
    yield i++
  }    
}
