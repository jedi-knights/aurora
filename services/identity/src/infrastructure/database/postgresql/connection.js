const { Pool } = require('pg')
const config = require('../../../config')
const { logger } = require('../../../shared/logger/logger')

let pool = null

async function connect() {
    if (pool) {
        return pool
    }

    pool = new Pool({
        connectionString: config.databaseUrl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    })

    // Test connection
    try {
        await pool.query('SELECT NOW()')
        logger.info('Connected to PostgreSQL database')
    } catch (error) {
        logger.error('Failed to connect to database:', error)
        throw error
    }

    // Handle errors
    pool.on('error', (err) => {
        logger.error('Unexpected database error:', err)
    })

    return pool
}

async function disconnect() {
    if (pool) {
        await pool.end()
        pool = null
        logger.info('Disconnected from database')
    }
}

module.exports = { connect, disconnect }

