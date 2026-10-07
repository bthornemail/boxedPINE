
import { toString } from 'node:ffi';

function a() {
  b();
}

function b() {
  c();
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  const error = new Error();
  Error.stackTraceLimit = stackTraceLimit;

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b); // Neither function c, nor b is included in the stack trace
  throw error;
}

a();
const cause = new Error('The remote HTTP server responded with a 500 status');
const symptom = new Error('The message failed to send', { cause });

console.log(symptom);
// Prints:
//   Error: The message failed to send
//       at REPL2:1:17
//       at Script.runInThisContext (node:vm:130:12)
//       ... 7 lines matching cause stack trace ...
//       at [_line] [as _line] (node:internal/readline/interface:886:18) {
//     [cause]: Error: The remote HTTP server responded with a 500 status
//         at REPL1:1:15
//         at Script.runInThisContext (node:vm:130:12)
//         at REPLServer.defaultEval (node:repl:574:29)
//         at bound (node:domain:426:15)
//         at REPLServer.runBound [as eval] (node:domain:437:12)
//         at REPLServer.onLine (node:repl:902:10)
//         at REPLServer.emit (node:events:549:35)
//         at REPLServer.emit (node:domain:482:12)
//         at [_onLine] [as _onLine] (node:internal/readline/interface:425:12)
//         at [_line] [as _line] (node:internal/readline/interface:886:18)
import { DynamicLibrary, suffix } from 'node:ffi';

const lib = new DynamicLibrary(`./mylib.${suffix}`);
const add = lib.getFunction('add_i32', {
  arguments: ['int32', 'int32'],
  return: 'int32',
});

console.log(add(20, 22));
console.log(add.pointer);
import { DynamicLibrary, suffix } from 'node:ffi';

const lib = new DynamicLibrary(`./mylib.${suffix}`);

const callback = lib.registerCallback(
  { arguments: ['int32'], return: 'int32' },
  (value) => value * 2,
);
import { getInt32, setInt32 } from 'node:ffi';

setInt32(ptr, 0, 42);
console.log(getInt32(ptr, 0));

const value = toString(ptr);
ffi.getCurrentEventLoop()
console.log(getInt32(ptr, 0));