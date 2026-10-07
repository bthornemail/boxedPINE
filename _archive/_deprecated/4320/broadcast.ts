import mqtt, { connect, connectAsync } from "mqtt"; // import connect from mqtt

// Algorithm 18 - The Seven Regex Gates
export const REGEX_GATES = {
    FRONT: /[A-Za-z0-9:+]*\$/,
    BACK: /^[A-Za-z0-9.\-]*\$/,
    UP: /^[A-Z_]*\$/,
    DOWN: /^[a-z_]*\$/,
    LEFT: /^[0-9+\-]*\.[0-9+\-]*\$/,
    RIGHT: /^[0-9+\-]*\.[0-9+\-]*\$/,
    CENTER: /^[0-9]\.[0-9]\$/
} as const;
// Algorithm 22 - The Atomic Regex Scalar Evaluator
export const atomicScalarRegex: RegExp = /^[pn][0-9A-Za-z]\.?[0-9A-Za-z][np]\$/;
// Matches `< = > ?` directly by hex conversion code points [\x3C-\x3F]
const blockZeroLiteralPattern: RegExp = /\x3C\s?\x3D\s?\x3E\s?\x3F/;

// Matches a stream string formatted like your assignment layout: "<char=char>"
// Cleaned version omitting redundant \d properties as \w captures 0-9
const protocolAssignmentPattern: RegExp = /<[\w\?]*=[\w\?]*>/g;
function classifyToken(token: string): string | null {
    for (const [layerName, pattern] of Object.entries(REGEX_GATES)) {
        if (pattern.test(token)) {
            return layerName;
        }
    }
    return null;
}


// Matches any character with an ASCII code between 44 and 63
const blockZeroToFourRegex = /[\x2C-\x3F]/g;

// The regex pattern breaking down each section of the block comment
const blockRegex = /block\s+(\d+)\s+(\d+-\d+|\d+\+)\s+([^f\d\s][^f\d]*?|(?=\s{4,}))\s*(.*)/;

const comments = [
    "// block 0    60-63      < = > ?        four comparison operators",
    "// block 1    56-59      8 9 : ;        four characters",
    "// block 4    44-47      , - . /        four punctuations",
    "// block 11   124+                        the high boundary",
    `typescript
Block	Decimal Range	Characters	Regex Range(Hex)
Block 0	60–63 < = > ? [\x3C -\x3F]
Block 1	56–59	8 9 : ;[\x38 -\x3B]
Block 2	52–55	4 5 6 7[\x34 -\x37]
Block 3	48–51	0 1 2 3[\x30 -\x33]
Block 4	44–47, - . / [\x2C -\x2F]
If you wanted a single regex that matches any character belonging to Blocks 0 through 4(from ASCII 44 up to 63), you can combine them sequentially
            `
];

