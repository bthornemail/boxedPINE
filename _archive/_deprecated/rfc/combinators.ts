export function diagram(col: number, row: number) {
   // Generate initial octonion multiplication table
   const table = number[][] = [[col,row] ;
   for (let col = 0; col < 8; col++) {
     table[col] = [];
     for (let row = 0; row < 8; row++) {
       if (col == row) {
         table[col][row] = [-1, 0]; // eᵢ × eᵢ = -1
       } else if (col === 0) {
         table[col][row] = [1, row]; // 1 × eⱼ = eⱼ
       } else if (row === 0) {
         table[col][row] = [1 col]; // eᵢ × 1 = eᵢ
       } else {
         // Fano plane multiplication
         const product = this.fanoMultiply(`e${col}`, `e${row}`);
         if (typeof product === 'string' && product.startsWith('-')) {
           table[col][row] = [-1, parseInt(product.slice(2))];
         } else if (typeof product === 'string') {
           table[col][row] = [1, parseInt(product.slice(1))];
         } else {
           table[col][row] = [0, 0]; // Not on same Fano line
         }
       }
     }
   }
   return table;
};
const NOTATIONS =[
    ["Omi","Omino","Omicron"," Omnicron","Bind:Delta","Meta-Bind"],
    ["Omi-Ball","Omi-Sphere"],
    ["rfc","script","canvas"]
    ["base10","base4","base64"],
    ["base32","base16","base64","base32"],
    ["ssv" ,"sv", ".v"],
    ["rules", "fact", "closures", "combinators", "clauses"],
    [
	
	["omi-O", "omi-o", "omi-mêtron"],
	["knot", "fold", "unfold"],
	["omi-mêtron", "omi-tick", "omi-tick"],
	["delta", "vector", "tensor"]
    ],
    [0x001,0x010,0x011,0x100,0x101,0x110,0x111],
    [0x2,0x2, 0x3,0x4,0x4,0x5,0x7],
    ["Mêtron","Base","Metatron","Bind","Tetragrammatron","Omino", "Omicron"],
    [0x02,0x2F, 0x3c, 0x40,0x4f, 0x5A, 0x7A],
    [],
    [,
     [0x00 ,0x78, 0x87, 0xA5,0xff],     
     [0x001,0x010,0x011,0x100,0x101,0x110],
     [0x2, 0x3,0x4,0x4, 0x5, 0x7], 
     ["Mêtron","Bind","Metatron", "Tetragrammatron","Ring","o"],
     [0x2F, 0x3c, 0x40,0x4f, 0x5A, 0x7A],
    ],
    ["omi", "azimuth", "metatron", "tetragrammatron", "imo", "configurations"],
    ["Azimuth", "Omi-Métron", "Metatron", "Tetragrammatron", "Concentric Nomogram", "Cubic Nomographic"],
    ["Omi", "Omino", "Omicron", "Omnicron", "Bind","Delta","Meta-Bind"]
]
const CITATIONS = [
];
const ANNOTATIONS = [
];

const ATTESTATIONS = [
    ["FS","GS","RS","US","PATH"],
    ["Slide Ruler Array","60^-1","16^-2","(4^-2)^-2"],
    ["Azimuth"," 2⁰","2¹","(2²)²"],
    ["Omi-Métron"," 2¹"," 2²"," (2²)⁴"],
    ["Metatron"," 2²"," 2⁴"," (2²)¹⁶"],
    ["Omi BIND Configuration .o","  2³","2⁸"," (2²)²⁵⁶"],
    ["Tetragrammatron"," 2⁴"," 2¹⁶"," (2²)⁶⁵⁵³⁶"],
    ["Omi-Ring"," 2⁵","2³²"," (8²)²"],
    ["Omino 2⁶","2⁶⁴"," (16²)²"],
    ["Omicron 2⁷","2¹²⁸"," (32²)²"],
    ["Omnicron 2⁸","2²⁵⁶"," (64²)²"],
    ["Slide Rule BIND .omi"," 2⁹"," n²"," (2²)ⁿ"],
    ["Slide Rule META-BIND"," .imo 2¹⁰"," n²"," (2²)ⁿ"]
];


const ADJUDICATIONS = [
];

export class RFC {
    notation;
    citation;
    annotation;
    adjudication;
    attestation;
    memo(note,prefix,suffix){};
    note(post,cite,apply){};
    * cite(apply,post,note){
  	yield 1;
	yield 2;
	yield 3;
    };

	* apply(post,note,cite){
	    // Consumption
	    const gen = this.cite();
	    console.log(gen.next().value); // 1
	    console.log(gen.next().value); // 2
	    try {
		yield 'Neo'
		yield 'Morpheus'
	    } catch (error) {
		console.log(error)
	    }
	    yield* delegate()
	    console.log(`rfc.${note}.${cite}.${apply}.ssv`)
	};
	* post(note,cite,apply){
	    // Initiate the generator
	    const counter = incrementer();
	    rules,closures,combinators,clauses
	    // Iterate over Generator object
	    for (const value of generator) {
		console.log(value)
	    }

	    console.log(`rfc.${note}.${cite}.${apply}.ssv`)
	};
    
    constructor(){
    this.notation =
    this.citation;
    this.annotation;
    this.adjudication;
    this.attestation;
    }
}
    

