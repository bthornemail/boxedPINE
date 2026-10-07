import repl, { REPLServer, REPLEval } from 'node:repl';
import vm from 'node:vm';

import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';

import { Node, Domain } from './model';
import { Declarations, Expressions } from './constants';

export function myEval(cmd: string, context: REPLServer["context"], filename: string, callback: any): void {
    let result;
    try {
        result = vm.runInThisContext(cmd);
    } catch (e: any) {
        if (isRecoverableError(e)) {
            return callback(new repl.Recoverable(e));
        }
    }
    callback(null, result);
}
export function myWriter(output: string) {
    return output; //.toUpperCase();
}
export function isRecoverableError(error: Error) {
    if (error.name === 'SyntaxError') {
        return /^(Unexpected end of input|Unexpected token)/.test(error.message);
    }
    return false;
}
export default function defineCommands(replServer: REPLServer, buffer: Buffer) {
    replServer.context.Expressions = Expressions;
    replServer.context.Declarations = Declarations;
    const Domains = [new Domain(10)];
    replServer.context.Domains = Domains;
    replServer.defineCommand('open', {
        help: 'Say hello',
        action(command) {
            replServer.clearBufferedCommand();
            let yaml = readFileSync('omi_rosetta_stone.yaml', { start: 0, end: 16 });
            let json = readFileSync('rosetta_stone.json', { start: 0, end: 16 });
            let doc = Buffer.concat([yaml, json]);
            console.log(new TextDecoder().decode(doc))
            replServer.displayPrompt();
        }
    });
    replServer.defineCommand('bind', {
        help: 'Say hello',
        action(name) {
            replServer.clearBufferedCommand();
            console.log(`Hello, ${name}!`);
            replServer.displayPrompt();
        }
    });
    replServer.defineCommand('apply', {
        help: 'Say hello',
        action(name) {
            replServer.clearBufferedCommand();
            console.log(`Hello, ${name}!`);
            replServer.displayPrompt();
        }
    });
    replServer.defineCommand('eval', {
        help: 'Evalutes for presence',
        action(command) {
            replServer.clearBufferedCommand();
            console.log(`Hello, ${command}!`,
                Declarations
                    .map((declare) => declare.test(command) ? declare : null)
                    .filter((regexp) => regexp)
                    .map((definition) => definition.test(command) ? definition.test(new TextDecoder().decode(buffer)) : null)
            );
            replServer.displayPrompt();
        }
    });
    replServer.defineCommand('digest', {
        help: 'Say hello',
        action(name) {
            replServer.clearBufferedCommand();
            console.log(`Hello, ${name}!`);
            replServer.displayPrompt();
        }
    });
    replServer.defineCommand('close', {
        help: 'Say goodbye',
        action() {
            console.log('Goodbye!');
            replServer.close();
        }
    });
}
