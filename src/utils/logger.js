/**
 * Logging utilities for consistent output formatting
 */

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m'
};

class Logger {
    constructor(prefix = 'TestRigor') {
        this.prefix = prefix;
    }

    /**
     * Log a section header
     */
    header(message) {
        console.log('\n' + '='.repeat(50));
        console.log(`${COLORS.bright}${message}${COLORS.reset}`);
        console.log('='.repeat(50) + '\n');
    }

    /**
     * Log an info message
     */
    info(message) {
        console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${message}`);
    }

    /**
     * Log a success message
     */
    success(message) {
        console.log(`${COLORS.green}✓${COLORS.reset} ${message}`);
    }

    /**
     * Log a warning message
     */
    warn(message) {
        console.log(`${COLORS.yellow}⚠${COLORS.reset} ${message}`);
    }

    /**
     * Log an error message
     */
    error(message) {
        console.log(`${COLORS.red}✗${COLORS.reset} ${message}`);
    }

    /**
     * Log test status with appropriate formatting
     */
    status(statusCode, message) {
        const statusMap = {
            200: { icon: '✓', color: COLORS.green, label: 'SUCCESS' },
            227: { icon: '○', color: COLORS.blue, label: 'NEW' },
            228: { icon: '◌', color: COLORS.yellow, label: 'IN PROGRESS' },
            229: { icon: '✗', color: COLORS.red, label: 'CANCELED' },
            230: { icon: '✗', color: COLORS.red, label: 'FAILED' }
        };

        const status = statusMap[statusCode] || { icon: '?', color: COLORS.reset, label: 'UNKNOWN' };
        console.log(`${status.color}${status.icon}${COLORS.reset} Status: ${status.label} (${statusCode})`);
        
        if (message) {
            console.log(`  ${message}`);
        }
    }

    /**
     * Log configuration details
     */
    config(label, value) {
        if (value !== undefined && value !== null && value !== '') {
            console.log(`  ${COLORS.dim}${label}:${COLORS.reset} ${value}`);
        }
    }

    /**
     * Log a progress update
     */
    progress(message) {
        console.log(`${COLORS.blue}→${COLORS.reset} ${message}`);
    }

    /**
     * Log polling attempt
     */
    polling(attempt, interval) {
        console.log(`${COLORS.dim}Polling status... (attempt ${attempt}, ${interval}s interval)${COLORS.reset}`);
    }
}

module.exports = Logger;
