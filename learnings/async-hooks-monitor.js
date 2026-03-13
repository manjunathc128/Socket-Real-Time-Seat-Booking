const async_hooks = require('async_hooks');
const fs = require('fs');

let asyncOperations = 0;
let completedOperations = 0;

// Track async operations
const hook = async_hooks.createHook({
    init(asyncId, type, triggerAsyncId) {
        asyncOperations++;
        console.log(`[INIT] AsyncId: ${asyncId}, Type: ${type}, Operations: ${asyncOperations}`);
    },
    destroy(asyncId) {
        completedOperations++;
        console.log(`[DESTROY] AsyncId: ${asyncId}, Completed: ${completedOperations}`);
    }
});

hook.enable();

console.log("=== Starting Event Loop Monitoring ===");

setTimeout(() => {
    console.log("Timer executed");
}, 0);

fs.readFile('./package.json', () => {
    console.log('File read completed');
    
    setImmediate(() => {
        console.log("Immediate executed");
        
        // Disable hook and show summary
        setTimeout(() => {
            hook.disable();
            console.log("\n=== Event Loop Summary ===");
            console.log(`Total async operations initiated: ${asyncOperations}`);
            console.log(`Total async operations completed: ${completedOperations}`);
        }, 100);
    });
});

console.log("Top level code finished");