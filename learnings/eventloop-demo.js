const fs = require('fs');
const crypto = require('crypto');

console.log('=== Event Loop Phase Demonstration ===\n');

// Create a file to read (if it doesn't exist)
if (!fs.existsSync('./test.txt')) {
    fs.writeFileSync('./test.txt', 'test data');
}

const start = Date.now();

console.log('1. 🚀 SYNCHRONOUS CODE (Main Thread)');

// Schedule different types of callbacks
setTimeout(() => console.log('4. ⏰ TIMER PHASE: setTimeout 0ms'), 0);
setTimeout(() => console.log('8. ⏰ TIMER PHASE: setTimeout 100ms'), 100);

setImmediate(() => console.log('6. ✅ CHECK PHASE: setImmediate'));

process.nextTick(() => console.log('2. 🔥 NEXT TICK: After sync code'));

Promise.resolve().then(() => console.log('3. 🎯 MICROTASK: Promise'));

// I/O operation - will execute in POLL phase
fs.readFile('./test.txt', (err) => {
    console.log('5. 📁 POLL PHASE: fs.readFile callback');
    
    // These are scheduled INSIDE the I/O callback
    setTimeout(() => console.log('10. ⏰ TIMER PHASE: setTimeout in I/O (next cycle)'), 0);
    
    setImmediate(() => console.log('7. ✅ CHECK PHASE: setImmediate in I/O (same cycle)'));
    
    process.nextTick(() => console.log('   🔥 NEXT TICK: Inside I/O callback (runs immediately after this phase)'));
    
    Promise.resolve().then(() => console.log('   🎯 MICROTASK: Promise in I/O callback'));
    
    // CPU-intensive operation - uses thread pool
    crypto.pbkdf2('test', 'salt', 1000, 64, 'sha512', () => {
        console.log('9. 🔐 THREAD POOL: Crypto operation completed');
        console.log(`   ⏱️  Total time: ${Date.now() - start}ms\n`);
        
        console.log('=== Execution Order Explanation ===');
        console.log('1. Synchronous code runs first (main thread)');
        console.log('2. process.nextTick() - highest priority between phases');
        console.log('3. Microtasks (Promises) - after nextTick, before next phase');
        console.log('4. Timer phase - setTimeout/setInterval callbacks');
        console.log('5. Poll phase - I/O callbacks (fs.readFile)');
        console.log('6. Check phase - setImmediate callbacks');
        console.log('7. setImmediate in I/O runs in same cycle (Check phase)');
        console.log('8. Timer with 100ms delay');
        console.log('9. Thread pool operations (crypto) - separate from event loop');
        console.log('10. setTimeout from I/O callback runs in next cycle');
    });
});

console.log('   📝 End of synchronous code\n');