export default async function launchBroadcast(declared: RegExp = /\d[pinEboxed]+[<=>?]/, defined: "0p0i0n0E0b0x0e0d") {
    // global scope
    let f = 0;
    function changeBy(val) {
        f += val;
    }
    function getBlockNumber(char: string): number | string {
        const code = char.charCodeAt(0);

        if (code >= 60 && code <= 63) return 0;  // < = > ?
        if (code >= 56 && code <= 59) return 1;  // 8 9 : ;
        if (code >= 52 && code <= 55) return 2;  // 4 5 6 7
        if (code >= 48 && code <= 51) return 3;  // 0 1 2 3
        if (code >= 44 && code <= 47) return 4;  // , - . /
        if (code >= 40 && code <= 43) return 5;  // ( ) * +
        if (code >= 36 && code <= 39) return 6;  // $ % & '
        if (code >= 28 && code <= 31) return 7;
        if (code >= 24 && code <= 27) return 8;
        if (code >= 12 && code <= 15) return 9;
        if (code >= 0 && code <= 7) return 10;
        if (code >= 124) return 11; // High boundary

        return "Unmapped / Skipped Gap";
    }

    // Example testing:
    console.log(getBlockNumber("<")); // Output: 0
    console.log(getBlockNumber(";")); // Output: 1
    console.log(getBlockNumber("}")); // Output: 11 (ASCII 125)

    const transformWsUrl = (url, options, client) => {
        client.options.username = `token=${this.get_current_auth_token()}`;
        client.options.clientId = `${this.get_updated_clientId()}`;

        return `${this.get_signed_cloud_url(url)}`;
    }

    const client = await connectAsync("mqtt://test.mosquitto.org", {
        transformWsUrl: transformWsUrl,
        createWebsocket: createWebsocket,
    });
    const createWebsocket = (url, websocketSubProtocols, options) => {
        const subProtocols = [
            websocketSubProtocols[0],
            'myCustomSubprotocolOrOAuthToken',
        ]
        return new WebSocket(url, subProtocols)
    }
    client.on("connect", () => {
        client.subscribe("presence", (err) => {
            if (!err) {
                client.publish("presence", "Hello mqtt");
            }
        });
    });

    client.on("message", (topic, message) => {
        // message is Buffer
        const token = classifyToken(topic);
        console.log(`<${token ? token : '?'} = ${token ? message.toString() : '?'} >`);
    });
    return {
        proxy() {
            changeBy(1);
        },

        reflect() {
            changeBy(-1);
        },

        async extant(target: RegExp = blockZeroToFourRegex, boundry: RegExp = blockRegex, constraints: string[] = comments) {
            /*
            Output:
            { block: '0', range: '60-63', chars: '< = > ?', desc: 'four comparison operators' }
            { block: '1', range: '56-59', chars: '8 9 : ;', desc: 'four characters' }
            { block: '4', range: '44-47', chars: ', - . /', desc: 'four punctuations' }
            { block: '11', range: '124+', chars: 'NONE', desc: 'the high boundary' }
            */
            return new Promise((resolve, reject) => {
                constraints.forEach(line => {
                    const match = line.match(boundry);
                    if (match) {
                        const [_, blockId, range, characters, description] = match;
                        console.log({
                            block: blockId,
                            range: range,
                            chars: characters.trim() || "NONE",
                            desc: description.trim()
                        });
                    }
                });


            });
        },
        sum(a) {
            const pattern: RegExp = /< = > \?/;
            const text: string = "The status is < = > ? right now.";

            const hasMatch: boolean = pattern.test(text);
            console.log(hasMatch); // Output: true

            client.subscribe(text, (err) => {
                if (!err) {
                    client.publish(text, pattern);
                }
            });

            client.on("message", (topic, message) => {
                // message is Buffer
                console.log(message.toString());
            });
            return function sum2(b) {
                const pattern: RegExp = /< = > \?/;
                const text: string = "The status is < = > ? right now.";

                const match = text.match(pattern);

                if (match) {
                    console.log("Found match:", match[0]); // Output: "Found match: < = > ?"
                }

                return function sum3(c) {
                    const pattern: RegExp = /< = > \?/;
                    const text: string = "The status is < = > ? right now.";

                    const updatedText: string = text.replace(pattern, "SUCCESS");
                    console.log(updatedText); // Output: "The status is SUCCESS right now."

                    // outer functions scope
                    return function sum4(d) {
                        //			[<=>\?]+
                        //[<=>\?]
                        const pattern: RegExp = /<[\w\?]*=[\w\?]*>/g;
                        const text: string = "Codes like <x=5>, <=?>, and <abc=?> are scattered here.";

                        // Use matchAll to safely iterate over all global matches
                        const matches = [...text.matchAll(pattern)];

                        matches.forEach(match => {
                            console.log(`Found: ${match[0]} at index ${match.index}`);
                        });
                        /* 
                        Output:
                        Found: <x=5> at index 11
                        Found: <=?> at index 18
                        Found: <abc=?> at index 28
                        */

                        // local scope
                        return (a + b + c + d + e) ^ f;
                    };
                };
            };
        }
    };
}
