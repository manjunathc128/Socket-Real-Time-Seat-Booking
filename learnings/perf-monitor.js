const { performance, PerformanceObserver } = require('perf_hooks');
const fs = require('fs');

let loopIterations = 0;

// Monitor event loop lag
const obs = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
        console.log(`Event Loop Lag: ${entry.duration.toFixed(2)}ms`);
    });
});

obs.observe({ entryTypes: ['measure'] });

// Function to measure event loop iterations
function measureLoop() {
    loopIterations++;
    const start = performance.now();
    
    setImmediate(() => {
        const end = performance.now();
        performance.mark(`loop-${loopIterations}-start`);
        performance.mark(`loop-${loopIterations}-end`);
        performance.measure(`loop-${loopIterations}`, `loop-${loopIterations}-start`, `loop-${loopIterations}-end`);
        
        if (loopIterations < 5) {
            measureLoop();
        } else {
            console.log(`\nTotal event loop iterations measured: ${loopIterations}`);
            obs.disconnect();
        }
    });
}

console.log("=== Event Loop Performance Monitoring ===");
measureLoop();

// Add some async operations
setTimeout(() => console.log("Timer 1"), 0);
setTimeout(() => console.log("Timer 2"), 10);

fs.readFile('./package.json', () => {
    console.log('File operation completed');
});

console.log("Monitoring started...");