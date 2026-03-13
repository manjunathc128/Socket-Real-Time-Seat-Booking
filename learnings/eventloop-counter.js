const fs = require('fs');
const crypto = require('crypto');

let tickCount = 0;

// Function to count ticks
function countTick() {
    tickCount++;
    console.log(`Event Loop Tick: ${tickCount}`);
    
    // Schedule next tick counter (this will run after each phase)
    if (tickCount < 20) { // Limit to prevent infinite loop
        process.nextTick(countTick);
    }
}

// Start counting
process.nextTick(countTick);

setTimeout(() => {
    console.log("Timer 1 finished");
}, 0);

const start = Date.now();

fs.readFile('./package.json', (err) => {
    console.log('I/O operation completed');
    
    setTimeout(() => console.log("Timer 2 finished"), 0);
    setTimeout(() => console.log("Timer 3 finished"), 100);
    
    setImmediate(() => {
        console.log("Immediate callback executed");
    });
    
    process.nextTick(() => {
        console.log('Process.nextTick in I/O callback');
    });
    
    crypto.pbkdf2('test', "salt", 1000, 64, 'sha512', () => {
        console.log('Crypto operation completed');
        console.log(`Total execution time: ${Date.now() - start}ms`);
        console.log(`Final tick count: ${tickCount}`);
    });
});

console.log("Top level code executed");