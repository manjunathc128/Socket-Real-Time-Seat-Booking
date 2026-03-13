const fs = require('fs');
const crypto = require('crypto');

setTimeout(() => console.log("timer 1 finished "), 0);

const start = Date.now()
process.env.UV_THREADPOOL_SIZE = 1
console.log(process.env.UV_THREADPOOL_SIZE, 'libuv thread pool size')
// since we are using async callback fs.readfile we are not blocking node single thread instead we are using eventloop exist inside nodesinglethread  for async code execution
fs.readFile('./ErrorsLog.txt', () => {
    console.log('I/O pooling phase of current tick completed of eventloop')
    console.log('------------')

    setTimeout(() => console.log("Timer 2 finished"), 0);
    setTimeout(() => console.log("Timer 3 finished"), 2000);
    setImmediate(() => console.log("Immediate callback executed once per one entire event loop cycle/tick, not immediately executed when it encountered on code"))
    process.nextTick(() => console.log('Process.nextTick , executed immediately after each phase of event loop, when encountered on code executed after current phase functions of callbacks are finished execution on  event loop '));

    crypto.pbkdf2('manju@123', "jksj", 100000, 1024, 'sha512', () => {
        console.log('1 async encryption operation completed')
        console.log(Date.now() - start)

    })
    crypto.pbkdf2('manju@', "jksj", 100000, 1024, 'sha512', () => {
        console.log('2 async encryption operation completed')
        console.log(Date.now() - start)

    })
})  

// top level code , not part of callback executed outside evenloop whithin single thread of node js process
console.log("Hello form top level code , we dont know anything about eventloop and its phases of code execution")