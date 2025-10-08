const mongoose = require('mongoose')
const config = require('../../../config')
const { logger } = require('../../../shared/logger/logger')

async function connect() {
    try {
        await mongoose.connect(config.mongodbUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })

        logger.info('Connected to MongoDB')

        return mongoose.connection
    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error)
        throw error
    }
}

async function disconnect() {
    await mongoose.disconnect()
    logger.info('Disconnected from MongoDB')
}

// Handle connection events
mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err)
})

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected')
})

module.exports = { connect, disconnect }

