
import http from 'node:http';
import repl, { REPLServer } from 'node:repl';
import defineCommands, { myEval, myWriter, isRecoverableError } from './define.commands';
// import node from './node';
// const garden = node("genesis-node");
// const adam = node("atom-node");
// const eve = node("eve-node");

// console.log(garden(2)); // 7
// console.log(adam(2)); // 12
// console.log(eve("beginning"));

let p: number = 0,
    i: number = 0,
    n: number = 0,
    E: number = 0,
    b: number = 0,
    o: number = 0,
    x: number = 0,
    e: number = 0,
    d: number = 0;
const colors = {
    "celeste": 0xB2FFFF,
    "celeste polvere": 0xE6FFFF,
    "celeste pallido": 0xCCFFFF,
    "celeste velato": 0xCCE6E6,
    "celeste opaco": 0x80CCCC
}

let replServer: REPLServer | null = null;
const server = http
    .createServer((request, response) => {
        response.setHeader('content-type', 'multipart/octet-stream');
        replServer = repl.start({
            prompt: 'curl repl> ',
            input: request,
            output: response,
            terminal: false,
            useColors: true,
            useGlobal: false,
            eval: myEval,
            writer: myWriter
        });
        defineCommands(replServer, replServer.context);
        replServer.on('reset', () => defineCommands(replServer!, replServer!.context));
    });
server.listen(3000, () => {
    console.log("Server running at http://127.0.0.1:3000/");
});
const sse = http
    .createServer((request, response) => {
        console.log(`Request url: ${request.url}`);

        const eventHistory = [];

        request.on("close", () => {
            if (!response.finished) {
                response.end();
                console.log("Stopped sending events.");
            }
        });

        if (request.url?.toLowerCase() === "/events") {
            response.writeHead(200, {
                Connection: "keep-alive",
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*"
            });

            checkConnectionToRestore(request, response, eventHistory);

            sendEvents(response, eventHistory);
        } else {
            response.writeHead(404);
            response.end();
        }
    });
sse.listen(8000, () => {
    console.log("Server running at http://127.0.0.1:8000/");
});
const replCli = repl.start({
    prompt: 'Node.js via stdin> ',
    useGlobal: true,
    input: process.stdin,
    output: process.stdout,
    eval: myEval,
    writer: myWriter
});
defineCommands(replCli, replCli.context);
replCli.on('reset', () => defineCommands(replCli, replCli.context));


function sendEvents(response, eventHistory) {
    setTimeout(() => {
        if (!response.finished) {
            const eventString =
                'id: 1\nevent: flightStateUpdate\ndata: {"flight": "I768", "state": "landing"}\n\n';
            response.write(eventString);
            eventHistory.push(eventString);
        }
    }, 3000);

    setTimeout(() => {
        if (!response.finished) {
            const eventString =
                'id: 2\nevent: flightStateUpdate\ndata: {"flight": "I768", "state": "landed"}\n\n';
            response.write(eventString);
            eventHistory.push(eventString);
        }
    }, 6000);

    setTimeout(() => {
        if (!response.finished) {
            const eventString = `id: 3\nevent: flightRemoval\ndata: {"flight": "I768"}\n\n`;
            response.write(eventString);
            eventHistory.push(eventString);
        }
    }, 9000);

    setTimeout(() => {
        if (!response.finished) {
            const eventString = "id: 4\nevent: closedConnection\ndata: \n\n";
            eventHistory.push(eventString);
        }
    }, 12000);
}

function checkConnectionToRestore(request, response, eventHistory) {
    if (request.headers["last-event-id"]) {
        const eventId = parseInt(request.headers["last-event-id"]);

        const eventsToReSend = eventHistory.filter(e => e.id > eventId);

        eventsToReSend.forEach(e => {
            if (!response.finished) {
                response.write(e);
            }
        });
    }
}