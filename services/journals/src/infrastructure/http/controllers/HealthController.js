const mongoose = require('mongoose')
const { logger } = require('../../../shared/logger/logger')

/**
 * Health Check Controller for Kubernetes Probes
 * 
 * Provides three types of health checks:
 * 1. Liveness - Is the service alive? (basic check)
 * 2. Readiness - Is the service ready to handle requests? (includes DB check)
 * 3. Startup - Has the service started successfully? (for slow startups)
 */
class HealthController {
    constructor() {
        this.startTime = Date.now()
        this.isReady = false
    }

    /**
     * Liveness Probe
     * Returns 200 if the service process is alive
     * Used by Kubernetes to restart unhealthy pods
     */
    liveness = async (req, res) => {
        res.status(200).json({
            status: 'alive',
            service: 'journals',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000)
        })
    }

    /**
     * Readiness Probe
     * Returns 200 if the service can handle requests (including DB connectivity)
     * Used by Kubernetes to determine if pod should receive traffic
     */
    readiness = async (req, res) => {
        try {
            // Check MongoDB connectivity
            const dbState = mongoose.connection.readyState
            // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

            if (dbState === 1) {
                // Verify we can actually query the database
                await mongoose.connection.db.admin().ping()

                this.isReady = true
                return res.status(200).json({
                    status: 'ready',
                    service: 'journals',
                    timestamp: new Date().toISOString(),
                    checks: {
                        database: 'connected'
                    }
                })
            }

            throw new Error(`Database not connected (state: ${dbState})`)
        } catch (error) {
            logger.error('Readiness check failed:', error)
            return res.status(503).json({
                status: 'not_ready',
                service: 'journals',
                timestamp: new Date().toISOString(),
                checks: {
                    database: 'disconnected'
                },
                error: error.message
            })
        }
    }

    /**
     * Startup Probe
     * Returns 200 once the service has fully started
     * Used by Kubernetes to know when to switch to liveness/readiness probes
     */
    startup = async (req, res) => {
        try {
            // Check if service has been running for at least 5 seconds
            const uptime = Date.now() - this.startTime
            if (uptime < 5000) {
                return res.status(503).json({
                    status: 'starting',
                    service: 'journals',
                    timestamp: new Date().toISOString(),
                    uptime: Math.floor(uptime / 1000)
                })
            }

            // Check MongoDB connectivity
            const dbState = mongoose.connection.readyState

            if (dbState === 1) {
                await mongoose.connection.db.admin().ping()

                return res.status(200).json({
                    status: 'started',
                    service: 'journals',
                    timestamp: new Date().toISOString(),
                    uptime: Math.floor(uptime / 1000)
                })
            }

            throw new Error(`Database not ready (state: ${dbState})`)
        } catch (error) {
            logger.error('Startup check failed:', error)
            return res.status(503).json({
                status: 'starting',
                service: 'journals',
                timestamp: new Date().toISOString(),
                error: error.message
            })
        }
    }

    /**
     * Legacy health check (backwards compatibility)
     */
    health = async (req, res) => {
        try {
            const dbState = mongoose.connection.readyState

            if (dbState === 1) {
                await mongoose.connection.db.admin().ping()

                res.status(200).json({
                    status: 'healthy',
                    service: 'journals',
                    timestamp: new Date().toISOString(),
                    uptime: Math.floor((Date.now() - this.startTime) / 1000),
                    checks: {
                        database: 'connected'
                    }
                })
            } else {
                throw new Error(`Database not connected (state: ${dbState})`)
            }
        } catch (error) {
            logger.error('Health check failed:', error)
            res.status(503).json({
                status: 'unhealthy',
                service: 'journals',
                timestamp: new Date().toISOString(),
                error: error.message
            })
        }
    }
}

module.exports = { HealthController }

