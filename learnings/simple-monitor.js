const fs = require('fs');

class EventLoopMonitor {
    constructor() {
        this.phases = {
            timers: 0,
            pending: 0,
            idle: 0,
            poll: 0,
            check: 0,
            close: 0
        };
        this.totalCycles = 0;
    }

    trackPhase(phaseName) {
        this.phases[phaseName]++;
        console.log(`📍 ${phaseName.toUpperCase()} phase executed (${this.phases[phaseName]} times)`);
    }

    trackCycle() {
        this.totalCycles++;
        console.log(`🔄 Event Loop Cycle: ${this.totalCycles}`);
    }

    getSummary() {
        console.log("\n=== Event Loop Summary ===");
        console.log(`Total cycles: ${this.totalCycles}`);
        Object.entries(this.phases).forEach(([phase, count]) => {
            console.log(`${phase}: ${count} executions`);
        });
    }
}

const monitor = new EventLoopMonitor();

// Track different phases
setTimeout(() => {
    monitor.trackPhase('timers');
    monitor.trackCycle();
}, 0);

setImmediate(() => {
    monitor.trackPhase('check');
    monitor.trackCycle();
});

fs.readFile('./package.json', () => {
    monitor.trackPhase('poll');
    monitor.trackCycle();
    
    // Final summary after a delay
    setTimeout(() => {
        monitor.getSummary();
    }, 100);
});

process.nextTick(() => {
    console.log("🚀 Process.nextTick executed (between phases)");
});

console.log("Event loop monitoring started...");