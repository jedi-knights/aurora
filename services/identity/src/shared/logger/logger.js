const logger = {
    info: (message) => {
        console.log('[INFO]', typeof message === 'object' ? JSON.stringify(message) : message)
    },

    error: (message) => {
        console.error('[ERROR]', typeof message === 'object' ? JSON.stringify(message) : message)
    },

    warn: (message) => {
        console.warn('[WARN]', typeof message === 'object' ? JSON.stringify(message) : message)
    },

    debug: (message) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('[DEBUG]', typeof message === 'object' ? JSON.stringify(message) : message)
        }
    }
}

module.exports = { logger }

